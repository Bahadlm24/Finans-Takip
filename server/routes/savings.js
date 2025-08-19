const express = require('express');
const auth = require('../middleware/auth');
const db = require('../utils/jsonDatabase');

const router = express.Router();

// Birikim hedefleri listesi
router.get('/goals', auth, async (req, res) => {
  try {
    const savingsGoals = db.findByFilter('savingsGoals', goal => goal.userId === req.user.id);
    res.json(savingsGoals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Birikim tavsiyeleri
router.get('/recommendations', auth, async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const userId = req.user.id;
    
    // Son 3 ayın verilerini al
    const last3Months = [];
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
      
      last3Months.push({ startDate, endDate, month: monthDate.getMonth() + 1, year: monthDate.getFullYear() });
    }

    // Finansal analiz için veriler
    const monthlyAnalysis = [];
    
    for (const period of last3Months) {
      // Gelirler
      const incomes = db.findByFilter('income', income => 
        income.userId === userId && 
        new Date(income.date) >= period.startDate && 
        new Date(income.date) <= period.endDate
      );
      const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

      // Harcamalar
      const expenses = db.findByFilter('expenses', expense => 
        expense.userId === userId && 
        new Date(expense.date) >= period.startDate && 
        new Date(expense.date) <= period.endDate
      );
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Faturalar
      const bills = db.findByFilter('bills', bill => 
        bill.userId === userId && 
        new Date(bill.dueDate) >= period.startDate && 
        new Date(bill.dueDate) <= period.endDate && 
        bill.isPaid === true
      );
      const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);

      monthlyAnalysis.push({
        month: period.month,
        year: period.year,
        income: totalIncome,
        expenses: totalExpenses,
        bills: totalBills,
        netSavings: totalIncome - totalExpenses - totalBills
      });
    }

    // Ortalama hesaplamaları
    const avgIncome = monthlyAnalysis.reduce((sum, month) => sum + month.income, 0) / 3;
    const avgExpenses = monthlyAnalysis.reduce((sum, month) => sum + month.expenses, 0) / 3;
    const avgBills = monthlyAnalysis.reduce((sum, month) => sum + month.bills, 0) / 3;
    const avgNetSavings = avgIncome - avgExpenses - avgBills;
    const savingsRate = avgIncome > 0 ? (avgNetSavings / avgIncome) * 100 : 0;

    // Harcama analizi
    const expensesByCategory = {};
    const allExpenses = db.findByFilter('expenses', expense => expense.userId === userId);
    allExpenses.forEach(expense => {
      const monthDate = new Date(expense.date);
      if (monthDate >= last3Months[2].startDate && monthDate <= last3Months[0].endDate) {
        if (!expensesByCategory[expense.category]) {
          expensesByCategory[expense.category] = 0;
        }
        expensesByCategory[expense.category] += expense.amount;
      }
    });

    // En yüksek harcama kategorileri
    const topExpenseCategories = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount / 3), // Aylık ortalama
        percentage: ((amount / (avgExpenses * 3)) * 100).toFixed(1)
      }));

    // Tavsiyeler oluştur
    const recommendations = [];

    // Birikim oranı tavsiyesi
    if (savingsRate < 10) {
      recommendations.push({
        type: 'savings_rate',
        priority: 'high',
        title: 'Birikim Oranınızı Artırın',
        description: `Mevcut birikim oranınız %${savingsRate.toFixed(1)}. Finansal uzmanlar gelirin en az %20'sinin biriktirilmesini önerir.`,
        actionItems: [
          'Aylık harcamalarınızı gözden geçirin',
          'Gereksiz abonelikleri iptal edin',
          'Dışarıda yemek yeme sıklığını azaltın'
        ],
        potentialSaving: avgIncome * 0.2 - avgNetSavings
      });
    }

    // Yüksek harcama kategorileri için tavsiye
    if (topExpenseCategories.length > 0) {
      const highestCategory = topExpenseCategories[0];
      if (parseFloat(highestCategory.percentage) > 25) {
        recommendations.push({
          type: 'category_optimization',
          priority: 'medium',
          title: `${getCategoryName(highestCategory.category)} Harcamalarını Optimize Edin`,
          description: `${getCategoryName(highestCategory.category)} kategorisinde aylık ${highestCategory.amount.toLocaleString('tr-TR')} TL harcama yapıyorsunuz (${highestCategory.percentage}%).`,
          actionItems: [
            'Bu kategorideki harcamalarınızı detaylı inceleyin',
            'Alternatif, daha ekonomik seçenekleri araştırın',
            `Bu kategori için aylık bütçe limiti belirleyin`
          ],
          potentialSaving: highestCategory.amount * 0.15
        });
      }
    }

    // Acil durum fonu tavsiyesi
    const emergencyFundTarget = (avgExpenses + avgBills) * 6; // 6 aylık harcama
    const estimatedEmergencyFund = avgNetSavings * 12; // Yıllık biriktirdiği miktar
    
    if (estimatedEmergencyFund < emergencyFundTarget) {
      recommendations.push({
        type: 'emergency_fund',
        priority: 'high',
        title: 'Acil Durum Fonu Oluşturun',
        description: `6 aylık harcamanız için ${emergencyFundTarget.toLocaleString('tr-TR')} TL acil durum fonuna ihtiyacınız var.`,
        actionItems: [
          'Aylık gelirin %10\'unu otomatik olarak acil durum fonuna ayır',
          'Ayrı bir tasarruf hesabı açın',
          'Bu parayı yüksek getirili ama likit yatırım araçlarında değerlendir'
        ],
        potentialSaving: emergencyFundTarget - estimatedEmergencyFund
      });
    }

    // Borç optimizasyonu tavsiyesi
    const creditCards = db.findByFilter('creditCards', card => card.userId === userId);
    const totalCreditCardDebt = creditCards.reduce((sum, card) => sum + card.currentDebt, 0);
    
    if (totalCreditCardDebt > avgIncome) {
      recommendations.push({
        type: 'debt_optimization',
        priority: 'high',
        title: 'Kredi Kartı Borçlarınızı Azaltın',
        description: `Toplam ${totalCreditCardDebt.toLocaleString('tr-TR')} TL kredi kartı borcunuz var. Bu, aylık gelirinizden fazla.`,
        actionItems: [
          'En yüksek faizli kartları önce kapatın',
          'Minimum ödemelerin üzerinde ödeme yapın',
          'Nakit avans kullanımından kaçının',
          'Borç transferi seçeneklerini değerlendirin'
        ],
        potentialSaving: totalCreditCardDebt * 0.02 // Aylık faiz tasarrufu
      });
    }

    // Yatırım tavsiyesi
    if (avgNetSavings > 0 && savingsRate >= 15) {
      recommendations.push({
        type: 'investment',
        priority: 'low',
        title: 'Yatırım Portföyü Oluşturun',
        description: `Aylık ${avgNetSavings.toLocaleString('tr-TR')} TL biriktiriyorsunuz. Bu parayı değerlendirmeyi düşünün.`,
        actionItems: [
          'Risk profilinizi belirleyin',
          'Çeşitlendirilmiş bir portföy oluşturun',
          'Düşük maliyetli endeks fonlarını araştırın',
          'Uzun vadeli yatırım planı yapın'
        ],
        potentialSaving: avgNetSavings * 12 * 0.08 // %8 yıllık getiri varsayımı
      });
    }

    // Otomatik birikim tavsiyesi
    if (avgNetSavings > 0) {
      recommendations.push({
        type: 'automatic_saving',
        priority: 'medium',
        title: 'Otomatik Birikim Sistemi Kurun',
        description: 'Düzenli birikim yapmak için otomatik talimat verin.',
        actionItems: [
          'Maaş gününde otomatik olarak para transferi ayarlayın',
          'Pay yourself first prensibini uygulayın',
          'Hedef odaklı birikim hesapları açın'
        ],
        potentialSaving: avgNetSavings * 1.2 // %20 artış beklentisi
      });
    }

    res.json({
      monthlyAnalysis: monthlyAnalysis.reverse(),
      averages: {
        income: Math.round(avgIncome),
        expenses: Math.round(avgExpenses),
        bills: Math.round(avgBills),
        netSavings: Math.round(avgNetSavings),
        savingsRate: Math.round(savingsRate * 100) / 100
      },
      topExpenseCategories,
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kategori isimlerini Türkçeye çevir
function getCategoryName(category) {
  const categoryNames = {
    'food': 'Yiyecek & İçecek',
    'transportation': 'Ulaşım',
    'shopping': 'Alışveriş',
    'entertainment': 'Eğlence',
    'health': 'Sağlık',
    'education': 'Eğitim',
    'other': 'Diğer',
    'housing': 'Konut',
    'utilities': 'Faturalar'
  };
  return categoryNames[category] || category;
}

// Birikim hedefleri
router.get('/goals', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Kullanıcının birikim hedeflerini getir (eğer varsa)
    const savingsGoals = db.findByFilter('savingsGoals', goal => goal.userId === userId);
    
    // Varsayılan hedefler
    if (savingsGoals.length === 0) {
      const defaultGoals = [
        {
          name: 'Acil Durum Fonu',
          targetAmount: 50000,
          currentAmount: 0,
          targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'emergency',
          priority: 'high'
        },
        {
          name: 'Tatil Fonu',
          targetAmount: 15000,
          currentAmount: 0,
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'vacation',
          priority: 'medium'
        }
      ];
      
      res.json(defaultGoals);
    } else {
      res.json(savingsGoals);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Birikim hedefi ekleme endpoint'i
router.post('/goals', auth, async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, category, description } = req.body;
    
    const goal = db.add('savingsGoals', {
      userId: req.user.id,
      name: name || '',
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: targetDate || null,
      category: category || 'other',
      description: description || '',
      createdAt: new Date().toISOString(),
      status: 'active'
    });

    res.status(201).json({
      message: 'Birikim hedefi başarıyla eklendi',
      goal
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Birikim hedefi güncelleme endpoint'i
router.put('/goals/:id', auth, async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, category, description } = req.body;
    
    const existingGoal = db.findById('savingsGoals', parseInt(req.params.id));
    if (!existingGoal || existingGoal.userId !== req.user.id) {
      return res.status(404).json({ message: 'Birikim hedefi bulunamadı' });
    }

    const updatedGoal = db.update('savingsGoals', parseInt(req.params.id), {
      name: name !== undefined ? name : existingGoal.name,
      targetAmount: targetAmount !== undefined ? parseFloat(targetAmount) : existingGoal.targetAmount,
      currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : existingGoal.currentAmount,
      targetDate: targetDate !== undefined ? targetDate : existingGoal.targetDate,
      category: category !== undefined ? category : existingGoal.category,
      description: description !== undefined ? description : existingGoal.description,
      updatedAt: new Date().toISOString()
    });

    res.json({
      message: 'Birikim hedefi başarıyla güncellendi',
      goal: updatedGoal
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Birikim hedefi silme endpoint'i
router.delete('/goals/:id', auth, async (req, res) => {
  try {
    const existingGoal = db.findById('savingsGoals', parseInt(req.params.id));
    if (!existingGoal || existingGoal.userId !== req.user.id) {
      return res.status(404).json({ message: 'Birikim hedefi bulunamadı' });
    }

    db.deleteById('savingsGoals', parseInt(req.params.id));

    res.json({ message: 'Birikim hedefi başarıyla silindi' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
