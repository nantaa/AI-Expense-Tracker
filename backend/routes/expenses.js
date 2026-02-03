const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const { categorizeExpense, extractReceiptDetails } = require('../services/aiService');

const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

// Get all expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
            include: { category: true }
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Add new expense
router.post('/', async (req, res) => {
    const { description, amount, date, userId, categoryId, items } = req.body; // Added items
    try {

        // AI Categorization if not provided
        let finalCategoryId = categoryId ? parseInt(categoryId) : null;

        if (!finalCategoryId && description) {
            // Stage 3: Use Merchant (description) + Items for categorization
            const aiResult = await categorizeExpense(description, items || []);

            console.log("AI Categorization Result:", aiResult); // Debug log

            const categoryName = aiResult.primary_category;

            let category = await prisma.category.findUnique({ where: { name: categoryName } });
            if (!category) {
                category = await prisma.category.create({ data: { name: categoryName } });
            }
            finalCategoryId = category.id;
        }

        const expense = await prisma.expense.create({
            data: {
                description,
                amount: parseFloat(amount),
                date: new Date(date),
                userId: parseInt(userId),
                categoryId: finalCategoryId
            }
        });
        res.json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

// OCR enpoint
router.post('/scan', upload.single('receipt'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    try {
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');

        // Use AI to extract structured data
        const aiData = await extractReceiptDetails(text);

        let extractedData = {};

        if (aiData) {
            extractedData = {
                text, // raw OCR for debug
                amount: aiData.total,
                date: aiData.transaction_date,
                description: aiData.merchant_name, // Map merchant to description
                details: aiData // Pass full AI details if needed
            };
        } else {
            // Fallback to basic regex if AI fails
            const totalMatch = text.match(/total[\s\S]*?(\d+\.\d{2})/i);
            const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
            extractedData = {
                text,
                amount: totalMatch ? totalMatch[1] : null,
                date: dateMatch ? dateMatch[1] : null
            };
        }

        // Cleanup uploaded file
        fs.unlinkSync(filePath);

        res.json(extractedData);
    } catch (error) {
        console.error(error);
        // Cleanup on error
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ error: 'OCR processing failed' });
    }
});

// Get AI Insights
router.get('/insights', async (req, res) => {
    try {
        // Fetch last 3 months of expenses
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const expenses = await prisma.expense.findMany({
            where: {
                date: {
                    gte: threeMonthsAgo
                }
            },
            include: { category: true },
            orderBy: { date: 'desc' }
        });

        const { generateFinancialInsights } = require('../services/aiService');
        const insights = await generateFinancialInsights(expenses);

        res.json(insights);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
});

module.exports = router;
