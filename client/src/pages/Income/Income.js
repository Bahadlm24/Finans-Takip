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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Income = () => {
  const { token } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const incomeTypes = [
    { value: 'salary', label: 'Maaş' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'freelance', label: 'Serbest Çalışma' },
    { value: 'investment', label: 'Yatırım Geliri' },
    { value: 'rental', label: 'Kira Geliri' },
    { value: 'other', label: 'Diğer' }
  ];

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/income', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncomes(response.data);
    } catch (err) {
      setError('Gelirler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingIncome) {
        await axios.put(
          `http://localhost:5000/api/income/${editingIncome.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/income',
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchIncomes();
      handleCloseDialog();
    } catch (err) {
      setError('İşlem sırasında hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu gelir kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/income/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchIncomes();
      } catch (err) {
        setError('Silme işlemi sırasında hata oluştu');
      }
    }
  };

  const handleOpenDialog = (income = null) => {
    if (income) {
      setEditingIncome(income);
      setFormData({
        source: income.source,
        amount: income.amount.toString(),
        date: income.date.split('T')[0],
        description: income.description || ''
      });
    } else {
      setEditingIncome(null);
      setFormData({
        source: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIncome(null);
    setFormData({
      source: '',
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

  const getSourceLabel = (source) => {
    const sourceType = incomeTypes.find(type => type.value === source);
    return sourceType ? sourceType.label : source;
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

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
            <TrendingUpIcon sx={{ color: 'success.main' }} />
            Gelirlerim
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Yeni Gelir Ekle
          </Button>
        </Box>

        {/* Toplam Gelir Kartı */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
            Toplam Gelir
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {formatAmount(totalIncome)}
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kaynak</TableCell>
                <TableCell>Tutar</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incomes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      Henüz gelir kaydı bulunmamaktadır
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>
                      <Chip 
                        label={getSourceLabel(income.source)} 
                        color="primary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" color="success.main">
                        {formatAmount(income.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(income.date)}</TableCell>
                    <TableCell>{income.description || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(income)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(income.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingIncome ? 'Gelir Düzenle' : 'Yeni Gelir Ekle'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              select
              label="Gelir Kaynağı"
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              margin="normal"
              required
            >
              {incomeTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
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
              {editingIncome ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Income;
