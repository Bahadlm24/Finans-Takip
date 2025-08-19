import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Savings as SavingsIcon,
  TrendingUp as TrendingUpIcon,
  GpsFixed as TargetIcon,
  AccountBalance as AccountBalanceIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Lightbulb as LightbulbIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Savings = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingsData, setSavingsData] = useState({
    goals: [],
    recommendations: [],
    analytics: {}
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: '',
    description: ''
  });

  const goalCategories = [
    { value: 'emergency', label: 'Acil Durum Fonu', color: '#f44336' },
    { value: 'vacation', label: 'Tatil', color: '#ff9800' },
    { value: 'home', label: 'Ev', color: '#2196f3' },
    { value: 'car', label: 'Araç', color: '#4caf50' },
    { value: 'education', label: 'Eğitim', color: '#9c27b0' },
    { value: 'retirement', label: 'Emeklilik', color: '#607d8b' },
    { value: 'investment', label: 'Yatırım', color: '#795548' },
    { value: 'other', label: 'Diğer', color: '#9e9e9e' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  useEffect(() => {
    fetchSavingsData();
  }, [token]); // token dependency eklendi

  const fetchSavingsData = async () => {
    try {
      const goalsResponse = await axios.get('http://localhost:5000/api/savings/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const recommendationsResponse = await axios.get('http://localhost:5000/api/savings/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSavingsData({
        goals: goalsResponse.data,
        recommendations: recommendationsResponse.data,
        analytics: {}
      });
    } catch (err) {
      setError('Birikim verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...goalForm,
        targetAmount: parseFloat(goalForm.targetAmount),
        currentAmount: parseFloat(goalForm.currentAmount) || 0
      };

      if (editingGoal) {
        await axios.put(
          `http://localhost:5000/api/savings/goals/${editingGoal.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Hedef başarıyla güncellendi');
      } else {
        await axios.post(
          'http://localhost:5000/api/savings/goals',
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Hedef başarıyla eklendi');
      }

      fetchSavingsData();
      handleCloseDialog();
    } catch (err) {
      setError('İşlem sırasında hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu hedefi silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/savings/goals/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Hedef başarıyla silindi');
        fetchSavingsData();
      } catch (err) {
        setError('Silme işlemi sırasında hata oluştu');
      }
    }
  };

  const handleOpenDialog = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalForm({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        targetDate: goal.targetDate.split('T')[0],
        category: goal.category,
        description: goal.description || ''
      });
    } else {
      setEditingGoal(null);
      setGoalForm({
        name: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        category: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getCategoryColor = (category) => {
    const cat = goalCategories.find(c => c.value === category);
    return cat ? cat.color : '#9e9e9e';
  };

  const getCategoryLabel = (category) => {
    const cat = goalCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getGoalStatus = (goal) => {
    const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    
    if (progress >= 100) {
      return { status: 'completed', label: 'Tamamlandı', color: 'success' };
    } else if (today > targetDate) {
      return { status: 'overdue', label: 'Gecikmiş', color: 'error' };
    } else {
      return { status: 'active', label: 'Devam Ediyor', color: 'primary' };
    }
  };

  const preparePieChartData = () => {
    return savingsData.goals.map((goal, index) => ({
      name: goal.name,
      value: goal.currentAmount,
      color: COLORS[index % COLORS.length]
    }));
  };

  const prepareSavingsTrendData = () => {
    // Bu veri backend'den gelmeli, şimdilik örnek veri
    return [
      { month: 'Ocak', amount: 1500 },
      { month: 'Şubat', amount: 2200 },
      { month: 'Mart', amount: 1800 },
      { month: 'Nisan', amount: 2800 },
      { month: 'Mayıs', amount: 3200 },
      { month: 'Haziran', amount: 2900 }
    ];
  };

  const totalGoalAmount = savingsData.goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = savingsData.goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const completedGoals = savingsData.goals.filter(goal => getProgressPercentage(goal.currentAmount, goal.targetAmount) >= 100).length;

  if (loading) {
    return (
      <Container>
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            <SavingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Birikim Hedefleri
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Yeni Hedef Ekle
          </Button>
        </Box>

        {/* Özet Kartları */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TargetIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography color="text.secondary">
                    Toplam Hedef
                  </Typography>
                </Box>
                <Typography variant="h5" component="div">
                  {formatAmount(totalGoalAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MonetizationOnIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography color="text.secondary">
                    Mevcut Birikim
                  </Typography>
                </Box>
                <Typography variant="h5" component="div">
                  {formatAmount(totalCurrentAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography color="text.secondary">
                    Tamamlanan
                  </Typography>
                </Box>
                <Typography variant="h5" component="div">
                  {completedGoals} / {savingsData.goals.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography color="text.secondary">
                    Genel İlerleme
                  </Typography>
                </Box>
                <Typography variant="h5" component="div">
                  %{totalGoalAmount > 0 ? Math.round((totalCurrentAmount / totalGoalAmount) * 100) : 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Hedefler Tablosu */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Birikim Hedefleri
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hedef</TableCell>
                      <TableCell>Kategori</TableCell>
                      <TableCell>İlerleme</TableCell>
                      <TableCell>Hedef Tarih</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {savingsData.goals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary">
                            Henüz birikim hedefiniz bulunmamaktadır
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      savingsData.goals.map((goal) => {
                        const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
                        const goalStatus = getGoalStatus(goal);
                        
                        return (
                          <TableRow key={goal.id}>
                            <TableCell>
                              <Box>
                                <Typography variant="body1" fontWeight="bold">
                                  {goal.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getCategoryLabel(goal.category)}
                                size="small"
                                sx={{ 
                                  backgroundColor: getCategoryColor(goal.category),
                                  color: 'white'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ width: '100%' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={progress}
                                  sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  %{Math.round(progress)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(goal.targetDate)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={goalStatus.label}
                                size="small"
                                color={goalStatus.color}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(goal)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(goal.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Grafikler ve Öneriler */}
          <Grid item xs={12} lg={4}>
            {/* Birikim Dağılımı */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Birikim Dağılımı
              </Typography>
              {savingsData.goals.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={preparePieChartData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {preparePieChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatAmount(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  Hedef eklediğinizde burada grafik görüntülenecektir
                </Typography>
              )}
            </Paper>

            {/* Birikim Önerileri */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <LightbulbIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Birikim Önerileri
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Acil durum fonu oluşturun"
                    secondary="3-6 aylık harcamanız kadar para ayırın"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountBalanceIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Otomatik transfer kurun"
                    secondary="Maaşınızın %20'sini otomatik olarak ayırın"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Yatırım yapmayı düşünün"
                    secondary="Enflasyonu yenmek için paranızı değerlendirin"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Düzenli takip yapın"
                    secondary="Aylık birikim hedeflerinizi gözden geçirin"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Hedef Ekleme/Düzenleme Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingGoal ? 'Hedef Düzenle' : 'Yeni Birikim Hedefi'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hedef Adı"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, name: e.target.value }))}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Kategori"
                  value={goalForm.category}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, category: e.target.value }))}
                  margin="normal"
                  required
                >
                  {goalCategories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hedef Tutar (TL)"
                  type="number"
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mevcut Tutar (TL)"
                  type="number"
                  value={goalForm.currentAmount}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, currentAmount: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hedef Tarih"
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, targetDate: e.target.value }))}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  value={goalForm.description}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingGoal ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Savings;
