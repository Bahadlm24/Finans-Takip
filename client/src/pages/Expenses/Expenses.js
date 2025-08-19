import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingDown as TrendingDownIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Expenses = () => {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const expenseCategories = [
    { value: 'food', label: 'Yiyecek & İçecek', color: '#FF6B6B' },
    { value: 'transportation', label: 'Ulaşım', color: '#4ECDC4' },
    { value: 'shopping', label: 'Alışveriş', color: '#45B7D1' },
    { value: 'entertainment', label: 'Eğlence', color: '#96CEB4' },
    { value: 'health', label: 'Sağlık', color: '#FECA57' },
    { value: 'education', label: 'Eğitim', color: '#FF9FF3' },
    { value: 'housing', label: 'Konut', color: '#54A0FF' },
    { value: 'utilities', label: 'Faturalar', color: '#5F27CD' },
    { value: 'other', label: 'Diğer', color: '#00D2D3' }
  ];

  useEffect(() => {
    fetchExpenses();
    fetchCategorySummary();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(response.data);
    } catch (err) {
      setError('Harcamalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorySummary = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/expenses/category-summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategorySummary(response.data);
    } catch (err) {
      console.error('Kategori özeti yüklenirken hata:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingExpense) {
        await axios.put(
          `http://localhost:5000/api/expenses/${editingExpense.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/expenses',
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchExpenses();
      fetchCategorySummary();
      handleCloseDialog();
    } catch (err) {
      setError('İşlem sırasında hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu harcama kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchExpenses();
        fetchCategorySummary();
      } catch (err) {
        setError('Silme işlemi sırasında hata oluştu');
      }
    }
  };

  const handleOpenDialog = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        category: expense.category,
        amount: expense.amount.toString(),
        date: expense.date.split('T')[0],
        description: expense.description || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpense(null);
    setFormData({
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
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

  const getCategoryInfo = (category) => {
    return expenseCategories.find(cat => cat.value === category) || { label: category, color: '#666' };
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <Container>
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TrendingDownIcon sx={{ color: 'error.main' }} />
            Harcamalarım
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                boxShadow: '0 12px 40px rgba(239, 68, 68, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Yeni Harcama Ekle
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Toplam Harcama Kartı */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                Toplam Harcama
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatAmount(totalExpenses)}
              </Typography>
            </Paper>
          </Grid>

          {/* Kategori Özeti */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Kategori Özeti
              </Typography>
              {categorySummary.slice(0, 3).map((cat) => {
                const categoryInfo = getCategoryInfo(cat.category);
                return (
                  <Box key={cat.category} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={categoryInfo.label}
                        size="small"
                        sx={{ bgcolor: categoryInfo.color, color: 'white' }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {formatAmount(cat.totalAmount)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Paper>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kategori</TableCell>
                <TableCell>Tutar</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      Henüz harcama kaydı bulunmamaktadır
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => {
                  const categoryInfo = getCategoryInfo(expense.category);
                  return (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <Chip 
                          label={categoryInfo.label} 
                          size="small"
                          sx={{ bgcolor: categoryInfo.color, color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" color="error.main">
                          -{formatAmount(expense.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>{expense.description || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(expense)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(expense.id)}
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

        {/* Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingExpense ? 'Harcama Düzenle' : 'Yeni Harcama Ekle'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              select
              label="Kategori"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              margin="normal"
              required
            >
              {expenseCategories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: category.color,
                        borderRadius: '50%',
                        mr: 1
                      }}
                    />
                    {category.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              label="Tutar (TL)"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Tarih"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            
            <TextField
              fullWidth
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              margin="normal"
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingExpense ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Expenses;
