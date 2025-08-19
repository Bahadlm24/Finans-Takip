import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Savings
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    income: 0,
    expenses: 0,
    bills: 0,
    creditCards: 0,
    loans: 0,
    savings: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Şimdilik mock data kullanıyoruz
      setDashboardData({
        income: 25000,
        expenses: 18000,
        bills: 3500,
        creditCards: 2500,
        loans: 8500,
        savings: 5000
      });
    } catch (error) {
      console.error('Dashboard verisi yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary', trend }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Box sx={{ color: `${color}.main`, mr: 2 }}>
            {icon}
          </Box>
          <Box flexGrow={1}>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5">
              ₺{value?.toLocaleString() || 0}
            </Typography>
            {trend && (
              <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
                {trend > 0 ? '+' : ''}{trend}%
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  const netWorth = dashboardData.income - dashboardData.expenses - dashboardData.bills - dashboardData.creditCards;
  const savingsRate = dashboardData.income > 0 ? (netWorth / dashboardData.income) * 100 : 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        pt: 12, // Increased padding top to clear navbar
        pb: 4,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            background: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(15, 23, 42, 0.6)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: 4,
            mb: 4,
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(148, 163, 184, 0.1)'
              : 'rgba(203, 213, 225, 0.3)',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              textAlign: 'center',
              mb: 4,
            }}
          >
            Hoş geldiniz, {user?.name}!
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
        {/* Ana Metrikler */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Aylık Gelir"
            value={dashboardData.income}
            icon={<TrendingUp />}
            color="success"
            trend={5.2}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Aylık Harcama"
            value={dashboardData.expenses}
            icon={<TrendingDown />}
            color="error"
            trend={-2.1}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Faturalar"
            value={dashboardData.bills}
            icon={<Receipt />}
            color="warning"
            trend={1.5}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Kredi Kartı Borç"
            value={dashboardData.creditCards}
            icon={<CreditCard />}
            color="error"
            trend={-8.3}
          />
        </Grid>

        {/* Net Mal Varlığı */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Net Mal Varlığı
              </Typography>
              <Typography variant="h4" color={netWorth >= 0 ? 'success.main' : 'error.main'} gutterBottom>
                ₺{netWorth.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Bu ay {netWorth >= 0 ? 'pozitif' : 'negatif'} net değer
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Birikim Oranı */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Birikim Oranı
              </Typography>
              <Typography variant="h4" color={savingsRate >= 20 ? 'success.main' : 'warning.main'} gutterBottom>
                %{savingsRate.toFixed(1)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(savingsRate * 5, 100)} 
                color={savingsRate >= 20 ? 'success' : 'warning'}
                sx={{ mt: 2 }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {savingsRate >= 20 ? 'Mükemmel!' : savingsRate >= 10 ? 'İyi' : 'Geliştirilmeli'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Hızlı Eylemler */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hızlı Başlangıç
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Finansal takibinizi başlatmak için:
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                • Gelirlerinizi kaydedin
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Aylık harcamalarınızı kategorilere ayırın
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Faturalarınızı düzenli ödeme için ekleyin
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Kredi kartlarınızı takip altına alın
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Birikim hedeflerinizi belirleyin
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
