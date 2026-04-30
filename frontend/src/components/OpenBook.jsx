import React, { useState, useEffect } from 'react'
import AudioPlayer from './AudioPlayer'

export default function OpenBook({ story }) {
  const { title, chapters, coverImageUrl, audioContent, genre, ageGroup } = story
  // page 0 = cover spread, page 1..N = chapter spreads
  const totalPages = chapters.length
  const [page, setPage] = useState(-1)
  const [opened, setOpened] = useState(false)
  const [flipping, setFlipping] = useState(false)

  const turnPage = (dir) => {
    if (flipping) return
    const next = page + dir
    if (next < 0 || next > totalPages) return
    setFlipping(true)
    setTimeout(() => { setPage(next); setFlipping(false) }, 320)
  }

  // Cover spread
  const isCover = page === -1
  const chapter = chapters[page]

  const openBook = () => {
    if (opened) return
    setOpened(true)
    setTimeout(() => setPage(0), 50)
  }

  if(page === -1){
    return (
      <div className="book-stage">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div
            className="book-closed"
            onClick={openBook}
            style={{ cursor: 'pointer' }}
          >
            <div className="book-spine-closed" />
            <div className="book-cover-front">
              {coverImageUrl
                ? <img src={coverImageUrl} alt={title} className="cover-image-preview"
                    style={{ width: '140px', height: '140px' }} />
                : <div className="cover-page-drawing" style={{ width: '140px', height: '140px' }} />
              }
              <div className="cover-ornament" />
              <div className="cover-title-preview">{title}</div>
            </div>
          </div>

          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px', fontStyle: 'italic',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '1px',
            animation: 'pulse 2.5s ease-in-out infinite',
          }}>
            Click the cover to begin reading
          </div>

          {audioContent && <AudioPlayer audioContent={audioContent} />}
        </div>
      </div>
    )
  }

  return (
    <div className="book-stage">
      <div className={`book-open${flipping ? ' page-flip-enter' : ''}`}>
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
        onClick={() => page === 0 ? (setPage(-1), setOpened(false)) : turnPage(-1)}>
          ‹
        </button>
        <div className="nav-page-info">
          {isCover ? 'Cover' : `Ch. ${page+1} of ${totalPages}`}
        </div>
        <button className="nav-btn" 
        onClick={() => page === totalPages-1 ? (setPage(-1), setOpened(false)) : turnPage(1)}>
          ›
        </button>
      </div>

      {/* Audio player */}
      {audioContent && <AudioPlayer audioContent={audioContent} />}
    </div>
  )
}

function CoverLeftPage({ title, genre, totalChapters }) {
  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
        <div style={{
          fontFamily: 'var(--font-title)', fontSize: '11px',
          letterSpacing: '3px', color: '#bbb', textTransform: 'uppercase',
          textAlign: 'center',
        }}>A Bedtime Story</div>

        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '28px',
          fontWeight: 700, color: 'var(--ink-color)',
          textAlign: 'center', lineHeight: 1.3,
        }}>
          {title}
        </div>

        <div style={{
          width: '60px', height: '1px', margin: '0 auto',
          background: 'linear-gradient(to right, transparent, var(--book-gold), transparent)',
        }} />

        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '12px',
          color: '#999', textAlign: 'center', fontStyle: 'italic',
          lineHeight: 1.6,
        }}>
          {totalChapters} chapters<br />
          <span style={{ textTransform: 'capitalize' }}>{genre}</span>
        </div>

        <div style={{
          marginTop: '32px',
          fontFamily: 'var(--font-body)', fontSize: '11px',
          color: '#bbb', textAlign: 'center', fontStyle: 'italic',
        }}>
          Turn the page to begin…
        </div>
      </div>
      <div className="page-number" style={{ left: '32px' }}>i</div>
    </>
  )
}

function CoverRightPage({ coverImageUrl, title }) {
  return (
    <>
      <div className="cover-page-content">
        {coverImageUrl
          ? <img src={coverImageUrl} alt={title} className="cover-page-image" />
          : <div className="cover-page-drawing" />
        }
        <div className="cover-page-ornament" />
        <div className="cover-page-title">{title}</div>
      </div>
      <div className="page-number" style={{ right: '32px' }}>ii</div>
    </>
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
