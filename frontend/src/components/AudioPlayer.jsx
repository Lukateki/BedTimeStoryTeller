import React, { useRef, useState, useEffect } from 'react'

export default function AudioPlayer({ audioContent }) {
  const audioRef  = useRef(null)
  const [playing,  setPlaying]  = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [current,  setCurrent]  = useState(0)

  useEffect(() => {
    if (!audioContent) return
    const src = `data:audio/mp3;base64,${audioContent}`
    if (audioRef.current) {
      audioRef.current.src = src
      audioRef.current.load()
    }
    return () => { setPlaying(false); setProgress(0) }
  }, [audioContent])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else         { audioRef.current.play();  setPlaying(true)  }
  }

  const fmt = (s) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2,'0')}`
  }

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = pct * duration
  }

  return (
    <div className="audio-bar">
      <audio ref={audioRef}
        onTimeUpdate={e => { setCurrent(e.target.currentTime); setProgress((e.target.currentTime/e.target.duration)*100||0) }}
        onLoadedMetadata={e => setDuration(e.target.duration)}
        onEnded={() => setPlaying(false)}
      />

      <button className="audio-btn" onClick={togglePlay}>
        {playing ? '⏸' : '▶'}
      </button>

      <div className="audio-progress-track" onClick={handleProgressClick}>
        <div className="audio-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="audio-time">
        {fmt(current)} / {fmt(duration)}
      </div>
    </div>
  )
}
