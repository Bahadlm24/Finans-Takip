const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../utils/jsonDatabase');

const router = express.Router();

// Tüm harcamaları getir
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, category, limit = 50 } = req.query;
    let filterFn = (expense) => expense.userId === req.user.id;

    // Tarih filtresi
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filterFn = (expense) => {
        const expenseDate = new Date(expense.date);
        return expense.userId === req.user.id && expenseDate >= start && expenseDate <= end;
      };
    }

    // Kategori filtresi
    if (category) {
      const originalFilterFn = filterFn;
      filterFn = (expense) => originalFilterFn(expense) && expense.category === category;
    }

    const expenses = db.findByFilter('expenses', filterFn);
    
    // Tarihe göre sırala ve limitle
    const sortedExpenses = expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, parseInt(limit));

    res.json(sortedExpenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni harcama ekle
router.post('/', [
  auth,
  body('amount').isNumeric().withMessage('Tutar sayısal değer olmalıdır'),
  body('category').isIn([
    'food', 'transportation', 'shopping', 'entertainment', 
    'health', 'education', 'housing', 'utilities', 'other'
  ]).withMessage('Geçersiz kategori'),
  body('description').optional().trim(),
  body('date').isISO8601().withMessage('Geçerli bir tarih giriniz')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, category, subcategory, description, date, paymentMethod } = req.body;

    const expense = db.add('expenses', {
      userId: req.user.id,
      amount,
      category,
      subcategory: subcategory || '',
      description,
      date: new Date(date).toISOString(),
      paymentMethod: paymentMethod || 'cash'
    });

    res.status(201).json({
      message: 'Harcama başarıyla eklendi',
      expense
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Harcama güncelle
router.put('/:id', [
  auth,
  body('amount').optional().isNumeric().withMessage('Tutar sayısal değer olmalıdır'),
  body('category').optional().isIn([
    'food', 'transportation', 'shopping', 'entertainment', 
    'health', 'education', 'housing', 'utilities', 'other'
  ]).withMessage('Geçersiz kategori')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Önce kaydın kullanıcıya ait olduğunu kontrol et
    const existingExpense = db.findById('expenses', req.params.id);
    if (!existingExpense || existingExpense.userId !== req.user.id) {
      return res.status(404).json({ message: 'Harcama bulunamadı' });
    }

    const expense = db.update('expenses', req.params.id, req.body);

    res.json({
      message: 'Harcama başarıyla güncellendi',
      expense
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Harcama sil
router.delete('/:id', auth, async (req, res) => {
  try {
    // Önce kaydın kullanıcıya ait olduğunu kontrol et
    const existingExpense = db.findById('expenses', req.params.id);
    if (!existingExpense || existingExpense.userId !== req.user.id) {
      return res.status(404).json({ message: 'Harcama bulunamadı' });
    }

    const deleted = db.delete('expenses', req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Harcama bulunamadı' });
    }

    res.json({ message: 'Harcama başarıyla silindi' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kategoriye göre harcama özeti
router.get('/category-summary', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    let filterFn = (expense) => expense.userId === req.user.id;

    // Aylık filtre
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filterFn = (expense) => {
        const expenseDate = new Date(expense.date);
        return expense.userId === req.user.id && expenseDate >= startDate && expenseDate <= endDate;
      };
    }

    const expenses = db.findByFilter('expenses', filterFn);
    
    // Kategoriye göre grupla
    const summary = expenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = {
          _id: category,
          totalAmount: 0,
          count: 0
        };
      }
      acc[category].totalAmount += expense.amount;
      acc[category].count += 1;
      return acc;
    }, {});

    // Array'e çevir ve sırala
    const summaryArray = Object.values(summary).sort((a, b) => b.totalAmount - a.totalAmount);

    res.json(summaryArray);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Aylık toplam harcama
router.get('/monthly-total', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = db.findByFilter('expenses', expense => {
      const expenseDate = new Date(expense.date);
      return expense.userId === req.user.id && expenseDate >= startDate && expenseDate <= endDate;
    });

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const count = expenses.length;

    res.json({
      totalAmount,
      count
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
