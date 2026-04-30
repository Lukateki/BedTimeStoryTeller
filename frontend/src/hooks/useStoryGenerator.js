import { useState, useCallback } from 'react'

const STORY_URL = import.meta.env.VITE_STORY_SERVICE_URL || 'http://localhost:3001'
const IMAGE_URL = import.meta.env.VITE_IMAGE_SERVICE_URL || 'http://localhost:3003'
const TTS_URL   = import.meta.env.VITE_TTS_SERVICE_URL   || 'http://localhost:3002'

export function useStoryGenerator() {
  const [status, setStatus]   = useState('idle')   // idle | loading | ready | error
  const [loadingStep, setLoadingStep] = useState('')
  const [story, setStory]     = useState(null)
  const [error, setError]     = useState(null)

  const generate = useCallback(async ({ prompt, genre, ageGroup, length }) => {
    setStatus('loading')
    setError(null)
    setStory(null)

    try {
      // ── 1. Generate story text ──────────────────────────────────────────
      setLoadingStep('Weaving your story…')
      const storyRes = await fetch(`${STORY_URL}/generate-story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, genre, ageGroup, length }),
      })
      if (!storyRes.ok) throw new Error('Story generation failed')
      const storyData = await storyRes.json()

      // ── 2. Generate cover image ─────────────────────────────────────────
      setLoadingStep('Illustrating the cover…')
      const coverRes = await fetch(`${IMAGE_URL}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: storyData.coverImagePrompt,
          genre, ageGroup, isCover: true,
        }),
      })
      const coverData = coverRes.ok ? await coverRes.json() : { imageUrl: null }

      // ── 3. Generate chapter images in parallel ──────────────────────────
      setLoadingStep('Painting chapter illustrations…')
      const chapterImages = await Promise.allSettled(
        storyData.chapters.map(ch =>
          fetch(`${IMAGE_URL}/generate-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: ch.imagePrompt,
              genre, ageGroup, isCover: false,
            }),
          }).then(r => r.ok ? r.json() : { imageUrl: null })
        )
      )

      const chaptersWithImages = storyData.chapters.map((ch, i) => ({
        ...ch,
        imageUrl: chapterImages[i].status === 'fulfilled'
          ? chapterImages[i].value.imageUrl
          : null,
      }))

      // ── 4. Generate TTS for full story ──────────────────────────────────
      setLoadingStep('Recording the narration…')
      const fullText = storyData.chapters.map(ch => ch.text).join('\n\n')
      const ttsRes = await fetch(`${TTS_URL}/text-to-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, genre, ageGroup }),
      })
      const ttsData = ttsRes.ok ? await ttsRes.json() : { audioContent: null }

      setStory({
        ...storyData,
        chapters: chaptersWithImages,
        coverImageUrl: coverData.imageUrl,
        audioContent: ttsData.audioContent,
        genre, ageGroup,
      })
      setStatus('ready')
      setLoadingStep('')
    } catch (err) {
      setError(err.message)
      setStatus('error')
      setLoadingStep('')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setStory(null)
    setError(null)
    setLoadingStep('')
  }, [])

  return { status, loadingStep, story, error, generate, reset }
}
