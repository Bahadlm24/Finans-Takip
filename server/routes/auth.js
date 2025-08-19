const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../utils/jsonDatabase');

const router = express.Router();

// Token oluşturma fonksiyonu
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Şifre hashleme
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Şifre karşılaştırma
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Kullanıcı kaydı
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('İsim en az 2 karakter olmalıdır'),
  body('email').isEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Kullanıcı zaten var mı kontrol et
    const existingUser = db.findByFilter('users', user => user.email === email.toLowerCase());
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Bu email adresi zaten kayıtlı' });
    }

    // Şifreyi hashle
    const hashedPassword = await hashPassword(password);

    // Yeni kullanıcı oluştur
    const user = db.add('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      monthlySalary: 0,
      savingsGoal: 0,
      currency: 'TRY'
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Kullanıcı başarıyla kaydedildi',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlySalary: user.monthlySalary,
        savingsGoal: user.savingsGoal
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı girişi
router.post('/login', [
  body('email').isEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('password').exists().withMessage('Şifre gereklidir')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Kullanıcıyı bul
    const users = db.findByFilter('users', user => user.email === email.toLowerCase());
    if (users.length === 0) {
      return res.status(400).json({ message: 'Geçersiz email veya şifre' });
    }

    const user = users[0];

    // Şifre kontrolü
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz email veya şifre' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlySalary: user.monthlySalary,
        savingsGoal: user.savingsGoal
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
