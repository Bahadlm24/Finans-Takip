const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../utils/jsonDatabase');

const router = express.Router();

// Profil bilgilerini getir
router.get('/profile', auth, async (req, res) => {
  try {
    const user = db.findById('users', req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const { password, ...userProfile } = user;
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      monthlySalary: user.monthlySalary || 0,
      savingsGoal: user.savingsGoal || 0,
      currency: user.currency || 'TRY'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Profil güncelle
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('İsim en az 2 karakter olmalıdır'),
  body('monthlySalary').optional().isNumeric().withMessage('Maaş sayısal değer olmalıdır'),
  body('savingsGoal').optional().isNumeric().withMessage('Birikim hedefi sayısal değer olmalıdır')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, monthlySalary, savingsGoal, currency } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (monthlySalary !== undefined) updateData.monthlySalary = monthlySalary;
    if (savingsGoal !== undefined) updateData.savingsGoal = savingsGoal;
    if (currency) updateData.currency = currency;

    const user = db.update('users', req.user.id, updateData);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json({
      message: 'Profil başarıyla güncellendi',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlySalary: user.monthlySalary,
        savingsGoal: user.savingsGoal,
        currency: user.currency
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
