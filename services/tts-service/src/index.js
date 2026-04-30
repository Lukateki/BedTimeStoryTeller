require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Voice selection based on genre/age for atmosphere
const VOICE_MAP = {
  kids:      'nova',     // warm, friendly female
  fantasy:   'onyx',     // deep, dramatic
  scifi:     'echo',     // clear, slightly robotic feel
  fairytale: 'shimmer',  // soft, storytelling
  horror:    'fable',    // measured, unsettling
  default:   'alloy',    // neutral, clear
};

app.post('/text-to-speech', async (req, res) => {
  const { text, genre = 'default', ageGroup = 'kids' } = req.body;

  const voice = ageGroup === 'kids' ? VOICE_MAP.kids : (VOICE_MAP[genre] || VOICE_MAP.default);

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice,
        response_format: 'mp3',
        speed: ageGroup === 'kids' ? 0.9 : 1.0,  // slightly slower for kids
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'TTS error');
    }

    // Return as base64 so frontend can play directly
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    res.json({ audioContent: base64, voice });
  } catch (error) {
    console.error('TTS error:', error.message);
    res.status(500).json({ error: 'Failed to synthesize speech', details: error.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`TTS service on port ${PORT}`));
