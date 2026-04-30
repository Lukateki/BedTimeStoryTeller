import React from 'react'

export default function LoadingBook({ genre, title, coverImageUrl }) {
  const hasCover = !!coverImageUrl

  return (
    <div className="loading-book-wrapper">
      <div className="book-closed" style={{ cursor: 'default' }}>
        <div className="book-spine-closed" />
        <div className="book-cover-front">
          {hasCover ? (
            <img src={coverImageUrl} alt="cover" className="cover-image-preview"
              style={{ animation: 'fadeUp 0.5s ease both' }} />
          ) : (
            <div className="cover-page-drawing" />
          )}
          <div className="cover-ornament" />
          <div className="cover-title-preview">
            {title || '✦'}
          </div>
        </div>
      </div>
    </div>
  )
}
