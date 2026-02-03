const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all accounts for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const accounts = await prisma.account.findMany({
            where: { userId: req.user.userId },
            include: { expenses: { take: 5, orderBy: { date: 'desc' } } }
        });
        res.json(accounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});

// Create new account
router.post('/', authenticateToken, async (req, res) => {
    const { name, type, balance } = req.body;
    try {
        const account = await prisma.account.create({
            data: {
                name,
                type, // BANK, E_WALLET, CASH
                balance: parseFloat(balance || 0),
                userId: req.user.userId
            }
        });
        res.json(account);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

// Update account balance (manual adjustment)
router.patch('/:id', authenticateToken, async (req, res) => {
    const { balance } = req.body;
    const { id } = req.params;
    try {
        const account = await prisma.account.updateMany({
            where: { id: parseInt(id), userId: req.user.userId },
            data: { balance: parseFloat(balance) }
        });
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update account' });
    }
});

// Delete account
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.account.deleteMany({
            where: { id: parseInt(id), userId: req.user.userId }
        });
        res.json({ message: 'Account deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

module.exports = router;
