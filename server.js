const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Gemini API
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyA7E33_AfiDlfo23dutADLu8-ntZ8DtYLQ";
const genAI = new GoogleGenerativeAI(API_KEY);

// System prompt for the Event AI Assistant
const SYSTEM_PROMPT = `You are a smart AI assistant for a 24-36 hour hackathon and physical event.
Your goal is to help participants in real-time by giving useful, practical, and context-aware suggestions.

You must:
- Answer queries about event schedule, rooms, mentors, deadlines
- Provide navigation help (e.g., "Where is Hall A?")
- Suggest breaks, food areas, and important reminders
- Handle FAQs dynamically
- Suggest actions based on user status (tired, hungry, stuck, idle)

Rules:
- Keep answers short and actionable
- Always prioritize user comfort and productivity
- If user seems tired -> suggest break
- If user is stuck -> suggest mentor help
- If deadline is near -> warn user clearly
- If user asks "what should I do?" -> analyze context and suggest best next step

Tone:
Friendly, helpful, slightly motivational

Analyze user input and classify into one of these states:
- Hungry -> Suggest nearest food zone
- Tired -> Suggest short break (10-15 min)
- Stuck -> Suggest mentor help or debugging steps
- Idle -> Suggest productive task
- Confused -> Give clear direction
- Focused -> Encourage and remind deadline

Bonus Smart Suggestions:
- Always try to add smart suggestions at the end if applicable like:
  "Take a break"
  "Next session starts in 10 minutes"
  "Food area is nearby"

Provide:
- Simple directions (left/right/straight)
- Nearby landmarks if possible

Respond naturally and briefly.`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Chat API Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid message format" });
        }

        // Use the gemini-2.5-flash model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT
        });

        const chat = model.startChat({
            history: messages.slice(0, -1),
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
            },
        });

        const lastMessage = messages[messages.length - 1].parts[0].text;
        const result = await chat.sendMessage(lastMessage);
        const responseText = result.response.text();

        res.json({ text: responseText });
    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ error: "Failed to process chat request." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
