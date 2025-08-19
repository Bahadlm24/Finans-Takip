import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Chip,
  Paper,
  Avatar,
  Divider,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Savings,
  Info,
  MonetizationOn,
  AccountBalanceWallet,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline,
  Assessment,
  Speed,
  Star,
  EmojiEvents,
  LocalAtm,
  ShoppingCart
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAuth } from '../../contexts/AuthContext';

// Chart.js kayıt
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  Filler
);

const Analytics = () => {
  const { token } = useAuth();
  const [netWorthData, setNetWorthData] = useState([]);
  const [financialReport, setFinancialReport] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const { showError } = useSnackbar();

  // Modern renkler - daha okunabilir
  const theme = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    gradient: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      success: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      info: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      light: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    },
    chartColors: [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
      '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ]
  };

  useEffect(() => {
    if (token) {
      fetchAnalyticsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, token]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        showError('Oturum açmanız gerekiyor');
        return;
      }

      const [netWorthResponse, reportResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/analytics/net-worth?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/analytics/financial-report', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setNetWorthData(netWorthResponse.data.data || []);
      setSummary(netWorthResponse.data.summary || {});
      setFinancialReport(reportResponse.data || {});
    } catch (error) {
      console.error('Analytics fetch error:', error);
      showError('Analitik veriler yüklenirken hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '₺0';
    return `₺${Math.abs(value).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getTrendIcon = (value, threshold = 0) => {
    if (!value && value !== 0) return <Info sx={{ color: theme.info }} />;
    return value >= threshold ? 
      <TrendingUp sx={{ color: theme.success }} /> : 
      <TrendingDown sx={{ color: theme.error }} />;
  };

  // Grafik seçenekleri
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: animationEnabled ? 1000 : 0,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Roboto'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: theme.primary,
        borderWidth: 1,
        cornerRadius: 10,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0,0,0,0.1)',
          drawBorder: false
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          },
          font: {
            size: 11
          }
        }
      }
    }
  };

  // Modern kart komponenti - Daha iyi kontrast
  const ModernCard = ({ children, gradient, elevation = 1, isDark = false, ...props }) => (
    <Card 
      sx={{ 
        background: gradient || 'white',
        boxShadow: `0 ${elevation * 2}px ${elevation * 8}px rgba(0,0,0,0.08)`,
        borderRadius: 4,
        border: gradient ? 'none' : '1px solid rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 ${elevation * 4}px ${elevation * 12}px rgba(0,0,0,0.12)`
        }
      }}
      {...props}
    >
      {children}
    </Card>
  );

  // İstatistik kartları - Daha okunaklı
  const StatCard = ({ title, value, icon, trend, color, subtitle, gradient, showTrend = true }) => (
    <ModernCard gradient={gradient} elevation={3} isDark={!!gradient}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: gradient ? 'rgba(255,255,255,0.9)' : 'text.secondary',
                fontWeight: 500,
                mb: 1
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                color: gradient ? 'white' : 'text.primary',
                fontWeight: 'bold', 
                mb: 0.5,
                fontSize: '1.75rem'
              }}
            >
              {typeof value === 'number' && value !== 0 ? formatCurrency(value) : 
               typeof value === 'string' ? value : 
               formatCurrency(value)}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: gradient ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                  fontSize: '0.75rem'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ 
            bgcolor: gradient ? 'rgba(255,255,255,0.2)' : `${color || theme.primary}20`,
            color: gradient ? 'white' : (color || theme.primary),
            width: 56,
            height: 56
          }}>
            {icon}
          </Avatar>
        </Box>
        {trend !== undefined && showTrend && (
          <Box display="flex" alignItems="center" mt={2}>
            {getTrendIcon(trend)}
            <Typography 
              variant="body2" 
              sx={{ 
                ml: 1, 
                color: gradient ? 'rgba(255,255,255,0.9)' : 'text.secondary',
                fontWeight: 500
              }}
            >
              {trend >= 0 ? '+' : ''}{trend?.toFixed(1)}% bu ay
            </Typography>
          </Box>
        )}
      </CardContent>
    </ModernCard>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <LinearProgress sx={{ width: '300px', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Finansal analitikler yükleniyor...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Sample data eğer gerçek data yoksa
  const sampleNetWorthData = netWorthData.length > 0 ? netWorthData : [
    { period: 'Ocak', income: 15000, expenses: 12000, netChange: 3000, cumulativeNetWorth: 3000, savingsRate: 20 },
    { period: 'Şubat', income: 16000, expenses: 11000, netChange: 5000, cumulativeNetWorth: 8000, savingsRate: 31.25 },
    { period: 'Mart', income: 14500, expenses: 13000, netChange: 1500, cumulativeNetWorth: 9500, savingsRate: 10.34 },
    { period: 'Nisan', income: 17000, expenses: 12500, netChange: 4500, cumulativeNetWorth: 14000, savingsRate: 26.47 },
    { period: 'Mayıs', income: 15500, expenses: 11800, netChange: 3700, cumulativeNetWorth: 17700, savingsRate: 23.87 },
    { period: 'Haziran', income: 18000, expenses: 13200, netChange: 4800, cumulativeNetWorth: 22500, savingsRate: 26.67 }
  ];

  // Chart.js veri formatları
  const netWorthChartData = {
    labels: sampleNetWorthData.map(item => item.period),
    datasets: [
      {
        label: 'Kümülatif Net Varlık',
        data: sampleNetWorthData.map(item => item.cumulativeNetWorth || 0),
        borderColor: theme.primary,
        backgroundColor: `${theme.primary}20`,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: theme.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Aylık Net Değişim',
        data: sampleNetWorthData.map(item => item.netChange || 0),
        borderColor: theme.success,
        backgroundColor: `${theme.success}20`,
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: theme.success,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }
    ]
  };

  const incomeVsExpenseData = {
    labels: sampleNetWorthData.map(item => item.period),
    datasets: [
      {
        label: 'Gelir',
        data: sampleNetWorthData.map(item => item.income || 0),
        backgroundColor: theme.success,
        borderColor: theme.success,
        borderRadius: 8,
        borderWidth: 2
      },
      {
        label: 'Gider',
        data: sampleNetWorthData.map(item => item.expenses || 0),
        backgroundColor: theme.error,
        borderColor: theme.error,
        borderRadius: 8,
        borderWidth: 2
      }
    ]
  };

  const savingsRateData = {
    labels: sampleNetWorthData.map(item => item.period),
    datasets: [
      {
        label: 'Birikim Oranı (%)',
        data: sampleNetWorthData.map(item => item.savingsRate || 0),
        borderColor: theme.warning,
        backgroundColor: `${theme.warning}20`,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: theme.warning,
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6
      }
    ]
  };

  // Kategori verileri (finansal rapor varsa kullan, yoksa sample)
  const categoryData = financialReport?.expenses?.byCategory ? {
    labels: Object.keys(financialReport.expenses.byCategory),
    datasets: [{
      data: Object.values(financialReport.expenses.byCategory),
      backgroundColor: theme.chartColors,
      borderWidth: 3,
      borderColor: '#fff',
      hoverBorderWidth: 4
    }]
  } : {
    labels: ['Yiyecek', 'Ulaşım', 'Eğlence', 'Kira', 'Faturalar', 'Diğer'],
    datasets: [{
      data: [3500, 1200, 800, 4000, 1500, 1000],
      backgroundColor: theme.chartColors,
      borderWidth: 3,
      borderColor: '#fff',
      hoverBorderWidth: 4
    }]
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section - Daha görünür */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
        sx={{
          backgroundColor: 'background.paper',
          padding: 3,
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.08)'
        }}
      >
        <Box>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold', 
              color: theme.primary,
              mb: 1,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            📊 Finansal Analitikler
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '1.1rem',
              fontWeight: 500
            }}
          >
            Finansal durumunuzu detaylı olarak analiz edin
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={animationEnabled}
                onChange={(e) => setAnimationEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Animasyonlar"
            sx={{ 
              '& .MuiFormControlLabel-label': { 
                color: 'text.primary',
                fontWeight: 500
              }
            }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel sx={{ fontWeight: 500 }}>Periyod</InputLabel>
            <Select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              sx={{ fontWeight: 500 }}
            >
              <MenuItem value="weekly">Haftalık</MenuItem>
              <MenuItem value="monthly">Aylık</MenuItem>
              <MenuItem value="yearly">Yıllık</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Modern Özet Kartları - Daha okunabilir tasarım */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Net Mal Varlığı"
            value={summary?.finalNetWorth || 22500}
            icon={<AccountBalanceWallet />}
            trend={12.5}
            gradient={theme.gradient.primary}
            subtitle="Son 6 aya göre artış"
            color={theme.primary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ortalama Aylık Gelir"
            value={summary?.averageIncome || 16000}
            icon={<MonetizationOn />}
            trend={8.3}
            gradient={theme.gradient.success}
            subtitle="Geçen aya göre artış"
            color={theme.success}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ortalama Aylık Gider"
            value={summary?.averageExpenses || 12250}
            icon={<ShoppingCart />}
            trend={-2.1}
            gradient={theme.gradient.warning}
            subtitle="Geçen aya göre azalış"
            color={theme.warning}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Birikim Oranı"
            value={`%${(summary?.averageSavingsRate || 23).toFixed(1)}`}
            icon={<Savings />}
            trend={3.2}
            gradient={theme.gradient.info}
            subtitle="Hedef: %25 üzeri"
            color={theme.info}
            showTrend={true}
          />
        </Grid>
      </Grid>

      {/* Finansal Sağlık Dashboard - Yeniden tasarlandı */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={4}>
          <ModernCard elevation={4}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                <Avatar sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: theme.success,
                  fontSize: '2.5rem',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                }}>
                  <EmojiEvents />
                </Avatar>
              </Box>
              <Typography variant="h3" sx={{ 
                color: theme.success, 
                fontWeight: 'bold',
                mb: 1
              }}>
                85
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                Finansal Sağlık Skoru
              </Typography>
              <Chip 
                label="Mükemmel Durumda" 
                color="success" 
                sx={{ 
                  px: 3, 
                  py: 1, 
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  mb: 2
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, mx: 'auto' }}>
                Finansal durumunuz çok iyi! Bu başarıyı sürdürmeye devam edin.
              </Typography>
            </CardContent>
          </ModernCard>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <ModernCard elevation={4}>
            <CardContent sx={{ p: 4 }}>
              <Box 
                display="flex" 
                alignItems="center" 
                mb={3}
                sx={{ 
                  position: 'relative',
                  zIndex: 2,
                  backgroundColor: 'white',
                  padding: '8px 0'
                }}
              >
                <Speed sx={{ mr: 1.5, color: theme.primary, fontSize: '1.5rem' }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'text.primary', 
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}
                >
                  Finansal Göstergeler
                </Typography>
              </Box>
              <Grid container spacing={4}>
                {[
                  { label: 'Birikim Oranı', value: '23.2', progress: 75, color: 'success', target: '%20+' },
                  { label: 'Borç/Gelir Oranı', value: '25.4', progress: 25, color: 'warning', target: '%40 altı' },
                  { label: 'Kredi Kartı Kullanımı', value: '18.7', progress: 19, color: 'success', target: '%30 altı' },
                  { label: 'Acil Durum Fonu', value: '6.2 Ay', progress: 85, color: 'success', target: '6+ ay' }
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Paper sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      borderRadius: 3,
                      border: `1px solid ${theme.chartColors[index]}20`,
                      bgcolor: `${theme.chartColors[index]}08`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${theme.chartColors[index]}25`
                      }
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="h5" sx={{ 
                        color: theme[item.color],
                        fontWeight: 'bold',
                        mb: 1
                      }}>
                        {item.value.includes('%') ? item.value : `%${item.value}`}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={item.progress} 
                        color={item.color}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mb: 1,
                          bgcolor: `${theme[item.color]}15`
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Hedef: {item.target}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>

      {/* Ana Grafikler - Daha temiz tasarım */}
      <Grid container spacing={3} mb={5}>
        {/* Net Mal Varlığı Trendi - Geliştirilmiş */}
        <Grid item xs={12} lg={8}>
          <ModernCard elevation={4}>
            <CardContent sx={{ p: 4 }}>
              <Box 
                display="flex" 
                alignItems="center" 
                mb={3}
                sx={{ 
                  position: 'relative',
                  zIndex: 2,
                  backgroundColor: 'white',
                  padding: '8px 0'
                }}
              >
                <Timeline sx={{ mr: 1.5, color: theme.primary, fontSize: '1.5rem' }} />
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'text.primary', 
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      lineHeight: 1.3
                    }}
                  >
                    Net Mal Varlığı Gelişimi
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.9rem'
                    }}
                  >
                    Son 6 aylık trend analizi
                  </Typography>
                </Box>
              </Box>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 2 }}>
                <Box sx={{ height: 400 }}>
                  <Line data={netWorthChartData} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        ...chartOptions.plugins.legend,
                        position: 'top'
                      }
                    }
                  }} />
                </Box>
              </Paper>
            </CardContent>
          </ModernCard>
        </Grid>

        {/* Birikim Oranı Grafiği - Geliştirilmiş */}
        <Grid item xs={12} lg={4}>
          <ModernCard elevation={4}>
            <CardContent sx={{ p: 4 }}>
              <Box 
                display="flex" 
                alignItems="center" 
                mb={3}
                sx={{ 
                  position: 'relative',
                  zIndex: 2,
                  backgroundColor: 'white',
                  padding: '8px 0'
                }}
              >
                <Star sx={{ mr: 1.5, color: theme.warning, fontSize: '1.5rem' }} />
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'text.primary', 
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      lineHeight: 1.3
                    }}
                  >
                    Birikim Oranı Trendi
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.9rem'
                    }}
                  >
                    Aylık tasarruf performansı
                  </Typography>
                </Box>
              </Box>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Box sx={{ height: 350 }}>
                  <Line 
                    data={savingsRateData} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: { display: false }
                      }
                    }} 
                  />
                </Box>
              </Paper>
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>

      {/* İkincil Grafikler - Geliştirilmiş */}
      <Grid container spacing={3} mb={5}>
        {/* Gelir vs Gider Bar Chart */}
        <Grid item xs={12} lg={8}>
          <ModernCard elevation={4}>
            <CardContent sx={{ p: 4 }}>
              <Box 
                display="flex" 
                alignItems="center" 
                mb={3}
                sx={{ 
                  position: 'relative',
                  zIndex: 2,
                  backgroundColor: 'white',
                  padding: '8px 0'
                }}
              >
                <BarChartIcon sx={{ mr: 1.5, color: theme.success, fontSize: '1.5rem' }} />
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'text.primary', 
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      lineHeight: 1.3
                    }}
                  >
                    Gelir vs Gider Karşılaştırması
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.9rem'
                    }}
                  >
                    Aylık gelir ve gider analizi
                  </Typography>
                </Box>
              </Box>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Box sx={{ height: 350 }}>
                  <Bar 
                    data={incomeVsExpenseData} 
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        x: {
                          ...chartOptions.scales.x,
                          stacked: false
                        },
                        y: {
                          ...chartOptions.scales.y,
                          stacked: false
                        }
                      }
                    }} 
                  />
                </Box>
              </Paper>
            </CardContent>
          </ModernCard>
        </Grid>

        {/* Harcama Kategorileri Doughnut Chart */}
        <Grid item xs={12} lg={4}>
          <ModernCard elevation={4}>
            <CardContent sx={{ p: 4 }}>
              <Box 
                display="flex" 
                alignItems="center" 
                mb={3}
                sx={{ 
                  position: 'relative',
                  zIndex: 2,
                  backgroundColor: 'white',
                  padding: '8px 0'
                }}
              >
                <PieChartIcon sx={{ mr: 1.5, color: theme.info, fontSize: '1.5rem' }} />
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'text.primary', 
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      lineHeight: 1.3
                    }}
                  >
                    Harcama Dağılımı
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.9rem'
                    }}
                  >
                    Kategorilere göre analiz
                  </Typography>
                </Box>
              </Box>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Box sx={{ height: 300 }}>
                  <Doughnut 
                    data={categoryData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 11 }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          callbacks: {
                            label: function(context) {
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((context.parsed / total) * 100).toFixed(1);
                              return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                            }
                          }
                        }
                      },
                      cutout: '60%'
                    }} 
                  />
                </Box>
              </Paper>
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>

      {/* Finansal İçgörüler ve Öneriler - Tamamen yenilendi */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={6}>
          <ModernCard elevation={4}>
            <CardContent sx={{ p: 4 }}>
              <Box 
                display="flex" 
                alignItems="center" 
                mb={3}
                sx={{ 
                  position: 'relative',
                  zIndex: 2,
                  backgroundColor: 'white',
                  padding: '8px 0'
                }}
              >
                <Assessment sx={{ mr: 1.5, color: theme.success, fontSize: '1.5rem' }} />
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'text.primary', 
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      lineHeight: 1.3
                    }}
                  >
                    Bu Ayın Finansal Özeti
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.9rem'
                    }}
                  >
                    Ağustos 2025 performans raporu
                  </Typography>
                </Box>
              </Box>
              
              {/* Gelir */}
              <Paper sx={{ p: 3, mb: 2, borderRadius: 3, bgcolor: `${theme.success}08`, border: `1px solid ${theme.success}20` }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    💰 Toplam Gelir
                  </Typography>
                  <Typography variant="h6" sx={{ color: theme.success, fontWeight: 'bold' }}>
                    {formatCurrency(financialReport?.income?.total || 16500)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={85} 
                  color="success"
                  sx={{ height: 8, borderRadius: 4, bgcolor: `${theme.success}15` }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Hedef gelire %85 ulaşıldı
                </Typography>
              </Paper>

              {/* Sabit Giderler */}
              <Paper sx={{ p: 3, mb: 2, borderRadius: 3, bgcolor: `${theme.warning}08`, border: `1px solid ${theme.warning}20` }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    🏠 Sabit Giderler
                  </Typography>
                  <Typography variant="h6" sx={{ color: theme.warning, fontWeight: 'bold' }}>
                    {formatCurrency(financialReport?.summary?.totalFixedExpenses || 6500)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={40} 
                  color="warning"
                  sx={{ height: 8, borderRadius: 4, bgcolor: `${theme.warning}15` }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Gelirin %40'ı sabit giderlere gidiyor
                </Typography>
              </Paper>

              {/* Değişken Giderler */}
              <Paper sx={{ p: 3, mb: 2, borderRadius: 3, bgcolor: `${theme.error}08`, border: `1px solid ${theme.error}20` }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    🛒 Değişken Giderler
                  </Typography>
                  <Typography variant="h6" sx={{ color: theme.error, fontWeight: 'bold' }}>
                    {formatCurrency(financialReport?.summary?.totalVariableExpenses || 4200)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={25} 
                  color="error"
                  sx={{ height: 8, borderRadius: 4, bgcolor: `${theme.error}15` }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Gelirin %25'i değişken giderlere gidiyor
                </Typography>
              </Paper>

              <Divider sx={{ my: 3 }} />

              {/* Net Birikim - Vurgulu */}
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3, 
                background: theme.gradient.primary,
                color: 'white',
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                  💎 Net Birikim
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {formatCurrency(financialReport?.summary?.netSavings || 5800)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Bu ay %23.2 birikim oranına ulaştınız!
                </Typography>
              </Paper>
            </CardContent>
          </ModernCard>
        </Grid>

        {/* Akıllı Öneriler - Yenilendi */}
        <Grid item xs={12} md={6}>
          <ModernCard elevation={4}>
            <CardContent sx={{ p: 4 }}>
              <Box 
                display="flex" 
                alignItems="center" 
                mb={3}
                sx={{ 
                  position: 'relative',
                  zIndex: 2,
                  backgroundColor: 'white',
                  padding: '8px 0'
                }}
              >
                <LocalAtm sx={{ mr: 1.5, color: theme.info, fontSize: '1.5rem' }} />
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'text.primary', 
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      lineHeight: 1.3
                    }}
                  >
                    Kişisel Mali Danışman
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.9rem'
                    }}
                  >
                    Size özel akıllı öneriler
                  </Typography>
                </Box>
              </Box>
              
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  '& .MuiAlert-icon': { fontSize: '1.5rem' }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  <strong>🎉 Tebrikler!</strong><br />
                  Bu ay %23.2 birikim oranına ulaştınız. Hedeflenen %20'nin üzerinde performans gösteriyorsunuz!
                </Typography>
              </Alert>

              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  '& .MuiAlert-icon': { fontSize: '1.5rem' }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  <strong>💡 Öneri:</strong><br />
                  Eğlence kategorisindeki harcamalarınız %15 artmış. Bu kategoriye aylık ₺800 limit koyarak kontrolü elinizde tutabilirsiniz.
                </Typography>
              </Alert>

              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  '& .MuiAlert-icon': { fontSize: '1.5rem' }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  <strong>⚠️ Dikkat:</strong><br />
                  Kredi kartı borcunuz artış gösteriyor. Bu ay ₺2000 ek ödeme yaparak faiz yükünüzü azaltabilirsiniz.
                </Typography>
              </Alert>

              {/* Hedef Kartı */}
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: theme.gradient.success,
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 100,
                  height: 100,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  transform: 'translate(30px, -30px)'
                }
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  🎯 Bu Ay İçin Hedef
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                  Toplam harcamalarınızı <strong>₺500 azaltarak</strong> birikim oranınızı <strong>%25'e çıkarabilirsiniz!</strong>
                  <br /><br />
                  <em>Küçük değişiklikler, büyük sonuçlar doğurur.</em>
                </Typography>
              </Paper>
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>

    </Container>
  );
};

export default Analytics;
