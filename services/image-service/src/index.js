require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/generate-image', async (req, res) => {
  const { prompt, genre = 'fantasy', ageGroup = 'kids', isCover = false } = req.body;

  // Build style suffix based on genre + age
  const styleMap = {
    fantasy:   ageGroup === 'kids' ? 'children\'s storybook watercolor illustration, soft warm colors, whimsical, gentle' : 'epic fantasy oil painting, dramatic lighting, rich jewel tones, detailed',
    scifi:     ageGroup === 'kids' ? 'colorful children\'s space illustration, cartoon style, bright and friendly' : 'cinematic science fiction concept art, dramatic lighting, deep space atmosphere',
    fairytale: 'classic fairy tale illustration, golden hour light, ornate details, storybook style',
    adventure: ageGroup === 'kids' ? 'children\'s adventure book illustration, vibrant colors, expressive characters' : 'adventure novel cover art, dynamic composition, bold colors',
    mystery:   'atmospheric mystery illustration, moody lighting, deep shadows, detailed environment',
    horror:    'dark horror illustration, gothic atmosphere, unsettling, detailed shadows, adult',
    romance:   'romantic illustration, soft warm light, tender atmosphere, painterly style',
    fable:     'classic fable illustration, anthropomorphic animals, warm earthy tones, vintage storybook style',
  };

  const style = styleMap[genre] || 'beautiful storybook illustration, warm colors';
  const coverPrefix = isCover ? 'Book cover art, centered composition, title-ready. ' : '';
  const fullPrompt = `${coverPrefix}${prompt}. Style: ${style}. No text, no letters, no words in the image.`;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'OpenAI image error');

    res.json({ imageUrl: data.data[0].url, revisedPrompt: data.data[0].revised_prompt });
  } catch (error) {
    console.error('Image generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate image', details: error.message });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Image service on port ${PORT}`));
