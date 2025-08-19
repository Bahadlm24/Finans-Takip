const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../utils/jsonDatabase');

const router = express.Router();

// Tüm kredileri getir
router.get('/', auth, async (req, res) => {
  try {
    const loans = db.findByUser('loans', req.user._id.toString());
    
    // Hesaplamaları ekle
    const enrichedLoans = loans.map(loan => {
      const monthlyPayment = calculateMonthlyPayment(loan.principal, loan.interestRate, loan.termMonths);
      const remainingPayments = loan.termMonths - loan.paidInstallments;
      const totalPaid = loan.paidInstallments * monthlyPayment;
      const remainingAmount = loan.principal + (loan.principal * loan.interestRate / 100 * loan.termMonths / 12) - totalPaid;
      
      return {
        ...loan,
        monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
        remainingPayments,
        totalInterest: parseFloat(((loan.principal * loan.interestRate / 100 * loan.termMonths / 12)).toFixed(2)),
        totalAmount: parseFloat((loan.principal + (loan.principal * loan.interestRate / 100 * loan.termMonths / 12)).toFixed(2)),
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        remainingAmount: Math.max(0, parseFloat(remainingAmount.toFixed(2))),
        nextPaymentDate: calculateNextPaymentDate(loan.startDate, loan.paidInstallments + 1),
        isCompleted: loan.paidInstallments >= loan.termMonths
      };
    });

    res.json(enrichedLoans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni kredi ekle
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 1 }).withMessage('Kredi adı gereklidir'),
  body('bank').trim().isLength({ min: 1 }).withMessage('Banka adı gereklidir'),
  body('principal').isNumeric().withMessage('Ana para sayısal değer olmalıdır'),
  body('interestRate').isNumeric().withMessage('Faiz oranı sayısal değer olmalıdır'),
  body('termMonths').isInt({ min: 1 }).withMessage('Vade ay olarak pozitif sayı olmalıdır'),
  body('startDate').isISO8601().withMessage('Geçerli bir başlangıç tarihi giriniz')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, bank, principal, interestRate, termMonths, startDate, loanType = 'personal', purpose } = req.body;
    
    const monthlyPayment = calculateMonthlyPayment(principal, interestRate, termMonths);

    const loan = db.add('loans', {
      userId: req.user._id.toString(),
      name,
      bank,
      principal,
      interestRate,
      termMonths,
      startDate,
      loanType, // 'personal', 'mortgage', 'car', 'business', 'other'
      purpose,
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      paidInstallments: 0,
      isActive: true
    });

    res.status(201).json({
      message: 'Kredi başarıyla eklendi',
      loan
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kredi güncelle
router.put('/:id', [
  auth,
  body('principal').optional().isNumeric().withMessage('Ana para sayısal değer olmalıdır'),
  body('interestRate').optional().isNumeric().withMessage('Faiz oranı sayısal değer olmalıdır')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const loan = db.update('loans', req.params.id, req.body);

    if (!loan) {
      return res.status(404).json({ message: 'Kredi bulunamadı' });
    }

    res.json({
      message: 'Kredi başarıyla güncellendi',
      loan
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kredi sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = db.delete('loans', req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Kredi bulunamadı' });
    }

    res.json({ message: 'Kredi başarıyla silindi' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kredi ödemesi kaydet
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

    const { amount, paymentDate = new Date().toISOString(), isExtraPayment = false } = req.body;
    const loan = db.findById('loans', req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Kredi bulunamadı' });
    }

    // Ödeme kaydını ekle
    const payment = db.add('loanPayments', {
      userId: req.user._id.toString(),
      loanId: req.params.id,
      amount,
      paymentDate,
      isExtraPayment,
      installmentNumber: isExtraPayment ? null : loan.paidInstallments + 1
    });

    // Kredi durumunu güncelle
    if (!isExtraPayment) {
      const updatedLoan = db.update('loans', req.params.id, {
        paidInstallments: loan.paidInstallments + 1
      });
      
      res.json({
        message: 'Taksit ödemesi başarıyla kaydedildi',
        payment,
        loan: updatedLoan
      });
    } else {
      res.json({
        message: 'Ek ödeme başarıyla kaydedildi',
        payment,
        loan
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kredi ödeme geçmişi
router.get('/:id/payments', auth, async (req, res) => {
  try {
    const payments = db.findByFilter('loanPayments', payment => payment.loanId === req.params.id);
    
    res.json(payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kredi özeti
router.get('/summary', auth, async (req, res) => {
  try {
    const loans = db.findByUser('loans', req.user._id.toString());
    const activeLoans = loans.filter(loan => loan.isActive && loan.paidInstallments < loan.termMonths);
    
    const summary = {
      totalLoans: loans.length,
      activeLoans: activeLoans.length,
      totalPrincipal: activeLoans.reduce((sum, loan) => sum + loan.principal, 0),
      totalMonthlyPayment: activeLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0),
      totalRemainingAmount: activeLoans.reduce((sum, loan) => {
        const remainingPayments = loan.termMonths - loan.paidInstallments;
        return sum + (remainingPayments * loan.monthlyPayment);
      }, 0),
      completedLoans: loans.filter(loan => loan.paidInstallments >= loan.termMonths).length
    };

    res.json(summary);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Aylık taksit hesaplama fonksiyonu
function calculateMonthlyPayment(principal, annualRate, termMonths) {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) {
    return principal / termMonths;
  }
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
}

// Sonraki ödeme tarihi hesaplama
function calculateNextPaymentDate(startDate, installmentNumber) {
  const start = new Date(startDate);
  const nextDate = new Date(start);
  nextDate.setMonth(start.getMonth() + installmentNumber);
  return nextDate.toISOString();
}

module.exports = router;
