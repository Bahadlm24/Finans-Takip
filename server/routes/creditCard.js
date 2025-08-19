const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../utils/jsonDatabase');

const router = express.Router();

// Tüm kredi kartlarını getir
router.get('/', auth, async (req, res) => {
  try {
    const creditCards = db.findByUser('creditCards', req.user._id.toString());
    
    // Hesaplamaları ekle
    const enrichedCards = creditCards.map(card => ({
      ...card,
      availableCredit: card.limit - card.currentDebt,
      utilizationRate: ((card.currentDebt / card.limit) * 100).toFixed(2),
      minimumPaymentDue: Math.max(card.currentDebt * (card.minimumPaymentRate / 100), card.minimumPaymentAmount || 100)
    }));

    res.json(enrichedCards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni kredi kartı ekle
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 1 }).withMessage('Kart adı gereklidir'),
  body('bank').trim().isLength({ min: 1 }).withMessage('Banka adı gereklidir'),
  body('limit').isNumeric().withMessage('Limit sayısal değer olmalıdır'),
  body('currentDebt').optional().isNumeric().withMessage('Mevcut borç sayısal değer olmalıdır'),
  body('minimumPaymentRate').optional().isNumeric().withMessage('Asgari ödeme oranı sayısal değer olmalıdır')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, bank, limit, currentDebt = 0, minimumPaymentRate = 2, minimumPaymentAmount = 100, interestRate = 2.5, cutoffDay = 1, paymentDueDay = 20 } = req.body;

    const creditCard = db.add('creditCards', {
      userId: req.user._id.toString(),
      name,
      bank,
      limit,
      currentDebt,
      minimumPaymentRate,
      minimumPaymentAmount,
      interestRate,
      cutoffDay,
      paymentDueDay,
      isActive: true
    });

    res.status(201).json({
      message: 'Kredi kartı başarıyla eklendi',
      creditCard
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kredi kartı güncelle
router.put('/:id', [
  auth,
  body('limit').optional().isNumeric().withMessage('Limit sayısal değer olmalıdır'),
  body('currentDebt').optional().isNumeric().withMessage('Mevcut borç sayısal değer olmalıdır')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const creditCard = db.update('creditCards', req.params.id, req.body);

    if (!creditCard) {
      return res.status(404).json({ message: 'Kredi kartı bulunamadı' });
    }

    res.json({
      message: 'Kredi kartı başarıyla güncellendi',
      creditCard
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kredi kartı sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = db.delete('creditCards', req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Kredi kartı bulunamadı' });
    }

    res.json({ message: 'Kredi kartı başarıyla silindi' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kredi kartı borç ödeme
router.post('/:id/payment', [
  auth,
  body('amount').isNumeric().withMessage('Ödeme tutarı sayısal değer olmalıdır'),
  body('paymentDate').optional().isISO8601().withMessage('Geçerli bir tarih giriniz')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, paymentDate = new Date().toISOString() } = req.body;
    const creditCard = db.findById('creditCards', req.params.id);

    if (!creditCard) {
      return res.status(404).json({ message: 'Kredi kartı bulunamadı' });
    }

    if (amount > creditCard.currentDebt) {
      return res.status(400).json({ message: 'Ödeme tutarı mevcut borçtan fazla olamaz' });
    }

    // Ödeme kaydını ekle
    const payment = db.add('creditCardPayments', {
      userId: req.user._id.toString(),
      creditCardId: req.params.id,
      amount,
      paymentDate,
      type: 'payment'
    });

    // Kredi kartı borcunu güncelle
    const updatedCard = db.update('creditCards', req.params.id, {
      currentDebt: creditCard.currentDebt - amount
    });

    res.json({
      message: 'Ödeme başarıyla kaydedildi',
      payment,
      creditCard: updatedCard
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kredi kartı harcama ekleme
router.post('/:id/expense', [
  auth,
  body('amount').isNumeric().withMessage('Harcama tutarı sayısal değer olmalıdır'),
  body('description').trim().isLength({ min: 1 }).withMessage('Açıklama gereklidir'),
  body('category').optional().trim(),
  body('expenseDate').optional().isISO8601().withMessage('Geçerli bir tarih giriniz')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, description, category, expenseDate = new Date().toISOString() } = req.body;
    const creditCard = db.findById('creditCards', req.params.id);

    if (!creditCard) {
      return res.status(404).json({ message: 'Kredi kartı bulunamadı' });
    }

    if (creditCard.currentDebt + amount > creditCard.limit) {
      return res.status(400).json({ message: 'Kredi kartı limiti aşılacak' });
    }

    // Harcama kaydını ekle
    const expense = db.add('creditCardExpenses', {
      userId: req.user._id.toString(),
      creditCardId: req.params.id,
      amount,
      description,
      category: category || 'other',
      expenseDate,
      type: 'expense'
    });

    // Kredi kartı borcunu güncelle
    const updatedCard = db.update('creditCards', req.params.id, {
      currentDebt: creditCard.currentDebt + amount
    });

    res.json({
      message: 'Harcama başarıyla kaydedildi',
      expense,
      creditCard: updatedCard
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kredi kartı özeti
router.get('/summary', auth, async (req, res) => {
  try {
    const creditCards = db.findByUser('creditCards', req.user._id.toString());
    
    const summary = {
      totalCards: creditCards.length,
      totalLimit: creditCards.reduce((sum, card) => sum + card.limit, 0),
      totalDebt: creditCards.reduce((sum, card) => sum + card.currentDebt, 0),
      totalAvailableCredit: creditCards.reduce((sum, card) => sum + (card.limit - card.currentDebt), 0),
      totalMinimumPayment: creditCards.reduce((sum, card) => {
        const minPayment = Math.max(card.currentDebt * (card.minimumPaymentRate / 100), card.minimumPaymentAmount || 100);
        return sum + minPayment;
      }, 0),
      averageUtilization: creditCards.length > 0 ? 
        (creditCards.reduce((sum, card) => sum + (card.currentDebt / card.limit), 0) / creditCards.length * 100).toFixed(2) : 0
    };

    res.json(summary);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
