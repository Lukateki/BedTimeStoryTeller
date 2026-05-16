import React, { useState, useRef, useCallback, useEffect } from 'react'
import { flushSync } from 'react-dom'
import AudioPlayer from './AudioPlayer'

/*
 * ── BOOK MODEL ──────────────────────────────────────────────────────────────
 *
 * The classic "single flipping leaf" technique — the most robust way to get a
 * clean, perfectly-centred page turn that scales to any screen.
 *
 *   • The book always shows ONE fixed spread underneath: a left + right page.
 *   • On top of that, exactly ONE leaf rotates around the spine during a turn.
 *     Its two faces are painted so the page you leave and the page you arrive
 *     at line up seamlessly.
 *
 * `spread` = reading position:
 *     0            → closed (cover facing you)
 *     1 .. total   → reading chapter `spread`
 *     total + 1    → back cover (finished, closed on the left)
 *
 * Opening the book is just the first leaf-turn — ONE animation system for
 * everything, so there is no separate hard-coded "open" scene.
 *
 * For chapter c the spread is:  left = c's TEXT,  right = c's ILLUSTRATION.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * ── FLIP ENGINE ─────────────────────────────────────────────────────────────
 * `flip` state, when non-null, describes the leaf currently turning:
 *     { dir, rot, mode }
 *       dir  : +1 forward, -1 backward
 *       rot  : current Y-rotation in degrees (0 → -180 over a forward turn)
 *       mode : 'drag'  — rot is driven live by the pointer, NO css transition
 *              'anim'  — rot is a target the css transition eases toward
 *
 * Committing a turn: we `flushSync` the leaf onto screen at its START
 * rotation with the transition OFF (forcing a real paint), then after a
 * double `requestAnimationFrame` switch to the END rotation with the
 * transition ON. The browser therefore sees a genuine start→end change and
 * always eases it — no skipped frames. Completion is signalled by the leaf's
 * own `transitionend` event, with a self-correcting `setTimeout` (read from
 * the live `--flip-ms`) only as a safety net.
 * ───────────────────────────────────────────────────────────────────────────
 */

const FLIP_MS = 720

