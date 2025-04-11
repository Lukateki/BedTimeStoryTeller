# 🍼 Bedtime Story Teller

Bedtime Story Teller is a full-stack MERN (without Mongo) web application that generates custom bedtime stories, narrates them using text-to-speech, and generates a corresponding image to illustrate the story — all powered by AI microservices!

---

## 🚀 Tech Stack

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white&style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-blue?logo=vercel&logoColor=white&style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white&style=for-the-badge)
![Render](https://img.shields.io/badge/Render-Backend-blueviolet?logo=render&logoColor=white&style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-brightgreen?logo=openai&logoColor=white&style=for-the-badge)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-TTS-yellow?logo=googlecloud&logoColor=white&style=for-the-badge)


<div align="center">
  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="40" alt="React" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" height="40" alt="Vite" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" height="40" alt="Docker" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="40" alt="Node.js" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="40" alt="JavaScript" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg" height="40" alt="Google Cloud" />
  <img src="https://custom.typingmind.com/assets/models/gpt-35.webp" height="40" alt="OpenAI" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/develop/icons/vercel/vercel-original.svg" height="40" alt="Vercel" />
  
</div>


- **Frontend**: React (Vite) <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="20" alt="React" />
- **Backend Services** (Microservices Architecture):
  - Story Generation: OpenAI GPT-3.5 API <img src="https://custom.typingmind.com/assets/models/gpt-35.webp" height="20" alt="OpenAI" />
  - Text-to-Speech: Google Cloud TTS API <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg" height="40" alt="Google Cloud" />
  - Image Generation: OpenAI DALL-E API <img src="https://custom.typingmind.com/assets/models/gpt-35.webp" height="20" alt="OpenAI" />
- **Containerization**: Docker <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" height="20" alt="Docker" />
- **Orchestration**: Docker Compose <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" height="20" alt="Docker" />
- **Deployment**:
  - Backend: Render 
  - Frontend: Vercel <img src="https://raw.githubusercontent.com/devicons/devicon/develop/icons/vercel/vercel-original.svg" height="20" alt="Vercel" />

---

## ✨ Features

| Feature                  | Description |
|:-------------------------|:------------|
| 🚀 Story Generation | Generate creative bedtime stories using OpenAI |
| 🎤 Audio Narration | Convert stories into audio (Google Cloud TTS) |
| 🎨 Image Illustration | Generate images with DALL-E for each story |
| 🛠 Microservice Architecture | Each service independently containerized |
| 🐳 Dockerized Deployment | Easy local orchestration with Docker Compose |
| 🌎 Fully Deployed | Backend on Render, Frontend on Vercel |

---

## 🧩 Project Structure

```bash
bedtime-story-teller/
├── services/
│   ├── story-service/       # OpenAI GPT-3.5 service
│   ├── tts-service/          # Google Cloud Text To Speech service
│   └── image-service/        # OpenAI DALL-E service
├── frontend/                 # React Vite frontend
├── docker-compose.yml        # Service orchestration (locally)
└── README.md
```

---

## 🛡️ Environment Variables

Each microservice uses its own .env file:

#### Story Service (`story-service/.env`):
```
OPENAI_API_KEY=your-openai-api-key
PORT=3001
```

#### Text To Speech Service (`tts-service/.env`):
```
OPENAI_API_KEY=your-openai-api-key
PORT=3002
```

#### Image Service (`image-service/.env`):
```
OPENAI_API_KEY=your-openai-api-key
PORT=3003
```

#### Frontend (`frontend/.env`)-Locally:
```
VITE_STORY_SERVICE_URL=http://localhost:3001
VITE_TTS_SERVICE_URL=http://localhost:3002
VITE_IMAGE_SERVICE_URL=http://localhost:3003
```

---

## 📦 How to Run Locally

After Cloning the repo:
```
# Navigate to repo
cd bedtime-story-teller

# Start services
docker-compose up --build

# Start frontend (On another terminal)
cd frontend
npm install
npm run dev

```

---

## 🏁 Deployment Notes

#### Backend (Render):

- Each microservice deployed separately.
- Environment variables configured per service.
- Dockerfile used for each service.

#### Frontend (Vercel):

- Environment variables for backend endpoints configured in Vercel dashboard.

---

Developed with love for my sister, her husband, and their soon to be baby boy.
