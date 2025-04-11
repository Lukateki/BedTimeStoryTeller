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

app.post('/text-to-speech', async (req, res) => {
    const { text } = req.body;
    try {
        const response = await axios.post(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`,
            {
                input: { text },
                voice: { languageCode: "en-US", ssmlGender: "FEMALE" },
                audioConfig: { audioEncoding: "MP3" }
            }
        );

        const audioContent = response.data.audioContent;
        res.json({ audioContent });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Failed to synthesize speech" });
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`TTS service listening on port ${PORT}`));
