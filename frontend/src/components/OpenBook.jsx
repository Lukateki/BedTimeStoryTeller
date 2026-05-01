import React, { useState } from 'react'
import AudioPlayer from './AudioPlayer'

export default function OpenBook({ story }) {
  const { title, chapters, coverImageUrl, audioContent, genre, ageGroup } = story
  // page 0 = cover spread, page 1..N = chapter spreads
  const totalPages = chapters.length
  const [page, setPage] = useState(0)
  const [flipping, setFlipping] = useState(false)
  const [phase, setPhase] = useState('cover')

  const turnPage = (dir) => {
    if (flipping) return
    const next = page + dir
    if (next < 0 || next >= totalPages) return
    setFlipping(true)
    setTimeout(() => { setPage(next); setFlipping(false) }, 320)
  }

  // Cover spread
  const chapter = chapters[page]

  const openBook = () => {
    if (phase !== 'cover') return
    setPhase('shrinking')
    setTimeout(() => setPhase('opening'), 600)
    setTimeout(() => setPhase('reading'), 1200)
  }

  const closeBook = () => {
    setPhase('closing')
    setTimeout(() => setPhase('cover'), 600)
  }

  if (phase === 'cover' || phase === 'shrinking' || phase === 'opening' || phase === 'closing') {
    return (
      <div className="book-stage">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            {/* Right page — sits behind, flush to the right of the cover */}
            {phase === 'opening' && (
              <div style={{
                position: 'relative',
                top: 60,
                left: 500,
                width: '340px',
                height: '480px',
                background: 'var(--book-page)',
                borderRadius: '0 8px 8px 0',
                boxShadow: '8px 0 20px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 0,
              }}>
                {chapters[0].imageUrl && (
                  <img
                    src={chapters[0].imageUrl}
                    alt={chapters[0].title}
                    className="illustration-img"
                  />
                )}
              </div>
            )}

            {/* The closed book cover — sits on top of the right page */}
            <div
              className={`book-closed ${
                phase === 'shrinking' || phase === 'opening' ? 'book-shrinking' :
                phase === 'closing' ? 'book-closing' : ''
              }`}
              onClick={openBook}
              style={{
                cursor: phase === 'cover' ? 'pointer' : 'default',
                transform: phase === 'cover' ? 'scale(1.4)' : undefined,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div className="book-spine-closed" />
              <div className={`book-cover-wrapper ${phase === 'opening' ? 'book-cover-peeling' : ''}`}>
                <div className="book-cover-front book-face-front">
                  {coverImageUrl
                    ? <img src={coverImageUrl} alt={title} className="cover-image-preview" />
                    : <div className="cover-page-drawing" />
                  }
                  <div className="cover-ornament" />
                  <div className="cover-title-preview">{title}</div>
                </div>
                <div className="book-cover-front book-face-back">
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-body)', fontSize: '13px',
                    fontStyle: 'italic', color: '#aaa',
                  }}>
                    ✦
                  </div>
                </div>
              </div>
            </div>
          </div>

          {phase === 'cover' && (
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px', fontStyle: 'italic',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '1px',
              animation: 'pulse 2.5s ease-in-out infinite',
            }}>
              Click the cover to open
            </div>
          )}

          {audioContent && <AudioPlayer audioContent={audioContent} />}
        </div>
      </div>
    )
  }

  return (
    <div className="book-stage">
      <div 
        className={`book-open${flipping ? ' page-flip-enter' : ''}`}
        style={{ animation: 'book-open-reveal 0.8s var(--ease-out) both' }}
      >
        {/* LEFT PAGE */}
        <div className="page page-left">
            <ChapterTextPage chapter={chapter} pageNum={page * 2 +1} />
        </div>

        {/* SPINE */}
        <div className="book-spine-open" />

        {/* RIGHT PAGE */}
        <div className="page page-right">
            <ChapterImagePage chapter={chapter} pageNum={page * 2 +2} />
        </div>
      </div>

      {/* Nav */}
      <div className="nav-controls">
        <button className="nav-btn" 
        onClick={() => page === 0 ? closeBook() : turnPage(-1)}>
          ‹
        </button>
        <div className="nav-page-info">
          Ch. {page + 1} of {totalPages}
        </div>
        <button className="nav-btn" 
        onClick={() => turnPage(1)}
        disabled={page >= totalPages - 1}
        >
          ›
        </button>
      </div>

      {/* Audio player */}
      {audioContent && <AudioPlayer audioContent={audioContent} />}
    </div>
  )
}

function ChapterTextPage({ chapter, pageNum }) {
  return (
    <>
      <div className="chapter-number">Chapter {chapter.chapterNumber}</div>
      <div className="chapter-title">{chapter.title}</div>
      <div className="chapter-divider" />
      <div className="story-text">{chapter.text}</div>
      <div className="page-number" style={{ left: '32px' }}>{pageNum}</div>
    </>
  )
}

function ChapterImagePage({ chapter, pageNum }) {
  return (
    <>
      <div className="illustration-container">
        {chapter.imageUrl ? (
          <>
            <img src={chapter.imageUrl} alt={chapter.title} className="illustration-img" />
            <div className="illustration-caption">{chapter.title}</div>
          </>
        ) : (
          <div className="illustration-loading" />
        )}
      </div>
      <div className="page-number" style={{ right: '32px' }}>{pageNum}</div>
    </>
  )
}
