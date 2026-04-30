export const GENRES = [
  { id: 'fantasy',   label: 'Fantasy',   emoji: '🧙',  kidsOk: true  },
  { id: 'fairytale', label: 'Fairy Tale', emoji: '🏰',  kidsOk: true  },
  { id: 'adventure', label: 'Adventure', emoji: '⚔️',  kidsOk: true  },
  { id: 'scifi',     label: 'Sci-Fi',    emoji: '🚀',  kidsOk: true  },
  { id: 'fable',     label: 'Fable',     emoji: '🦊',  kidsOk: true  },
  { id: 'mystery',   label: 'Mystery',   emoji: '🔍',  kidsOk: true  },
  { id: 'romance',   label: 'Romance',   emoji: '💕',  kidsOk: false },
  { id: 'horror',    label: 'Horror',    emoji: '👻',  kidsOk: false },
]

export const LENGTHS = [
  { id: 'short',  label: 'Short',  desc: '3 chapters' },
  { id: 'medium', label: 'Medium', desc: '4 chapters' },
  { id: 'long',   label: 'Long',   desc: '6 chapters' },
]

export function getGenres(ageGroup) {
  return ageGroup === 'kids' ? GENRES.filter(g => g.kidsOk) : GENRES
}
