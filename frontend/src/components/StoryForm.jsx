import React, { useState } from 'react'
import { getGenres, LENGTHS } from '../utils/genres'

export default function StoryForm({ onGenerate, loading, genre, onGenreChange }) {
  const [prompt,   setPrompt]   = useState('')
  const [ageGroup, setAgeGroup] = useState('kids')
  const [length,   setLength]   = useState('medium')

  const availableGenres = getGenres(ageGroup)

  // If current genre becomes unavailable (kids mode), reset it
  const handleAgeChange = (age) => {
    setAgeGroup(age)
    if (age === 'kids') {
      const genres = getGenres('kids')
      if (!genres.find(g => g.id === genre)) onGenreChange('fantasy')
    }
  }

  const handleSubmit = () => {
    if (!prompt.trim() || loading) return
    onGenerate({ prompt, genre, ageGroup, length })
  }

  return (
    <div className="prompt-scene">
      <div>
        <div className="app-title">The Mystical<br />Book of Nimbus</div>
        <div className="app-subtitle"><br/><br/>powered by imagination & AI</div>
      </div>

      <div className="form-card">
        {/* Age group */}
        <div className="form-group">
          <div className="form-label">For whom?</div>
          <div className="age-toggle">
            {[{id:'kids',label:'👶 Children'},{id:'adults',label:'🌙 Adults'}].map(a => (
              <button key={a.id} className={`age-btn${ageGroup===a.id?' active':''}`}
                onClick={() => handleAgeChange(a.id)}>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Genre */}
        <div className="form-group">
          <div className="form-label">Genre</div>
          <div className="genre-grid">
            {availableGenres.map(g => (
              <button key={g.id}
                className={`genre-btn${genre===g.id?' active':''}`}
                onClick={() => onGenreChange(g.id)}>
                <span className="genre-emoji">{g.emoji}</span>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div className="form-group">
          <div className="form-label">Story idea</div>
          <input
            className="form-input"
            type="text"
            placeholder={
              ageGroup === 'kids'
                ? 'e.g. a brave bunny who finds a magic carrot…'
                : 'e.g. a knight who falls in love with a dragon…'
            }
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {/* Length */}
        <div className="form-group">
          <div className="form-label">Length</div>
          <div className="form-row">
            {LENGTHS.map(l => (
              <button key={l.id}
                className={`genre-btn${length===l.id?' active':''}`}
                style={{ flex: 1 }}
                onClick={() => setLength(l.id)}>
                <span style={{fontSize:'12px',fontWeight:600}}>{l.label}</span>
                <span style={{fontSize:'10px',opacity:0.6}}>{l.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="generate-btn"
          onClick={handleSubmit}
          disabled={!prompt.trim() || loading}
        >
          {loading ? 'Creating…' : 'Tell Me a Story'}
        </button>
      </div>
    </div>
  )
}
