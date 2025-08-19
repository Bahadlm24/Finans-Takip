const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../utils/jsonDatabase');

const router = express.Router();

// Tüm gelirleri getir
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, source } = req.query;
    let filterFn = (income) => income.userId === req.user.id;

    // Tarih filtresi
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filterFn = (income) => {
        const incomeDate = new Date(income.date);
        return income.userId === req.user.id && incomeDate >= start && incomeDate <= end;
      };
    }

    // Kaynak filtresi
    if (source) {
      const originalFilterFn = filterFn;
      filterFn = (income) => originalFilterFn(income) && income.source === source;
    }

    const incomes = db.findByFilter('income', filterFn);
    
    // Tarihe göre sırala
    const sortedIncomes = incomes.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(sortedIncomes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni gelir ekle
router.post('/', [
  auth,
  body('amount').isNumeric().withMessage('Tutar sayısal değer olmalıdır'),
  body('source').isIn(['salary', 'bonus', 'freelance', 'investment', 'rental', 'other']).withMessage('Geçersiz gelir kaynağı'),
  body('description').optional().trim(),
  body('date').isISO8601().withMessage('Geçerli bir tarih giriniz')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, source, description, date, isRecurring } = req.body;

    const income = db.add('income', {
      userId: req.user.id,
      amount,
      source,
      description: description || '',
      date: new Date(date).toISOString(),
      isRecurring: isRecurring || false
    });

    res.status(201).json({
      message: 'Gelir başarıyla eklendi',
      income
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Gelir güncelle
router.put('/:id', [
  auth,
  body('amount').optional().isNumeric().withMessage('Tutar sayısal değer olmalıdır'),
  body('source').optional().isIn(['salary', 'bonus', 'freelance', 'investment', 'rental', 'other']).withMessage('Geçersiz gelir kaynağı')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Önce kaydın kullanıcıya ait olduğunu kontrol et
    const existingIncome = db.findById('income', req.params.id);
    if (!existingIncome || existingIncome.userId !== req.user.id) {
      return res.status(404).json({ message: 'Gelir bulunamadı' });
    }

    const income = db.update('income', req.params.id, req.body);

    res.json({
      message: 'Gelir başarıyla güncellendi',
      income
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Gelir sil
router.delete('/:id', auth, async (req, res) => {
  try {
    // Önce kaydın kullanıcıya ait olduğunu kontrol et
    const existingIncome = db.findById('income', req.params.id);
    if (!existingIncome || existingIncome.userId !== req.user.id) {
      return res.status(404).json({ message: 'Gelir bulunamadı' });
    }

    const deleted = db.delete('income', req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Gelir bulunamadı' });
    }

    res.json({ message: 'Gelir başarıyla silindi' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Aylık toplam gelir
router.get('/monthly-total', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const incomes = db.findByFilter('income', income => {
      const incomeDate = new Date(income.date);
      return income.userId === req.user.id && incomeDate >= startDate && incomeDate <= endDate;
    });

    const totalAmount = incomes.reduce((sum, income) => sum + income.amount, 0);
    const count = incomes.length;

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
