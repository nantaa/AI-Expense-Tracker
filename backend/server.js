const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Import Routes
const expenseRoutes = require('./routes/expenses');
// app.use('/api/expenses', expenseRoutes); // Uncomment when created

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
