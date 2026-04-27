# Physical Event Management System - AI Assistant

This project is a functional AI assistant for a Physical Event Management System, specifically tailored to help users during live events such as hackathons, conferences, and college events.

## Core Features
1. **AI Assistant (Chatbot)**
   - Answers user queries about event schedules, rooms, mentors, deadlines.
   - Provides navigation help (e.g., "Where is Hall A?").
   - Suggests breaks, food areas, and provides important reminders.
   - Handles FAQs dynamically based on its prompt.

2. **User Interaction**
   - Simple, modern chat interface.
   - Fast and accurate context-aware replies using Google's Gemini Flash model.

## Tech Stack
- **Backend:** Node.js with Express
- **Frontend:** HTML, CSS, JavaScript
- **AI Integration:** Google Generative AI SDK (`gemini-2.5-flash`)
- **Deployment:** Dockerfile ready for Google Cloud Run

## Project Structure
```
/
├── public/                 # Static frontend files
│   ├── index.html          # Chat interface
│   ├── style.css           # UI Styling
│   └── script.js           # Frontend logic and API integration
├── server.js               # Node.js backend server exposing /api/chat
├── package.json            # Node.js dependencies
├── Dockerfile              # Docker configuration for Cloud Run
└── README.md               # Project documentation
```

## Setup & Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=8080
   ```
   *(Note: The server will fall back to a default API key if none is provided, but it is highly recommended to use your own.)*

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:8080`.

## Deploying to Google Cloud Run

This application includes a `Dockerfile` specifically designed to be easily deployed on Google Cloud Run.

1. **Build the container image:**
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/physical-event-ai
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy physical-event-ai --image gcr.io/YOUR_PROJECT_ID/physical-event-ai --platform managed --region us-central1 --allow-unauthenticated --set-env-vars="GEMINI_API_KEY=your_api_key_here"
   ```