export default function OpenBook({ story }) {
  const { title, chapters, coverImageUrl, audioContent } = story
  const total = chapters.length
  const LAST = total + 1 // back-cover position

  const [spread, setSpread] = useState(0)
  const [flip, setFlip] = useState(null) // { dir, rot, mode } | null
  // `pastHalf` tracks whether the leaf has rotated past edge-on (90°) so the
  // underneath spread and the stage visual state can switch from source to
  // destination at the right moment. For drag mode we derive it live from
  // the rotation; for the CSS-animated phase we set it via a midpoint timer
  // (the rotation state value jumps to the target rotation immediately, so
  // we can't read the live rotation from React state during the animation).
  const [pastHalfAnim, setPastHalfAnim] = useState(false)

  const stageRef = useRef(null)
  const leafRef = useRef(null)
  const pointer = useRef(null)
  const rafRef = useRef(null)
  const commitTimer = useRef(null)
  const halfTimer = useRef(null)

  const isClosed = spread === 0
  const isEnd = spread === LAST
  const canForward = spread < LAST
  const canBack = spread > 0
  const busy = !!flip && flip.mode === 'anim'

  const clearTimers = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (commitTimer.current) clearTimeout(commitTimer.current)
    if (halfTimer.current) clearTimeout(halfTimer.current)
    rafRef.current = null
    commitTimer.current = null
    halfTimer.current = null
  }

  // the callback to fire when the current turn's transition completes
  const onTurnDone = useRef(null)

  /* finishTurn — fire the queued completion callback exactly once */
  const finishTurn = useCallback(() => {
    clearTimers()
    setPastHalfAnim(false)
    const done = onTurnDone.current
    onTurnDone.current = null
    if (done) done()
  }, [])

  /* ────────────────────────────────────────────────────────────────────
   * runTurn — the shared engine for both committing and cancelling a turn.
   *
   *   1. flushSync the leaf onto the screen at `startRot` with NO transition,
   *      so the browser actually PAINTS the start frame.
   *   2. After two animation frames (guaranteeing that paint happened),
   *      switch to `endRot` WITH the transition — the browser now sees a
   *      genuine start→end change and eases it smoothly.
   *   3. Completion is driven by the leaf's `transitionend` event (see
   *      `handleLeafTransitionEnd`), so the JS commits the new page exactly
   *      when the CSS animation actually finishes — the two can never drift.
   *      A `setTimeout` slightly longer than the transition is kept purely
   *      as a safety net (e.g. if the event is missed, or the transition is
   *      0ms under prefers-reduced-motion).
   * ──────────────────────────────────────────────────────────────────── */
  const runTurn = useCallback(
    (dir, startRot, endRot, onDone) => {
      clearTimers()
      onTurnDone.current = onDone

      // pastHalfAnim starts reflecting where the leaf BEGINS, then a midpoint
      // timer flips it once the leaf crosses the 90° point during the CSS
      // transition. If the leaf is already past 90° at start, we set it true
      // immediately and no timer fires.
      const startedPast = Math.abs(startRot) >= 90
      const willEndPast = Math.abs(endRot) >= 90
      setPastHalfAnim(startedPast)

      // 1) paint the start frame synchronously, transition OFF
      flushSync(() => {
        setFlip({ dir, rot: startRot, mode: 'drag' })
      })

      // 2) after a real paint, enable the transition and go to the end
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setFlip({ dir, rot: endRot, mode: 'anim' })
        })
      })

      // duration from the live --flip-ms (works under slow-motion / reduced
      // motion overrides too)
      let ms = FLIP_MS
      const cssVar = getComputedStyle(document.documentElement)
        .getPropertyValue('--flip-ms')
        .trim()
      if (cssVar) {
        const parsed = cssVar.endsWith('ms')
          ? parseFloat(cssVar)
          : parseFloat(cssVar) * 1000
        if (!Number.isNaN(parsed) && parsed > 0) ms = parsed
      }
      const span = Math.abs(endRot - startRot) / 180
      const dur = ms * span

      // schedule the midpoint flip if the leaf will cross 90° during this turn
      if (startedPast !== willEndPast && dur > 0) {
        const toCross = (Math.abs(-90 - startRot) / Math.abs(endRot - startRot)) * dur
        if (toCross > 0 && toCross < dur) {
          halfTimer.current = setTimeout(() => {
            setPastHalfAnim(willEndPast)
            halfTimer.current = null
          }, toCross)
        } else {
          // crossing happens immediately or never within the turn
          setPastHalfAnim(willEndPast)
        }
      } else {
        setPastHalfAnim(willEndPast)
      }

      // safety fallback for completion (transitionend is the real signal)
      commitTimer.current = setTimeout(finishTurn, dur + 150)
    },
    [finishTurn]
  )

  /* the leaf tells us, via the real CSS event, that its turn has landed */
  const handleLeafTransitionEnd = useCallback(
    (e) => {
      // only the leaf's own transform transition counts
      if (e.target !== leafRef.current || e.propertyName !== 'transform') return
      finishTurn()
    },
    [finishTurn]
  )

  /* ────────────────────────────────────────────────────────────────────
   * commitTurn — animate a turn through to the next/prev spread.
   * `fromRot` lets a released drag continue smoothly from where it was.
   * ──────────────────────────────────────────────────────────────────── */
  const commitTurn = useCallback(
    (dir, fromRot) => {
      if (dir > 0 && spread >= LAST) return
      if (dir < 0 && spread <= 0) return
      const startRot = fromRot != null ? fromRot : dir > 0 ? 0 : -180
      const endRot = dir > 0 ? -180 : 0
      runTurn(dir, startRot, endRot, () => {
        setSpread((s) => s + dir)
        setFlip(null)
      })
    },
    [spread, LAST, runTurn]
  )

  /* cancelTurn — spring the leaf back to where it started, no spread change */
  const cancelTurn = useCallback(
    (dir, fromRot) => {
      const startRot = fromRot != null ? fromRot : dir > 0 ? -180 : 0
      const backRot = dir > 0 ? 0 : -180
      runTurn(dir, startRot, backRot, () => {
        setFlip(null)
      })
    },
    [runTurn]
  )

  const go = useCallback(
    (dir) => {
      if (busy) return
      commitTurn(dir)
    },
    [busy, commitTurn]
  )

  /* ────────────────────────────────────────────────────────────────────
   * Drag / swipe.
   *
   * On pointer-down we record the start, then attach move/up listeners to
   * `window`. Window listeners reliably receive every pointer event for the
   * whole gesture — independent of pointer capture, re-renders, or which
   * element the pointer happens to be over. This is the robust drag pattern.
   *
   * The actual listener functions live in refs so they have a stable
   * identity for add/removeEventListener, while still closing over fresh
   * state through `handlersRef`.
   * ──────────────────────────────────────────────────────────────────── */
  const handlersRef = useRef({})

  const detachGesture = () => {
    window.removeEventListener('pointermove', winMove)
    window.removeEventListener('pointerup', winUp)
    window.removeEventListener('pointercancel', winUp)
  }

  // stable listener: pointer move
  const winMove = useRef((e) => {
    const p = pointer.current
    if (!p) return
    const dx = e.clientX - p.startX
    const dy = e.clientY - p.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) p.moved = true

    if (!p.decided) {
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return
      p.dir = dx < 0 ? 1 : -1 // drag left ⇒ turn forward
      if ((p.dir > 0 && !p.canForward) || (p.dir < 0 && !p.canBack)) {
        // can't turn that way — abandon the gesture
        pointer.current = null
        detachGesture()
        return
      }
      p.decided = true
    }

    const half = p.width / 2
    const prog = Math.min(1, Math.max(0, Math.abs(dx) / half))
    p.prog = prog
    const rot = p.dir > 0 ? -180 * prog : -180 * (1 - prog)

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      setFlip({ dir: p.dir, rot, mode: 'drag' })
    })
  }).current

  // stable listener: pointer up / cancel
  const winUp = useRef(() => {
    const p = pointer.current
    pointer.current = null
    detachGesture()
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (!p || !p.decided) {
      // not a real drag — treat a tap on the closed cover as "open"
      if (p && p.wasClosed && !p.moved) handlersRef.current.commitTurn(1)
      else setFlip((f) => (f && f.mode === 'drag' ? null : f))
      return
    }
    const rot = p.dir > 0 ? -180 * p.prog : -180 * (1 - p.prog)
    // commit if dragged past ~30% of the way; otherwise spring back
    if (p.prog > 0.3) handlersRef.current.commitTurn(p.dir, rot)
    else handlersRef.current.cancelTurn(p.dir, rot)
  }).current

  // keep the refs' access to the latest commit/cancel closures
  handlersRef.current.commitTurn = commitTurn
  handlersRef.current.cancelTurn = cancelTurn

  const onPointerDown = (e) => {
    if (busy) return
    if (e.target.closest('.nav-controls, .audio-bar')) return
    // let the text column scroll if it actually overflows
    const textEl = e.target.closest('.story-text')
    if (textEl && textEl.scrollHeight > textEl.clientHeight + 2) return

    const rect = stageRef.current.getBoundingClientRect()
    pointer.current = {
      startX: e.clientX,
      startY: e.clientY,
      width: rect.width,
      decided: false,
      dir: 0,
      prog: 0,
      moved: false,
      wasClosed: isClosed,
      canForward,
      canBack,
    }
    window.addEventListener('pointermove', winMove)
    window.addEventListener('pointerup', winUp)
    window.addEventListener('pointercancel', winUp)
  }

  /* keyboard navigation */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      } else if (e.key === ' ') {
        e.preventDefault()
        go(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  useEffect(() => {
    return () => {
      clearTimers()
      detachGesture()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ────────────────────────────────────────────────────────────────────
   * What to paint.
   *
   * Two underneath pages sit beneath the flipping leaf. To make a turn
   * feel physical we use the page-flip-library convention:
   *
   *   forward flip   left underneath = CURRENT chapter (still visible
   *                                    until the leaf lands on it)
   *                  right underneath = DESTINATION chapter (was hidden
   *                                    by the leaf at rot=0; revealed as
   *                                    the leaf rotates away)
   *
   *   backward flip  mirror — left = destination, right = current
   *
   *   at rest        both = current
   *
   * Visual state of the stage (`is-closed` / `is-open` / `is-ended`) also
   * follows the flip phase, not the committed `spread`: we stay in the
   * SOURCE visual state until the leaf has rotated past 90° (it's edge-on
   * there, so the swap is invisible), then snap to the DESTINATION visual
   * state. This is what keeps the closed book looking closed during the
   * first half of the opening turn, and the same trick lets the book
   * "close" cleanly into the back cover at the end.
   * ──────────────────────────────────────────────────────────────────── */
  const chapterAt = (s) => (s >= 1 && s <= total ? chapters[s - 1] : null)

  // resting content for any spread value
  const resolveLeft = (s) => {
    if (s <= 0) return <Endpaper />
    if (s >= LAST) return <BackCover title={title} />
    return <PageText chapter={chapterAt(s)} />
  }
  const resolveRight = (s) => {
    if (s <= 0)
      return (
        <CoverFace
          title={title}
          coverImageUrl={coverImageUrl}
          showHint={!flip}
        />
      )
    if (s >= LAST) return <Endpaper />
    return <PageImage chapter={chapterAt(s)} />
  }

  // destination spread for the in-flight flip (clamped just in case)
  const destSpread = flip
    ? Math.max(0, Math.min(LAST, spread + flip.dir))
    : spread

  // underneath content
  let leftContent
  let rightContent
  if (flip && flip.dir > 0) {
    leftContent = resolveLeft(spread)
    rightContent = resolveRight(destSpread)
  } else if (flip && flip.dir < 0) {
    leftContent = resolveLeft(destSpread)
    rightContent = resolveRight(spread)
  } else {
    leftContent = resolveLeft(spread)
    rightContent = resolveRight(spread)
  }

  // flipping-leaf faces — front sits on the RIGHT pre-turn, back on the LEFT post-turn
  let leafFront = null
  let leafBack = null
  let leafIsCover = false

  if (flip) {
    if (flip.dir > 0) {
      // forward: leaving `spread`, arriving at `spread + 1`
      if (isClosed) {
        leafIsCover = true
        leafFront = <CoverFace title={title} coverImageUrl={coverImageUrl} />
        leafBack = <PageText chapter={chapterAt(1)} />
      } else if (spread === total) {
        leafIsCover = true
        leafFront = <PageImage chapter={chapterAt(total)} />
        leafBack = <BackCover title={title} />
      } else {
        leafFront = <PageImage chapter={chapterAt(spread)} />
        leafBack = <PageText chapter={chapterAt(spread + 1)} />
      }
    } else {
      // backward: leaving `spread`, arriving at `spread - 1`
      if (spread === 1) {
        leafIsCover = true
        leafFront = <CoverFace title={title} coverImageUrl={coverImageUrl} />
        leafBack = <PageText chapter={chapterAt(1)} />
      } else if (isEnd) {
        leafIsCover = true
        leafFront = <PageImage chapter={chapterAt(total)} />
        leafBack = <BackCover title={title} />
      } else {
        leafFront = <PageImage chapter={chapterAt(spread - 1)} />
        leafBack = <PageText chapter={chapterAt(spread)} />
      }
    }
  }

  const leafRot = flip ? flip.rot : 0
  // gloss peaks when the leaf is edge-on (≈90°)
  const gloss = flip ? Math.sin((Math.abs(leafRot) / 180) * Math.PI) : 0
  const dragging = !!flip && flip.mode === 'drag'

  // visual stage state — follows source until the leaf passes 90°
  const stateFor = (s) =>
    s <= 0 ? 'is-closed' : s >= LAST ? 'is-ended' : 'is-open'
  // for drag mode we have the live rotation; for the CSS-animated phase we
  // rely on the midpoint timer-driven flag
  const pastHalf = flip
    ? dragging
      ? Math.abs(leafRot) >= 90
      : pastHalfAnim
    : false
  const stageState = flip
    ? pastHalf
      ? stateFor(destSpread)
      : stateFor(spread)
    : stateFor(spread)

  // While a cover-flip is in progress (either direction between spread 0
  // and 1, or between spread `total` and LAST), keep the opposite page
  // slot fully hidden — otherwise the user sees the open spread reveal
  // itself partway through the cover rotation. The opacity transition on
  // .page handles the fade-in once the flip lands and the class is removed.
  const hideLeftPage = flip && (spread === 0 || destSpread === 0)
  const hideRightPage = flip && (spread === LAST || destSpread === LAST)

  return (
    <>
      <div className="book-viewport">
        <div
          className={[
            'book3d',
            stageState,
            dragging ? 'is-dragging' : '',
            hideLeftPage ? 'hide-left-page' : '',
            hideRightPage ? 'hide-right-page' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          ref={stageRef}
          onPointerDown={onPointerDown}
          onClick={() => {
            if (!flip && !pointer.current) {
              // tapping a closed book opens / re-opens it
              if (isClosed) go(1)
              else if (isEnd) go(-1)
            }
          }}
          role="application"
          aria-label={`${title} — interactive storybook`}
        >
          {/* back board — gives the open book physical depth */}
          <div className="book-board" />

          {/* fixed spread underneath */}
          <div className="spread">
            <div className="page page-left">{leftContent}</div>
            <div className="spine" />
            <div className="page page-right">{rightContent}</div>
          </div>

          {/* the single flipping leaf */}
          {flip && (
            <div
              ref={leafRef}
              className={[
                'flip-leaf',
                flip.mode === 'anim' ? 'flip-leaf-anim' : '',
                leafIsCover ? 'flip-leaf-cover' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ transform: `rotateY(${leafRot}deg)` }}
              onTransitionEnd={handleLeafTransitionEnd}
            >
              <div className="flip-face flip-front">
                {/* render the visible face only — Chrome's backface culling is
                    unreliable for nested content (especially images), so we
                    explicitly drop the content of whichever face is turned
                    away from the viewer */}
                {!pastHalf && leafFront}
                <div
                  className="leaf-gloss leaf-gloss-front"
                  style={{ opacity: gloss * 0.5 }}
                />
              </div>
              <div className="flip-face flip-back">
                {pastHalf && leafBack}
                <div
                  className="leaf-gloss leaf-gloss-back"
                  style={{ opacity: gloss * 0.5 }}
                />
              </div>
            </div>
          )}

          {/* shadow the turning leaf casts into the gutter */}
          {flip && (
            <div className="gutter-shadow" style={{ opacity: gloss * 0.32 }} />
          )}
        </div>

        {/* navigation */}
        {!isClosed && (
          <div className="nav-controls">
            <button
              className="nav-btn"
              onClick={() => go(-1)}
              disabled={!canBack || busy}
              aria-label="Previous page"
            >
              ‹
            </button>
            <div className="nav-page-info">
              {isEnd ? 'The End' : `Chapter ${spread} of ${total}`}
            </div>
            <button
              className="nav-btn"
              onClick={() => go(1)}
              disabled={!canForward || busy}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}
      </div>
      {audioContent && <AudioPlayer audioContent={audioContent} />}
    </>
    
  )
}

/* ── faces ─────────────────────────────────────────────────────────────── */

function CoverFace({ title, coverImageUrl, showHint }) {
  return (
    <div className="cover-face">
      <div className="cover-inner-frame" />
      {coverImageUrl ? (
        <img src={coverImageUrl} alt={title} className="cover-art" />
      ) : (
        <div className="cover-art cover-art-blank" />
      )}
      <div className="cover-rule" />
      <div className="cover-name">{title}</div>
      {showHint && <div className="cover-hint">tap or drag to open</div>}
    </div>
  )
}

/* The inside of the back cover — shown once the last page has been turned. */
function BackCover({ title }) {
  return (
    <div className="cover-face cover-face-back">
      <div className="cover-inner-frame" />
      <div className="back-cover-end">The End</div>
      <div className="cover-rule" />
      <div className="back-cover-title">{title}</div>
      <div className="cover-hint">tap or drag to re-open</div>
    </div>
  )
}

function PageText({ chapter }) {
  if (!chapter) return <Endpaper />
  return (
    <div className="page-pad page-text-pad">
      <div className="chapter-number">Chapter {chapter.chapterNumber}</div>
      <div className="chapter-title">{chapter.title}</div>
      <div className="chapter-divider" />
      <div className="story-text">{chapter.text}</div>
      <div className="page-number page-number-left">
        {chapter.chapterNumber * 2 - 1}
      </div>
    </div>
  )
}

function PageImage({ chapter }) {
  if (!chapter) return <Endpaper />
  return (
    <div className="page-pad page-image-pad">
      <div className="illustration-container">
        {chapter.imageUrl ? (
          <>
            <img
              src={chapter.imageUrl}
              alt={chapter.title}
              className="illustration-img"
            />
            <div className="illustration-caption">{chapter.title}</div>
          </>
        ) : (
          <div className="illustration-loading" />
        )}
      </div>
      <div className="page-number page-number-right">
        {chapter.chapterNumber * 2}
      </div>
    </div>
  )
}

function Endpaper() {
  return <div className="endpaper" />
}
