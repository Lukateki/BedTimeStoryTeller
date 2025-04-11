import React from 'react';

function ResultDisplay({ story, audioContent, imageUrl }) {
  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Story</h2>
        <p className="bg-gray-100 p-4 rounded">{story}</p>
      </div>

      {audioContent && (
        <div>
          <h2 className="text-xl font-bold mb-2">Listen</h2>
          <audio controls>
            <source src={`data:audio/mp3;base64,${audioContent}`} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {imageUrl && (
        <div>
          <h2 className="text-xl font-bold mb-2">Cover Image</h2>
          <img src={imageUrl} alt="Generated Story Illustration" className="rounded-lg w-full object-cover" />
        </div>
      )}
    </div>
  );
}

export default ResultDisplay;
