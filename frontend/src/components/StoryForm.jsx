import React, { useState } from 'react';
import axios from 'axios';
import ResultDisplay from './ResultDisplay';

function StoryForm() {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [audioContent, setAudioContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // 1. Generate Story
      const storyRes = await axios.post(`${import.meta.env.VITE_STORY_SERVICE_URL}/generate-story`, { prompt });
      setStory(storyRes.data.story);

      // 2. Generate Audio
      const audioRes = await axios.post(`${import.meta.env.VITE_TTS_SERVICE_URL}/text-to-speech`, { text: storyRes.data.story });
      setAudioContent(audioRes.data.audioContent);

      // 3. Generate Image
      const imageRes = await axios.post(`${import.meta.env.VITE_IMAGE_SERVICE_URL}/generate-image`, { prompt });
      setImageUrl(imageRes.data.imageUrl);

    } catch (error) {
      console.error(error);
      alert('Something went wrong. Check console.');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a story idea..."
          className="p-2 border rounded-md"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md"
        >
          {loading ? "Generating..." : "Generate Story"}
        </button>
      </div>

      {story && (
        <ResultDisplay
          story={story}
          audioContent={audioContent}
          imageUrl={imageUrl}
        />
      )}
    </div>
  );
}

export default StoryForm;
