const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function testModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Add gemini-pro (v1.0) and new 002 variants
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });


    const prompt = `Analyze these expenses and provide insights: ${JSON.stringify(expenses)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
} 
    catch (error) {
    console.error('AI Insights Error:', error);
    throw error;
}


testModels();
