const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function check() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Try 1.5 Flash first (preferred)
    try {
        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        await model.generateContent("test");
        console.log("SUCCESS: gemini-1.5-flash");
        return;
    } catch (e) { console.log("FAIL: gemini-1.5-flash"); }

    // Try 1.5 Pro
    try {
        console.log("Testing gemini-1.5-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        await model.generateContent("test");
        console.log("SUCCESS: gemini-1.5-pro");
        return;
    } catch (e) { console.log("FAIL: gemini-1.5-pro"); }

    // Fallback to gemini-pro
    try {
        console.log("Testing gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        await model.generateContent("test");
        console.log("SUCCESS: gemini-pro");
        return;
    } catch (e) { console.log("FAIL: gemini-pro"); }
}

check();
