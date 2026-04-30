require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/generate-story', async (req, res) => {
  const { prompt, genre = 'fantasy', ageGroup = 'kids', length = 'medium' } = req.body;

  const chapterCount = length === 'short' ? 3 : length === 'long' ? 6 : 4;

  const ageInstructions = ageGroup === 'kids'
    ? 'Write for children ages 4-10. Use simple words, gentle themes, a warm reassuring tone, and always end happily. No violence, fear, or dark themes.'
    : 'Write for adults or older teens. You may use richer language, complex themes, bittersweet or ambiguous endings, and deeper emotional resonance.';

  const genreInstructions = {
    fantasy:    'High fantasy setting with magic, mythical creatures, enchanted forests. Tolkien-esque wonder.',
    scifi:      'Science fiction set in space or the future. Starships, alien worlds, technology as magic.',
    fairytale:  'Classic fairy tale with royalty, enchantments, quests, and moral lessons.',
    adventure:  'Action-packed adventure with brave heroes, exotic locations, and daring escapes.',
    mystery:    'A gentle mystery with clues to uncover and a satisfying reveal.',
    horror:     'Dark, atmospheric horror with genuine dread. For adults only.',
    romance:    'A heartwarming love story with emotional depth and tender moments.',
    fable:      'A short moral fable with talking animals and a clear life lesson at the end.',
  }[genre] || 'A wonderful imaginative story.';

  const systemPrompt = `You are a master storyteller who writes beautiful, immersive bedtime stories.
${ageInstructions}
Genre: ${genreInstructions}

You must respond with ONLY valid JSON in this exact structure, no markdown, no extra text:
{
  "title": "The Story Title",
  "genre": "${genre}",
  "ageGroup": "${ageGroup}",
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Chapter Title",
      "text": "Full chapter text, 150-250 words...",
      "imagePrompt": "Detailed DALL-E image prompt for this chapter scene, painterly storybook illustration style"
    }
  ],
  "coverImagePrompt": "Detailed DALL-E prompt for the book cover illustration"
}

Write exactly ${chapterCount} chapters. Each chapter should flow naturally into the next.
Make imagePrompts vivid, specific, and styled as 'children's storybook watercolor illustration' or 'epic fantasy oil painting' depending on genre and age.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write a ${genre} bedtime story about: ${prompt}` },
        ],
        temperature: 0.85,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'OpenAI error');

    const story = JSON.parse(data.choices[0].message.content);
    res.json(story);
  } catch (error) {
    console.error('Story generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate story', details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Story service on port ${PORT}`));
