const API_KEY = "AIzaSyA7E33_AfiDlfo23dutADLu8-ntZ8DtYLQ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const requestBody = {
    "systemInstruction": {
        "parts": [
            { "text": "Hello" }
        ]
    },
    "contents": [
        { "role": "user", "parts": [{ "text": "Test" }] }
    ],
    "generationConfig": {
        "temperature": 0.7,
        "topK": 40,
        "topP": 0.95,
        "maxOutputTokens": 1024,
    }
};

fetch(API_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
})
    .then(res => res.text())
    .then(text => console.log(text))
    .catch(err => console.error(err));
