# Finansal Takip Uygulaması

Modern bir web uygulaması ile kişisel finans yönetimi ve birikim tavsiyeleri.

## Özellikler

- 👤 Kullanıcı girişi ve kayıt sistemi
- 💰 Maaş takibi
- 🧾 Harcama yönetimi (kategorilere göre)
- 🏠 Düzenli fatura takibi (elektrik, su, doğalgaz, internet)
- 💡 Akıllı birikim tavsiyeleri
- 📊 Finansal raporlar ve grafikler
- 📱 Responsive tasarım

## Teknolojiler

### Frontend
- React 18
- Material-UI (MUI)
- Chart.js
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcryptjs

## Kurulum

### Tüm bağımlılıkları yüklemek için:
```bash
npm run install-all
```

### Geliştirme modunda çalıştırmak için:
```bash
npm run dev
```

Bu komut hem frontend hem de backend'i aynı anda çalıştırır:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Proje Yapısı

```
finans-takip/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
├── server/          # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi

### User
- `GET /api/user/profile` - Kullanıcı profili
- `PUT /api/user/profile` - Profil güncelleme

### Income
- `GET /api/income` - Gelir listesi
- `POST /api/income` - Yeni gelir ekleme
- `PUT /api/income/:id` - Gelir güncelleme
- `DELETE /api/income/:id` - Gelir silme

### Expenses  
- `GET /api/expenses` - Harcama listesi
- `POST /api/expenses` - Yeni harcama ekleme
- `PUT /api/expenses/:id` - Harcama güncelleme
- `DELETE /api/expenses/:id` - Harcama silme

### Bills
- `GET /api/bills` - Fatura listesi
- `POST /api/bills` - Yeni fatura ekleme
- `PUT /api/bills/:id` - Fatura güncelleme
- `DELETE /api/bills/:id` - Fatura silme

### Savings
- `GET /api/savings/recommendations` - Birikim tavsiyeleri

## Ortam Değişkenleri

Server klasöründe `.env` dosyası oluşturun:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finans-takip
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```
