require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: "ok" });
});

app.post('/generate-image', async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await axios.post('https://api.openai.com/v1/images/generations', {
            prompt,
            n: 1,
            size: "512x512"
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const imageUrl = response.data.data[0].url;
        res.json({ imageUrl });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate image" });
    }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Image service listening on port ${PORT}`));
