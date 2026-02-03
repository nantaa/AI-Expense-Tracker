const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function testModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Add gemini-pro (v1.0) and new 002 variants
    const models = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-flash-002", "gemini-1.5-flash-8b"];

    for (const modelName of models) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = "Hello";
            await model.generateContent(prompt);
            console.log(`✅ SUCCESS: ${modelName} is working.`);
            // Continue to see ALL working models
        } catch (error) {
            // Log status code if possible
            const status = error.message.match(/\[(\d+) /)?.[1] || "Unknown";
            console.log(`❌ FAILED: ${modelName} (${status})`);
        }
    }
}

testModels();
