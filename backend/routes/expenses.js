const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const { categorizeExpense } = require('../services/aiService');

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
    const { description, amount, date, userId, categoryId } = req.body;
    try {

        // AI Categorization if not provided
        let finalCategoryId = categoryId ? parseInt(categoryId) : null;

        if (!finalCategoryId && description) {
            // Ideally we would fetch categories and map them, but for now we'll just get the string
            // In a real app, you'd match the string to the ID. 
            // For this MVP, let's assume we might store category name or just ID. 
            // Logic: Get category name from AI -> Find/Create Category -> Assign ID

            const aiCategoryName = await categorizeExpense(description);

            let category = await prisma.category.findUnique({ where: { name: aiCategoryName } });
            if (!category) {
                category = await prisma.category.create({ data: { name: aiCategoryName } });
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

        // Basic regex extraction (to be improved with AI)
        const totalMatch = text.match(/total[\s\S]*?(\d+\.\d{2})/i);
        const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);

        const extractedData = {
            text,
            amount: totalMatch ? totalMatch[1] : null,
            date: dateMatch ? dateMatch[1] : null
        };

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

module.exports = router;
