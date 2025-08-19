# 💰 Finansal Takip Uygulaması

Modern ve kullanıcı dostu arayüzü ile kişisel finanslarınızı takip edin, analiz edin ve akıllı tasarruf önerileri alın.

## ✨ Özellikler

### � Kullanıcı Yönetimi
- Güvenli kullanıcı kaydı ve giriş sistemi
- Kullanıcı profili yönetimi
- Oturum güvenlik kontrolü

### � Gelir Takibi
- Maaş, ek gelir ve diğer gelir türlerini kaydetme
- Aylık gelir analizi ve grafikleri
- Gelir kaynak kategorileri

### 🛒 Harcama Yönetimi
- Kategorilere göre harcama takibi
- Harcama trendleri ve analizi
- Aylık/yıllık harcama raporları
- Harcama hedefleri belirleme

### 🧾 Fatura Takibi
- Düzenli faturalarınızı takip edin (elektrik, su, doğalgaz, internet, telefon)
- Fatura ödeme hatırlatıcıları
- Fatura trend analizi
- Yıllık fatura maliyet hesaplamaları

### � Kredi Kartı Yönetimi
- Kredi kartı borç takibi
- Minimum ödeme hesaplamaları
- Faiz oranları ve toplam borç analizi
- Kredi kartı kullanım tavsiyeleri

### 🏦 Kredi Takibi
- Mevcut kredilerinizi takip edin
- Kalan borç ve ödeme planları
- Erken kapatma hesaplamaları
- Kredi faiz analizi

### � Birikim ve Yatırım
- Tasarruf hedefleri belirleme
- Birikim trend analizi
- Yatırım önerileri
- Mali durum değerlendirmesi

### 📊 Detaylı Analizler
- Kapsamlı mali durum raporu
- Gelir-gider dengesi analizi
- Net mal varlığı hesaplama
- Görsel grafikler ve çizelgeler
- Aylık/yıllık karşılaştırmalar

### 🎨 Kullanıcı Deneyimi
- Modern dark/light tema desteği
- Responsive mobil uyumlu tasarım
- Sezgisel kullanıcı arayüzü
- Hızlı navigasyon ve erişim

## 🛠 Teknolojiler

### Frontend
- **React 18** - Modern UI framework
- **Material-UI (MUI)** - Profesyonel UI bileşenleri
- **React Router v6** - SPA routing
- **Recharts** - Veri görselleştirme
- **Axios** - HTTP client
- **Context API** - State yönetimi

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JSON File Database** - Basit veri depolama
- **bcryptjs** - Şifre hashleme
- **Simple Authentication** - Session yönetimi

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
