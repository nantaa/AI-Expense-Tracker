const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function categorizeExpense(merchantName, items = []) {
    try {
        const itemsString = items.map(i => `${i.quantity || 1}x ${i.name} @ ${i.price}`).join(", ");

        const prompt = `
      Categorize the following expense based on the Merchant and Line Items.
      
      Merchant: "${merchantName}"
      Line Items: [${itemsString}]
      
      Categorize into one of: Food & Dining, Transportation, Shopping, Healthcare, Entertainment, Bills & Utilities, Housing, Travel, Education, Personal Care, Other.
      
      Return ONLY a JSON object with this schema:
      {
        "primary_category": "string",
        "subcategory": "string",
        "confidence_score": number (0-100),
        "reasoning": "string",
        "alternative_categories": ["string"]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("AI Categorization Error:", error);
        // Fallback structure
        return {
            primary_category: "Uncategorized",
            confidence_score: 0,
            reasoning: "Error in AI processing"
        };
    }
}

async function extractReceiptDetails(ocrText) {
    try {
        const prompt = `
      Analyze the following receipt text and extract financial details into a strict JSON format.
      Do not include markdown formatting (like \`\`\`json). Return ONLY the JSON object.
      
      Text:
      """
      ${ocrText}
      """
      
      Output Schema:
      {
        "merchant_name": "string (or null)",
        "transaction_date": "YYYY-MM-DD (or null)",
        "line_items": [
          { "name": "string", "quantity": number, "price": number }
        ],
        "subtotal": number (or null),
        "tax": number (or null),
        "total": number (or null),
        "confidence_score": number (0-100),
        "extraction_notes": "string"
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up if model returns markdown code blocks
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("AI Extraction Error:", error);
        return null;
    }
}

async function generateFinancialInsights(expenses) {
    try {
        const expenseSummary = expenses.map(e =>
            `${e.date.toISOString().split('T')[0]}: ${e.description} - $${e.amount} (${e.category?.name || 'Uncategorized'})`
        ).join("\n");

        const prompt = `
            Analyze the following 3-month expense history and generate financial insights.
            
            Expense History:
            """
            ${expenseSummary}
            """
            
            Return ONLY a JSON object with this schema:
            {
                "spending_patterns": [ "string (insight)" ],
                "anomalies": [ "string (flagged transaction)" ],
                "savings_opportunities": [ "string (actionable)" ],
                "financial_health_score": number (0-100),
                "financial_health_assessment": "string",
                "top_recommendations": [ "string (specific action)" ],
                "monthly_savings_potential": "string (amount)"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("AI Insights Error:", error);
        return null;
    }
}

async function generateBudgetRecommendations(expenses) {
    try {
        const expenseSummary = expenses.map(e =>
            `${e.date.toISOString().split('T')[0]}: $${e.amount} - ${e.category?.name || 'Uncategorized'}`
        ).join("\n");

        const prompt = `
            Based on the following 3-month expense history, recommend realistic monthly budgets for each category.
            
            Expense History:
            """
            ${expenseSummary}
            """
            
            Provide recommendations for each category found in the history.
            Return ONLY a JSON object with this schema:
            {
                "recommendations": [
                    {
                        "category": "string",
                        "current_avg_spend": number,
                        "recommended_budget": number, // ~10% reduction
                        "aggressive_budget": number, // ~20-30% reduction
                        "rationale": "string"
                    }
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("AI Budget Recs Error:", error);
        return { recommendations: [] };
    }
}

module.exports = { categorizeExpense, extractReceiptDetails, generateFinancialInsights, generateBudgetRecommendations };
