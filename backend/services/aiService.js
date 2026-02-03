const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function categorizeExpense(description) {
    try {
        const prompt = `Categorize the following expense description into a single category (e.g., Food, Transport, Utilities, Entertainment, Health, Other). Return ONLY the category name. Description: "${description}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text.trim();
    } catch (error) {
        console.error("AI Categorization Error:", error);
        return "Uncategorized";
    }
}

module.exports = { categorizeExpense };
