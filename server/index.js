const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Routes import
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const incomeRoutes = require('./routes/income');
const expenseRoutes = require('./routes/expense');
const billRoutes = require('./routes/bill');
const savingsRoutes = require('./routes/savings');
const creditCardRoutes = require('./routes/creditCard');
const loanRoutes = require('./routes/loan');
const analyticsRoutes = require('./routes/analytics');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/credit-cards', creditCardRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Finansal Takip API çalışıyor!', 
    timestamp: new Date().toISOString(),
    dataStorage: 'JSON Files',
    version: '1.0.0'
  });
});

// JSON Database info
console.log('JSON Database kullanılıyor - Veri klasörü: server/data/');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Sunucu hatası!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
