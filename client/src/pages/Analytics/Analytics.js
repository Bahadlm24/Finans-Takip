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
  Paper
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
  CreditCard,
  Warning
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import axios from 'axios';
import { useSnackbar } from '../../contexts/SnackbarContext';

const Analytics = () => {
  const [netWorthData, setNetWorthData] = useState([]);
  const [financialReport, setFinancialReport] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const { showError } = useSnackbar();

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [netWorthResponse, reportResponse] = await Promise.all([
        axios.get(`/api/analytics/net-worth?period=${period}`),
        axios.get('/api/analytics/financial-report')
      ]);
      
      setNetWorthData(netWorthResponse.data.data);
      setSummary(netWorthResponse.data.summary);
      setFinancialReport(reportResponse.data);
    } catch (error) {
      showError('Analitik veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `₺${value?.toLocaleString() || 0}`;
  };

  const getColorByValue = (value) => {
    return value >= 0 ? '#4caf50' : '#f44336';
  };

  // Grafik renkleri
  const COLORS = {
    income: '#4caf50',
    expenses: '#f44336',
    netWorth: '#2196f3',
    savings: '#ff9800',
    debt: '#9c27b0'
  };

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Finansal Analitikler
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Periyod</InputLabel>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <MenuItem value="monthly">Aylık</MenuItem>
            <MenuItem value="weekly">Haftalık</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Özet Kartları */}
      {summary && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUp color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Net Mal Varlığı
                    </Typography>
                    <Typography variant="h5" color={getColorByValue(summary.finalNetWorth)}>
                      {formatCurrency(summary.finalNetWorth)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AccountBalance color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Ortalama Gelir
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(summary.averageIncome)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingDown color="error" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Ortalama Harcama
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(summary.averageExpenses)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Savings color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Ortalama Birikim Oranı
                    </Typography>
                    <Typography variant="h5">
                      %{summary.averageSavingsRate?.toFixed(1) || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Net Mal Varlığı Trendi */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Net Mal Varlığı Trendi
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={netWorthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `₺${value.toLocaleString()}`} />
                  <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="cumulativeNetWorth"
                    stroke={COLORS.netWorth}
                    fill={COLORS.netWorth}
                    fillOpacity={0.3}
                    name="Kümülatif Net Değer"
                  />
                  <Line
                    type="monotone"
                    dataKey="netChange"
                    stroke={COLORS.savings}
                    name="Aylık Net Değişim"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gelir vs Gider Karşılaştırması */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gelir vs Gider Analizi
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={netWorthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `₺${value.toLocaleString()}`} />
                  <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                  <Legend />
                  <Bar dataKey="income" fill={COLORS.income} name="Gelir" />
                  <Bar dataKey="expenses" fill={COLORS.expenses} name="Harcamalar" />
                  <Bar dataKey="theoreticalSavings" fill={COLORS.savings} name="Teorik Birikim" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Birikim Oranı Trendi
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={netWorthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `%${value}`} />
                  <Tooltip formatter={(value, name) => [`%${value}`, name]} />
                  <Line
                    type="monotone"
                    dataKey="savingsRate"
                    stroke={COLORS.savings}
                    strokeWidth={3}
                    name="Birikim Oranı"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detaylı Finansal Rapor */}
      {financialReport && (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bu Ayın Finansal Durumu
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Toplam Gelir
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(financialReport.income.total)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Sabit Giderler
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {formatCurrency(financialReport.summary.totalFixedExpenses)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Değişken Giderler
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {formatCurrency(financialReport.summary.totalVariableExpenses)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Net Birikim
                    </Typography>
                    <Typography variant="h6" color={getColorByValue(financialReport.summary.netSavings)}>
                      {formatCurrency(financialReport.summary.netSavings)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Harcama Kategorileri
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={Object.entries(financialReport.expenses.byCategory).map(([category, amount]) => ({
                          name: category,
                          value: amount
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(financialReport.expenses.byCategory).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Finansal Göstergeler */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Finansal Göstergeler
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Birikim Oranı
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      %{financialReport.summary.savingsRate}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(financialReport.summary.savingsRate * 5, 100)} 
                      color={financialReport.summary.savingsRate > 20 ? 'success' : 'warning'}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Borç/Gelir Oranı
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      %{financialReport.summary.debtToIncomeRatio}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(parseFloat(financialReport.summary.debtToIncomeRatio), 100)} 
                      color={parseFloat(financialReport.summary.debtToIncomeRatio) < 40 ? 'success' : 'error'}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Kredi Kartı Kullanımı
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      %{financialReport.summary.creditUtilization}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={parseFloat(financialReport.summary.creditUtilization)} 
                      color={parseFloat(financialReport.summary.creditUtilization) < 30 ? 'success' : 'warning'}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Finansal Sağlık
                    </Typography>
                    <Chip 
                      label={
                        financialReport.summary.savingsRate > 20 && 
                        parseFloat(financialReport.summary.debtToIncomeRatio) < 40 &&
                        parseFloat(financialReport.summary.creditUtilization) < 30 
                          ? 'Mükemmel' 
                          : financialReport.summary.savingsRate > 10 ? 'İyi' : 'Geliştirilmeli'
                      }
                      color={
                        financialReport.summary.savingsRate > 20 && 
                        parseFloat(financialReport.summary.debtToIncomeRatio) < 40 
                          ? 'success' 
                          : financialReport.summary.savingsRate > 10 ? 'warning' : 'error'
                      }
                      sx={{ mt: 2 }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default Analytics;
