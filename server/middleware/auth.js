const jwt = require('jsonwebtoken');
const db = require('../utils/jsonDatabase');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı, erişim reddedildi' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.findById('users', decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Şifre bilgisini çıkar
    const { password, ...userWithoutPassword } = user;
    req.user = { ...userWithoutPassword, _id: user.id };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token geçersiz' });
  }
};

module.exports = auth;
