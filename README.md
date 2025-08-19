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

## 📦 Kurulum

### Ön Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn

### 1. Repository'yi klonlayın
```bash
git clone https://github.com/Bahadlm24/Finans-Takip.git
cd Finans-Takip
```

### 2. Tüm bağımlılıkları yükleyin
```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 3. Ortam değişkenlerini ayarlayın
Server klasöründe `.env` dosyası oluşturun (aşağıdaki bölüme bakın)

### 4. Uygulamayı çalıştırın

#### Geliştirme Modu (Tüm servisler)
```bash
npm run dev
```

#### Manuel Çalıştırma
```bash
# Backend'i çalıştır
cd server
npm start

# Yeni terminal - Frontend'i çalıştır  
cd client
npm start
```

## 🌐 Erişim

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔧 Ortam Değişkenleri

Server klasöründe `.env` dosyası oluşturun:

```env
# Port ayarları
PORT=5000

# Veritabanı (JSON dosya tabanlı)
DATA_DIR=./data

# Geliştirme ortamı
NODE_ENV=development

# Session ayarları (isteğe bağlı)
SESSION_SECRET=your_random_session_secret_here

# CORS ayarları
CLIENT_URL=http://localhost:3000
```

**Not**: JWT kullanmıyoruz, basit session tabanlı authentication kullanıyoruz.

## 📁 Proje Yapısı

```
finans-takip/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI bileşenleri
│   │   │   └── Layout/     # Layout bileşenleri
│   │   ├── pages/          # Sayfa bileşenleri
│   │   │   ├── Auth/       # Giriş/Kayıt sayfaları
│   │   │   ├── Dashboard/  # Ana dashboard
│   │   │   ├── Income/     # Gelir sayfası
│   │   │   ├── Expenses/   # Harcama sayfası
│   │   │   ├── Bills/      # Fatura sayfası
│   │   │   ├── CreditCards/# Kredi kartı sayfası
│   │   │   ├── Loans/      # Kredi sayfası
│   │   │   ├── Savings/    # Birikim sayfası
│   │   │   ├── Analytics/  # Analiz sayfası
│   │   │   └── Profile/    # Profil sayfası
│   │   ├── contexts/       # React context'ler
│   │   │   ├── AuthContext.js
│   │   │   ├── ThemeContext.js
│   │   │   └── SnackbarContext.js
│   │   └── utils/          # Yardımcı fonksiyonlar
├── server/                 # Node.js Backend
│   ├── data/              # JSON veritabanı dosyaları
│   │   └── users.json
│   ├── models/            # Veri modelleri
│   ├── routes/            # API rotaları
│   │   ├── auth.js        # Authentication
│   │   ├── user.js        # Kullanıcı işlemleri
│   │   ├── income.js      # Gelir işlemleri
│   │   ├── expense.js     # Harcama işlemleri
│   │   ├── bill.js        # Fatura işlemleri
│   │   ├── creditCard.js  # Kredi kartı işlemleri
│   │   ├── loan.js        # Kredi işlemleri
│   │   ├── savings.js     # Birikim işlemleri
│   │   └── analytics.js   # Analiz işlemleri
│   ├── middleware/        # Ara yazılımlar
│   └── utils/             # Yardımcı fonksiyonlar
└── README.md
```

## 📡 API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı giriş işlemi
- `POST /api/auth/logout` - Güvenli çıkış işlemi

### 👤 User Management
- `GET /api/user/profile` - Kullanıcı profil bilgilerini getir
- `PUT /api/user/profile` - Kullanıcı profil güncelleme
- `DELETE /api/user/account` - Hesap silme işlemi

### 💰 Income Management (Gelir)
- `GET /api/income` - Tüm gelir kayıtlarını listele
- `POST /api/income` - Yeni gelir kaydı oluştur
- `PUT /api/income/:id` - Mevcut gelir kaydını güncelle
- `DELETE /api/income/:id` - Gelir kaydını sil
- `GET /api/income/monthly/:month` - Belirli ay gelir analizi

### 🛒 Expenses Management (Harcamalar)
- `GET /api/expenses` - Tüm harcama kayıtlarını listele
- `POST /api/expenses` - Yeni harcama kaydı oluştur
- `PUT /api/expenses/:id` - Mevcut harcama kaydını güncelle
- `DELETE /api/expenses/:id` - Harcama kaydını sil
- `GET /api/expenses/categories` - Harcama kategori listesi
- `GET /api/expenses/monthly/:month` - Aylık harcama analizi

### 🧾 Bills Management (Faturalar)
- `GET /api/bills` - Tüm fatura kayıtlarını listele
- `POST /api/bills` - Yeni fatura kaydı oluştur
- `PUT /api/bills/:id` - Mevcut fatura kaydını güncelle
- `DELETE /api/bills/:id` - Fatura kaydını sil
- `GET /api/bills/upcoming` - Yaklaşan fatura ödemeleri
- `POST /api/bills/:id/pay` - Fatura ödeme işlemi

### 💳 Credit Cards (Kredi Kartları)
- `GET /api/credit-cards` - Kredi kartı listesi
- `POST /api/credit-cards` - Yeni kredi kartı ekle
- `PUT /api/credit-cards/:id` - Kredi kartı bilgilerini güncelle
- `DELETE /api/credit-cards/:id` - Kredi kartını sil
- `GET /api/credit-cards/:id/transactions` - Kredi kartı işlemleri

### 🏦 Loans Management (Krediler)
- `GET /api/loans` - Kredi listesi
- `POST /api/loans` - Yeni kredi kaydı
- `PUT /api/loans/:id` - Kredi bilgilerini güncelle
- `DELETE /api/loans/:id` - Kredi kaydını sil
- `GET /api/loans/:id/payments` - Kredi ödeme planı

### 💎 Savings Management (Birikimler)
- `GET /api/savings` - Birikim hedefleri listesi
- `POST /api/savings` - Yeni birikim hedefi
- `PUT /api/savings/:id` - Birikim hedefini güncelle
- `DELETE /api/savings/:id` - Birikim hedefini sil
- `POST /api/savings/:id/contribute` - Birikime katkı ekle
- `GET /api/savings/recommendations` - Akıllı birikim tavsiyeleri

### 📊 Analytics & Reports (Analizler)
- `GET /api/analytics/dashboard` - Ana dashboard verileri
- `GET /api/analytics/monthly/:year/:month` - Aylık detay analiz
- `GET /api/analytics/yearly/:year` - Yıllık analiz raporu
- `GET /api/analytics/net-worth` - Net mal varlığı hesaplama
- `GET /api/analytics/trends` - Finansal trendler
- `GET /api/analytics/budgets` - Bütçe analizi
- `GET /api/analytics/forecasting` - Gelecek tahminleri

## 💾 Veri Yapısı

Uygulama JSON dosya tabanlı basit bir veritabanı kullanır:

### Users (Kullanıcılar)
```json
{
  "id": "user_uuid",
  "email": "user@email.com",
  "password": "hashed_password",
  "firstName": "İsim",
  "lastName": "Soyisim",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "profile": {
    "phone": "+90 555 123 4567",
    "dateOfBirth": "1990-01-01",
    "occupation": "Yazılım Geliştirici"
  }
}
```

### Income (Gelir)
```json
{
  "id": "income_uuid",
  "userId": "user_uuid",
  "amount": 15000,
  "category": "Maaş",
  "description": "Aylık maaş",
  "date": "2024-01-01",
  "recurring": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Expenses (Harcama)
```json
{
  "id": "expense_uuid",
  "userId": "user_uuid",
  "amount": 250,
  "category": "Market",
  "description": "Haftalık market alışverişi",
  "date": "2024-01-01",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 Gelişmiş Özellikler

### 🎨 Tema Sistemi
Uygulama Light/Dark tema desteği ile gelir:
- Kullanıcı tercihi otomatik kaydedilir
- Sistem teması otomatik algılama
- Material-UI tema entegrasyonu

### 📱 Responsive Tasarım
- Mobile-first yaklaşım
- Tablet ve desktop optimizasyonu
- Touch-friendly arayüz

### 🔔 Bildirimler
- Fatura ödeme hatırlatıcıları
- Birikim hedef bildirimleri
- Başarılı işlem onayları

### 📈 Akıllı Analizler
- Harcama trendleri analizi
- Gelir-gider dengesi uyarıları
- Tasarruf önerileri
- Mali durum değerlendirmesi

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add: Amazing Feature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

## 📞 İletişim

**Proje Sahibi**: [Bahadlm24](https://github.com/Bahadlm24)
**Repository**: [https://github.com/Bahadlm24/Finans-Takip](https://github.com/Bahadlm24/Finans-Takip)

---

💡 **Not**: Bu uygulama kişisel finans yönetimi için geliştirilmiştir. Gerçek yatırım tavsiyeleri için profesyonel danışmanlık alınız.
