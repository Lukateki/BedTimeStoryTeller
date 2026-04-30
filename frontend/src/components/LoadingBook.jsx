import React from 'react'
import WizardWand from './WizardWand'

export default function LoadingBook({ genre, title, coverImageUrl }) {
  const hasCover = !!coverImageUrl

  return (
    <div className="loading-book-wrapper">
      <div style={{
        position: 'relative',
        width: 238,
        height: 310,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Wand sits on top, doesn't block clicks */}
        <div style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
        }}>
          <WizardWand />
        </div>

        {/* Book */}
        <div className="book-closed" style={{ cursor: 'default', position: 'relative', zIndex: 1 }}>
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
      </div>
      
    </div>
  )
}
