const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all budgets for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const budgets = await prisma.budget.findMany({
            where: { userId: req.user.userId },
            include: { category: true }
        });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
});

// Set/Update Budget
router.post('/', authenticateToken, async (req, res) => {
    const { amount, categoryId, month, year } = req.body;
    try {
        // Check if budget exists for this month/year/category
        // Simplify: Just create new or update existing unique constraint logic?
        // For MVP, allow multiple for now or just create.

        // Better: upsert if unique constraint on user/category/month/year exists.
        // We didn't set that constraint yet. Let's just create for now.

        const budget = await prisma.budget.create({
            data: {
                amount: parseFloat(amount),
                userId: req.user.userId,
                categoryId: parseInt(categoryId),
                month: parseInt(month),
                year: parseInt(year)
            }
        });
        res.json(budget);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to set budget' });
    }
});

// Get AI Budget Recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const expenses = await prisma.expense.findMany({
            where: {
                userId: req.user.userId,
                date: { gte: threeMonthsAgo }
            },
            include: { category: true }
        });

        const { generateBudgetRecommendations } = require('../services/aiService');
        const recommendations = await generateBudgetRecommendations(expenses);

        res.json(recommendations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate budget recommendations' });
    }
});

module.exports = router;
