const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../utils/jsonDatabase');

const router = express.Router();

// Tüm faturaları getir
router.get('/', auth, async (req, res) => {
  try {
    const { type, isPaid, month, year } = req.query;
    let filterFn = (bill) => bill.userId === req.user.id;

    // Tip filtresi
    if (type) {
      const originalFilterFn = filterFn;
      filterFn = (bill) => originalFilterFn(bill) && bill.type === type;
    }

    // Ödeme durumu filtresi
    if (isPaid !== undefined) {
      const originalFilterFn = filterFn;
      const isPaidBool = isPaid === 'true';
      filterFn = (bill) => originalFilterFn(bill) && bill.isPaid === isPaidBool;
    }

    // Aylık filtre
    if (month && year) {
      const originalFilterFn = filterFn;
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filterFn = (bill) => {
        const billDate = new Date(bill.dueDate);
        return originalFilterFn(bill) && billDate >= startDate && billDate <= endDate;
      };
    }

    const bills = db.findByFilter('bills', filterFn);
    
    // Vade tarihine göre sırala
    const sortedBills = bills.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json(sortedBills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni fatura ekle
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 1 }).withMessage('Fatura adı gereklidir'),
  body('type').isIn(['electricity', 'water', 'gas', 'internet', 'phone', 'rent', 'insurance', 'other']).withMessage('Geçersiz fatura tipi'),
  body('amount').isNumeric().withMessage('Tutar sayısal değer olmalıdır'),
  body('dueDate').isISO8601().withMessage('Geçerli bir vade tarihi giriniz')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, amount, dueDate, isRecurring, recurringDay, notes } = req.body;

    const bill = db.add('bills', {
      userId: req.user.id,
      name,
      type,
      amount,
      dueDate: new Date(dueDate).toISOString(),
      isPaid: false,
      isRecurring: isRecurring !== undefined ? isRecurring : true,
      recurringDay: recurringDay || null,
      notes: notes || ''
    });

    res.status(201).json({
      message: 'Fatura başarıyla eklendi',
      bill
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Fatura güncelle
router.put('/:id', [
  auth,
  body('amount').optional().isNumeric().withMessage('Tutar sayısal değer olmalıdır'),
  body('type').optional().isIn(['electricity', 'water', 'gas', 'internet', 'phone', 'rent', 'insurance', 'other']).withMessage('Geçersiz fatura tipi')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Önce kaydın kullanıcıya ait olduğunu kontrol et
    const existingBill = db.findById('bills', req.params.id);
    if (!existingBill || existingBill.userId !== req.user.id) {
      return res.status(404).json({ message: 'Fatura bulunamadı' });
    }

    const bill = db.update('bills', req.params.id, req.body);

    res.json({
      message: 'Fatura başarıyla güncellendi',
      bill
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Fatura sil
router.delete('/:id', auth, async (req, res) => {
  try {
    // Önce kaydın kullanıcıya ait olduğunu kontrol et
    const existingBill = db.findById('bills', req.params.id);
    if (!existingBill || existingBill.userId !== req.user.id) {
      return res.status(404).json({ message: 'Fatura bulunamadı' });
    }

    const deleted = db.delete('bills', req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Fatura bulunamadı' });
    }

    res.json({ message: 'Fatura başarıyla silindi' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Fatura ödeme durumunu güncelle
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const { isPaid } = req.body;

    // Önce kaydın kullanıcıya ait olduğunu kontrol et
    const existingBill = db.findById('bills', req.params.id);
    if (!existingBill || existingBill.userId !== req.user.id) {
      return res.status(404).json({ message: 'Fatura bulunamadı' });
    }

    const bill = db.update('bills', req.params.id, { isPaid });

    res.json({
      message: `Fatura ${isPaid ? 'ödendi' : 'ödenmedi'} olarak işaretlendi`,
      bill
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Ödenmemiş faturalar
router.get('/unpaid', auth, async (req, res) => {
  try {
    const unpaidBills = db.findByFilter('bills', bill => 
      bill.userId === req.user.id && bill.isPaid === false
    ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json(unpaidBills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Aylık toplam fatura tutarı
router.get('/monthly-total', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const bills = db.findByFilter('bills', bill => {
      const billDate = new Date(bill.dueDate);
      return bill.userId === req.user.id && billDate >= startDate && billDate <= endDate;
    });

    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidAmount = bills.filter(bill => bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0);
    const unpaidAmount = bills.filter(bill => !bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0);
    const count = bills.length;

    res.json({
      totalAmount,
      paidAmount,
      unpaidAmount,
      count
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
