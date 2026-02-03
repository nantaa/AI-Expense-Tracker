const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Export Expenses
router.get('/export', authenticateToken, async (req, res) => {
    const { format } = req.query; // 'csv' or 'json' (pdf later)

    try {
        const expenses = await prisma.expense.findMany({
            where: { userId: req.user.userId },
            include: { category: true, account: true }, // Include account info
            orderBy: { date: 'desc' }
        });

        if (format === 'csv') {
            const fields = ['Date', 'Description', 'Amount', 'Category', 'Account', 'Receipt'];
            const csvRows = [fields.join(',')];

            expenses.forEach(exp => {
                const row = [
                    new Date(exp.date).toISOString().split('T')[0],
                    `"${exp.description.replace(/"/g, '""')}"`, // Escape quotes
                    exp.amount,
                    exp.category ? exp.category.name : 'Uncategorized',
                    exp.account ? exp.account.name : 'N/A',
                    exp.receiptUrl || ''
                ];
                csvRows.push(row.join(','));
            });

            const csvString = csvRows.join('\n');
            res.header('Content-Type', 'text/csv');
            res.attachment('expenses.csv');
            return res.send(csvString);
        }

        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to export reports' });
    }
});

module.exports = router;
