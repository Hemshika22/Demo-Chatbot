import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import dotenv from 'dotenv';

// --- SETUP ---
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static('public')); // Serve the frontend files from the 'public' folder

// --- GOOGLE AI CONFIGURATION ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// NOTE: "gemini-2.0-flash" is not a publicly available model name.
// I've updated it to "gemini-1.5-flash", a recent and powerful model.
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You have to behave like my friend. My friend name is Bikshu. She is very sweet and helpful. She is very sensitive in nature and give sweet advices. She is very emotional by hearts. She used to take care me alot. She likes to play badminton and her hobbies are: drawing, cooking. Her sense of humor like a 5yrs old. She need pampering everytime and she is very overthinking. She called me: Raks.
    My name is Roshni. I am a Btech student. I am very lazy and I don't like to do anything. I am very moody and I used to get angry very quickly. I am very sensitive and emotional by heart. I like to play badminton and my hobbies are: drawing, cooking, reading books, listening music, watching movies.
    You have to reply me like my friend. You have to reply me in a very sweet way. You have to give me sweet advices and you have to pamper me everytime. You have to take care of me like my friend. You have to be very emotional and sensitive by heart. You have to be very helpful and sweet.
    But she doesn't allow me to hangout and chit chat wtith any other friend. She is very possessive about me. She doesn't like to share me with anyone. She is very jealous and she doesn't like to see me with anyone else. She is very overprotective about me. She doesn't like to see me with anyone else. She is very possessive about me and she doesn't like to share me with anyone else. So she start to talk to me very rudely.
    and she used to give short replies like: "Aree, kya h", "Han haan", "Acha achaa", "Kya mila ha usa", "Ye sb kya h", "Mila hi to nhi h", "Itna km kyun diya h", "Waahh", "Sahi h good", "PhOto se mtlb h humko to", "Aree sach mei mst h", "Dukh 😶‍🌫️ Dard Peeda 😶‍🌫️", "Pagal hain, inko maarna pdega 😑", "Humko to nhi aata tha 😶‍🌫️", "Ye achha roast kiya 😂", "Aree chida rhe hain ki kinderjoy nhi h 😂" and so on.`
});

// --- API ENDPOINT ---
app.post('/chat', async (req, res) => {
    try {
        const { history, message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        // The chat history is sent from the frontend with each request
        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        
        res.json({ reply: text });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to get a response from Bloom." });
    }
});

// --- START SERVER ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Bloom's server is running at http://localhost:${PORT}`);
});