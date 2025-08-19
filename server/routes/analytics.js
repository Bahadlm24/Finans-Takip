const express = require('express');
const auth = require('../middleware/auth');
const db = require('../utils/jsonDatabase');

const router = express.Router();

// Net mal varlığı hesaplama
router.get('/net-worth', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { startDate, endDate, period = 'monthly' } = req.query;
    
    // Tarih aralığını belirle
    const dateRange = getDateRange(startDate, endDate, period);
    
    const netWorthData = [];
    
    for (const datePoint of dateRange) {
      const periodStart = new Date(datePoint.start);
      const periodEnd = new Date(datePoint.end);
      
      // Gelirler
      const incomes = db.findByFilter('income', income => 
        income.userId === userId && 
        new Date(income.date) >= periodStart && 
        new Date(income.date) <= periodEnd
      );
      const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
      
      // Harcamalar
      const expenses = db.findByFilter('expenses', expense => 
        expense.userId === userId && 
        new Date(expense.date) >= periodStart && 
        new Date(expense.date) <= periodEnd
      );
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Faturalar
      const bills = db.findByFilter('bills', bill => 
        bill.userId === userId && 
        new Date(bill.dueDate) >= periodStart && 
        new Date(bill.dueDate) <= periodEnd &&
        bill.isPaid
      );
      const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
      
      // Kredi kartı borçları (period end'e göre)
      const creditCards = db.findByUser('creditCards', userId);
      const totalCreditCardDebt = creditCards.reduce((sum, card) => sum + card.currentDebt, 0);
      
      // Kredi borçları (period end'e göre)
      const loans = db.findByUser('loans', userId);
      const totalLoanDebt = loans.reduce((sum, loan) => {
        const remainingPayments = loan.termMonths - loan.paidInstallments;
        return sum + (remainingPayments * loan.monthlyPayment);
      }, 0);
      
      // Kredi kartı ödemeleri
      const creditCardPayments = db.findByFilter('creditCardPayments', payment => 
        payment.userId === userId && 
        new Date(payment.paymentDate) >= periodStart && 
        new Date(payment.paymentDate) <= periodEnd &&
        payment.type === 'payment'
      );
      const totalCreditCardPayments = creditCardPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Kredi ödemeleri
      const loanPayments = db.findByFilter('loanPayments', payment => 
        payment.userId === userId && 
        new Date(payment.paymentDate) >= periodStart && 
        new Date(payment.paymentDate) <= periodEnd
      );
      const totalLoanPayments = loanPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Net değişim hesaplama
      const totalOutflow = totalExpenses + totalBills + totalCreditCardPayments + totalLoanPayments;
      const netChange = totalIncome - totalOutflow;
      
      // Birikimler hesaplama (gelir - harcama - faturalar - minimum kredi kartı ödemeleri - kredi taksitleri)
      const minimumCreditCardPayments = creditCards.reduce((sum, card) => {
        return sum + Math.max(card.currentDebt * (card.minimumPaymentRate / 100), card.minimumPaymentAmount || 100);
      }, 0);
      
      const monthlyLoanPayments = loans.filter(loan => loan.paidInstallments < loan.termMonths)
        .reduce((sum, loan) => sum + loan.monthlyPayment, 0);
      
      const theoreticalSavings = totalIncome - totalExpenses - totalBills - minimumCreditCardPayments - monthlyLoanPayments;
      
      netWorthData.push({
        period: datePoint.label,
        date: periodEnd.toISOString().split('T')[0],
        income: totalIncome,
        expenses: totalExpenses,
        bills: totalBills,
        creditCardPayments: totalCreditCardPayments,
        loanPayments: totalLoanPayments,
        netChange,
        theoreticalSavings: Math.max(0, theoreticalSavings),
        totalCreditCardDebt,
        totalLoanDebt,
        totalDebt: totalCreditCardDebt + totalLoanDebt,
        cashFlow: {
          inflow: totalIncome,
          outflow: totalOutflow,
          net: netChange
        }
      });
    }
    
    // Kümülatif hesaplama
    let cumulativeNetWorth = 0;
    const enrichedData = netWorthData.map(item => {
      cumulativeNetWorth += item.netChange;
      return {
        ...item,
        cumulativeNetWorth,
        savingsRate: item.income > 0 ? ((item.theoreticalSavings / item.income) * 100).toFixed(2) : 0
      };
    });

    res.json({
      data: enrichedData,
      summary: {
        totalPeriods: enrichedData.length,
        averageIncome: enrichedData.reduce((sum, item) => sum + item.income, 0) / enrichedData.length,
        averageExpenses: enrichedData.reduce((sum, item) => sum + item.expenses, 0) / enrichedData.length,
        averageNetChange: enrichedData.reduce((sum, item) => sum + item.netChange, 0) / enrichedData.length,
        finalNetWorth: cumulativeNetWorth,
        averageSavingsRate: enrichedData.reduce((sum, item) => sum + parseFloat(item.savingsRate), 0) / enrichedData.length,
        currentTotalDebt: enrichedData.length > 0 ? enrichedData[enrichedData.length - 1].totalDebt : 0
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Detaylı finansal rapor
router.get('/financial-report', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { year, month } = req.query;
    
    // Bu ay için veriler
    const currentDate = new Date();
    const reportYear = year || currentDate.getFullYear();
    const reportMonth = month || currentDate.getMonth() + 1;
    
    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59);
    
    // Tüm finansal verileri topla
    const report = {
      period: `${reportYear}-${String(reportMonth).padStart(2, '0')}`,
      
      // Gelirler
      income: {
        items: db.findByFilter('income', income => 
          income.userId === userId && 
          new Date(income.date) >= startDate && 
          new Date(income.date) <= endDate
        ),
        total: 0
      },
      
      // Harcamalar
      expenses: {
        items: db.findByFilter('expenses', expense => 
          expense.userId === userId && 
          new Date(expense.date) >= startDate && 
          new Date(expense.date) <= endDate
        ),
        total: 0,
        byCategory: {}
      },
      
      // Faturalar
      bills: {
        items: db.findByFilter('bills', bill => 
          bill.userId === userId && 
          new Date(bill.dueDate) >= startDate && 
          new Date(bill.dueDate) <= endDate
        ),
        total: 0,
        paid: 0,
        unpaid: 0
      },
      
      // Kredi kartları
      creditCards: {
        items: db.findByUser('creditCards', userId),
        totalDebt: 0,
        totalLimit: 0,
        totalMinimumPayment: 0,
        payments: db.findByFilter('creditCardPayments', payment => 
          payment.userId === userId && 
          new Date(payment.paymentDate) >= startDate && 
          new Date(payment.paymentDate) <= endDate
        )
      },
      
      // Krediler
      loans: {
        items: db.findByUser('loans', userId),
        totalMonthlyPayment: 0,
        totalRemainingDebt: 0,
        payments: db.findByFilter('loanPayments', payment => 
          payment.userId === userId && 
          new Date(payment.paymentDate) >= startDate && 
          new Date(payment.paymentDate) <= endDate
        )
      }
    };
    
    // Gelir toplamı
    report.income.total = report.income.items.reduce((sum, item) => sum + item.amount, 0);
    
    // Harcama toplamı ve kategori analizi
    report.expenses.total = report.expenses.items.reduce((sum, item) => sum + item.amount, 0);
    report.expenses.items.forEach(expense => {
      if (!report.expenses.byCategory[expense.category]) {
        report.expenses.byCategory[expense.category] = 0;
      }
      report.expenses.byCategory[expense.category] += expense.amount;
    });
    
    // Fatura analizi
    report.bills.total = report.bills.items.reduce((sum, item) => sum + item.amount, 0);
    report.bills.paid = report.bills.items.filter(bill => bill.isPaid).reduce((sum, item) => sum + item.amount, 0);
    report.bills.unpaid = report.bills.total - report.bills.paid;
    
    // Kredi kartı analizi
    report.creditCards.totalDebt = report.creditCards.items.reduce((sum, card) => sum + card.currentDebt, 0);
    report.creditCards.totalLimit = report.creditCards.items.reduce((sum, card) => sum + card.limit, 0);
    report.creditCards.totalMinimumPayment = report.creditCards.items.reduce((sum, card) => {
      return sum + Math.max(card.currentDebt * (card.minimumPaymentRate / 100), card.minimumPaymentAmount || 100);
    }, 0);
    
    // Kredi analizi
    const activeLoans = report.loans.items.filter(loan => loan.paidInstallments < loan.termMonths);
    report.loans.totalMonthlyPayment = activeLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
    report.loans.totalRemainingDebt = activeLoans.reduce((sum, loan) => {
      const remainingPayments = loan.termMonths - loan.paidInstallments;
      return sum + (remainingPayments * loan.monthlyPayment);
    }, 0);
    
    // Özet hesaplamalar
    const totalIncome = report.income.total;
    const totalFixedExpenses = report.bills.total + report.loans.totalMonthlyPayment + report.creditCards.totalMinimumPayment;
    const totalVariableExpenses = report.expenses.total;
    const totalExpenses = totalFixedExpenses + totalVariableExpenses;
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome * 100).toFixed(2) : 0;
    
    report.summary = {
      totalIncome,
      totalFixedExpenses,
      totalVariableExpenses,
      totalExpenses,
      netSavings,
      savingsRate: parseFloat(savingsRate),
      debtToIncomeRatio: totalIncome > 0 ? ((report.creditCards.totalDebt + report.loans.totalRemainingDebt) / totalIncome * 100).toFixed(2) : 0,
      creditUtilization: report.creditCards.totalLimit > 0 ? (report.creditCards.totalDebt / report.creditCards.totalLimit * 100).toFixed(2) : 0
    };

    res.json(report);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tarih aralığı oluşturma fonksiyonu
function getDateRange(startDate, endDate, period) {
  const ranges = [];
  const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1);
  const end = endDate ? new Date(endDate) : new Date();
  
  if (period === 'monthly') {
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      ranges.push({
        start: current.toISOString(),
        end: monthEnd.toISOString(),
        label: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      });
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
  } else if (period === 'weekly') {
    let current = new Date(start);
    while (current <= end) {
      const weekEnd = new Date(current);
      weekEnd.setDate(current.getDate() + 6);
      ranges.push({
        start: current.toISOString(),
        end: weekEnd.toISOString(),
        label: `${current.getFullYear()}-W${Math.ceil(current.getDate() / 7)}`
      });
      current.setDate(current.getDate() + 7);
    }
  }
  
  return ranges;
}

module.exports = router;
