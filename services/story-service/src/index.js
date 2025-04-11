require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // <--- ADD THIS
const app = express();

app.use(cors()); // <--- ADD THIS
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: "ok" });
});

app.post('/generate-story', async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `Write a short bedtime story about: ${prompt}` }],
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const story = response.data.choices[0].message.content.trim();
        res.json({ story });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate story" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Story service listening on port ${PORT}`));
