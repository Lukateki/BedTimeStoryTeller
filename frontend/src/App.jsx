import React, { useEffect, useState } from 'react'
import { useStoryGenerator } from './hooks/useStoryGenerator'
import Particles from './components/Particles'
import StoryForm from './components/StoryForm'
import LoadingBook from './components/LoadingBook'
import OpenBook from './components/OpenBook'

export default function App() {
  const { status, loadingStep, story, error, generate, reset } = useStoryGenerator()
  const [genre, setGenre] = useState('fantasy')

  // Track genre for background theming even before story loads
  const activeGenre = story?.genre || genre

  const handleGenerate = (params) => {
    setGenre(params.genre)
    generate(params)
  }

  return (
    <div className="scene" data-genre={activeGenre}>
      {/* Ambient background */}
      <div className="glow-left" />
      <div className="glow-right" />
      <Particles />

      {/* Top bar — only shown when reading */}
      {status === 'ready' && story && (
        <div className="top-bar">
          <div className="top-bar-title">✦ BEDTIME STORIES</div>
          <button className="new-story-btn" onClick={reset}>
            ← New Story
          </button>
        </div>
      )}

      {/* ── IDLE: show form ── */}
      {status === 'idle' && (
        <StoryForm onGenerate={handleGenerate} loading={false} onGenreChange={setGenre}/>
      )}

      {/* ── LOADING: show closed book animating ── */}
      {status === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <LoadingBook
            genre={genre}
            title={null}
            coverImageUrl={null}
          />
          <div className="loading-status">{loadingStep}</div>
        </div>
      )}

      {/* ── READY: show open book ── */}
      {status === 'ready' && story && (
        <OpenBook story={story} />
      )}

      {/* ── ERROR ── */}
      {status === 'error' && (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '20px',
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'var(--font-body)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px' }}>📖</div>
          <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)' }}>
            The story got lost in the ether
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', maxWidth: '320px' }}>
            {error}
          </div>
          <button className="new-story-btn" onClick={reset} style={{ marginTop: '8px' }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
