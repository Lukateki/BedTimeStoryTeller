import React from 'react';
import StoryForm from './components/StoryForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Bedtime Story Generator</h1>
        <StoryForm />
      </div>
    </div>
  );
}

export default App;
