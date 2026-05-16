const express = require('express')
const cors = require('cors')

// ── MOCK DATA ──────────────────────────────────────────────────────────────

const MOCK_STORY = {
  title: "Nimbus and the Friendly Forest",
  genre: "fantasy",
  ageGroup: "kids",
  chapters: [
    {
      chapterNumber: 1,
      title: "The Magic Door",
      text: "Once upon a time, in a cozy little town at the edge of an ancient forest, there lived a small fluffy cloud named Nimbus. Nimbus was not like other clouds — he could float down from the sky and walk among the trees whenever he pleased. One crisp autumn morning, Nimbus floated through a golden door that had appeared overnight between two enormous oak trees. The door hummed with a warm purple glow, and from behind it came the faint sound of laughter and music.",
      imagePrompt: "A fluffy white cloud character walking through a glowing golden door in an enchanted forest",
      imageUrl: "https://placehold.co/1024x1024/a8d8a8/2d5a1b?text=Chapter+1",
    },
    {
      chapterNumber: 2,
      title: "The Forest Friends",
      text: "Beyond the door was a world Nimbus had never imagined. Talking mushrooms lined the path, each one a different colour, humming a cheerful tune. A family of foxes with silver tails danced in a clearing, and fireflies spelled out words of welcome in the evening air. A wise old owl named Professor Hoot swooped down from a branch and landed right on Nimbus's fluffy head. 'We have been waiting for you,' the owl said with a wink. 'The forest has a problem only a cloud can solve.'",
      imagePrompt: "Talking colourful mushrooms and silver foxes dancing in an enchanted forest clearing",
      imageUrl: "https://placehold.co/1024x1024/a8d8a8/2d5a1b?text=Chapter+2",
    },
    {
      chapterNumber: 3,
      title: "The Rain of Kindness",
      text: "Professor Hoot explained that the Magic River had run dry, and without it the forest animals had no water to drink. All the other clouds had forgotten how to make rain — they had grown too proud and floated too high. But Nimbus remembered. He closed his eyes, thought of every kind thing he had ever seen, and felt himself grow heavy with the most wonderful rain. It fell softly on the forest, filling the river, making every flower bloom at once. The animals cheered so loudly that the stars came out early just to see what all the fuss was about.",
      imagePrompt: "A fluffy cloud raining gently over a magical forest river while animals celebrate below",
      imageUrl: "https://placehold.co/1024x1024/a8d8a8/2d5a1b?text=Chapter+3",
    },
    {
      chapterNumber: 4,
      title: "Home Before Sunrise",
      text: "As the first light of dawn touched the treetops, Nimbus said goodbye to his new friends. Professor Hoot gave him a tiny golden feather to keep forever. The foxes braided a bracelet of silver grass for his wrist. The mushrooms hummed one last song as the golden door appeared again, glowing softly in the early morning light. Nimbus floated back through, carrying a heart full of warmth. He drifted up into the sky, and if you look carefully on quiet mornings, you can still see him up there — a little fluffier and a little brighter than all the other clouds.",
      imagePrompt: "A fluffy cloud waving goodbye to forest animals at a glowing golden door at sunrise",
      imageUrl: "https://placehold.co/1024x1024/a8d8a8/2d5a1b?text=Chapter+4",
    },
  ],
  coverImagePrompt: "Book cover of a fluffy cloud character in an enchanted forest",
  coverImageUrl: "https://placehold.co/1024x1024/2d5a1b/ffd700?text=Nimbus",
}

// Tiny base64 MP3 (1 second of silence) so the audio player doesn't crash
const MOCK_AUDIO = "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e////////////////////////////////////////////////////////////////AAAAAExhdmM1OC41NAAAAAAAAAAAAAAAACQAAAAAAAAAAAN/GCH/AAAA"

// ── STORY SERVICE (port 3001) ──────────────────────────────────────────────
const storyApp = express()
storyApp.use(cors())
storyApp.use(express.json())

storyApp.get('/health', (req, res) => res.json({ status: 'ok', mock: true }))

storyApp.post('/generate-story', (req, res) => {
  console.log('[MOCK story-service] generating story for:', req.body.prompt)
  // Simulate network delay
  setTimeout(() => {
    res.json({
      ...MOCK_STORY,
      genre:    req.body.genre    || MOCK_STORY.genre,
      ageGroup: req.body.ageGroup || MOCK_STORY.ageGroup,
    })
  }, 800)
})

storyApp.listen(3001, () => console.log('🟢 Mock story-service   → http://localhost:3001'))

// ── TTS SERVICE (port 3002) ────────────────────────────────────────────────
const ttsApp = express()
ttsApp.use(cors())
ttsApp.use(express.json())

ttsApp.get('/health', (req, res) => res.json({ status: 'ok', mock: true }))

ttsApp.post('/text-to-speech', (req, res) => {
  console.log('[MOCK tts-service] synthesizing', req.body.text?.length, 'chars')
  setTimeout(() => {
    res.json({ audioContent: MOCK_AUDIO, voice: 'mock' })
  }, 400)
})

ttsApp.listen(3002, () => console.log('🟢 Mock tts-service     → http://localhost:3002'))

// ── IMAGE SERVICE (port 3003) ──────────────────────────────────────────────
const imageApp = express()
imageApp.use(cors())
imageApp.use(express.json())

imageApp.get('/health', (req, res) => res.json({ status: 'ok', mock: true }))

imageApp.post('/generate-image', (req, res) => {
  console.log('[MOCK image-service] generating image for:', req.body.prompt?.slice(0, 60))
  const isCover = req.body.isCover
  setTimeout(() => {
    res.json({
      imageUrl: isCover
        ? 'https://placehold.co/1024x1024/2d5a1b/ffd700?text=Cover'
        : 'https://placehold.co/1024x1024/a8d8a8/2d5a1b?text=Illustration',
    })
  }, 300)
})

imageApp.listen(3003, () => console.log('🟢 Mock image-service   → http://localhost:3003'))