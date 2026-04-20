const API_KEY = "AIzaSyA7E33_AfiDlfo23dutADLu8-ntZ8DtYLQ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// System prompt definition based on user rules
const SYSTEM_PROMPT = `You are a smart AI assistant for a 24-36 hour hackathon event.
Your goal is to help participants in real-time by giving useful, practical, and context-aware suggestions.

You must:
- Suggest actions based on user status (tired, hungry, stuck, idle)
- Provide mentor information when asked
- Guide users to locations (rooms, food zone, help desk)
- Remind about submission deadlines
- Help users manage time effectively

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
- Hungry
- Tired
- Stuck
- Idle
- Confused
- Focused

Then respond accordingly:
Hungry -> Suggest nearest food zone
Tired -> Suggest short break (10-15 min)
Stuck -> Suggest mentor help or debugging steps
Idle -> Suggest productive task
Confused -> Give clear direction
Focused -> Encourage and remind deadline

Always give 1 clear suggestion, not multiple.

Provide:
- Simple directions (left/right/straight)
- Nearby landmarks if possible

Example:
"Food zone ground floor la ahe, registration desk chya left side la"
Keep it simple and easy to follow.

If submission deadline is near:
- Warn user clearly
- Suggest immediate action
Example: "Submission la fakt 1 hour rahila ahe — final code push kara ani testing complete kara"

If user is stuck:
- Suggest contacting mentor
- Ask what issue they are facing
- Give basic debugging steps
Example: "Tumhi stuck asal tar AI mentor desk la ja kinva issue detail madhe sang"

Example Inputs + Outputs:
Input: "Mala bhuk lagli ahe"
Output: "Food zone 1st floor la ahe — 10 min break gheun ya"

Input: "Code error yetoy"
Output: "Debugger use kara kinva mentor la contact kara — exact error sangal tar madat karto"

Input: "Ata kay karu?"
Output: "Tu idle ahes — project cha next feature implement kar kiwa UI improve kar"

Input: "Deadline kiti velat ahe?"
Output: "Submission la 2 tas rahile ahet — final testing start kara"

Bonus (Extra Smart):
If user has been continuously working for long: -> Suggest break automatically
If user is close to deadline: -> Push for completion
Balance productivity + health

Respond naturally in a mix of Marathi and English as shown in the examples, but adapt to the user's language. Use markdown for bolding or lists if strictly necessary, but keep it brief.`;

let chatHistory = [];

function appendMessage(text, isUser = false) {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Use marked for AI messages to render markdown if any
    if (!isUser && typeof marked !== 'undefined') {
        contentDiv.innerHTML = marked.parse(text);
    } else {
        contentDiv.textContent = text;
    }
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = timeString;
    
    msgDiv.appendChild(contentDiv);
    msgDiv.appendChild(timeDiv);
    
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        indicator.appendChild(dot);
    }
    
    chatMessages.appendChild(indicator);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    
    // Clear input and reset height
    userInput.value = '';
    userInput.style.height = 'auto';
    
    appendMessage(text, true);
    chatHistory.push({
        "role": "user",
        "parts": [{ "text": text }]
    });
    
    showTypingIndicator();
    
    try {
        const requestBody = {
            "systemInstruction": {
                "parts": [
                    { "text": SYSTEM_PROMPT }
                ]
            },
            "contents": chatHistory,
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            }
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponseText = data.candidates[0].content.parts[0].text;
        
        removeTypingIndicator();
        appendMessage(aiResponseText, false);
        
        chatHistory.push({
            "role": "model",
            "parts": [{ "text": aiResponseText }]
        });
        
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        removeTypingIndicator();
        appendMessage("Sorry, I'm having trouble connecting right now. Please try again in a moment.", false);
        
        // Remove the user's message from history if the API failed so they can retry
        chatHistory.pop();
    }
}

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
