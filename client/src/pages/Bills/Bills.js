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
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Bills = () => {
  const { token } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    isRecurring: true,
    recurringDay: '',
    notes: ''
  });

  const billTypes = [
    { value: 'electricity', label: 'Elektrik', color: '#FFA726' },
    { value: 'water', label: 'Su', color: '#42A5F5' },
    { value: 'gas', label: 'Doğalgaz', color: '#FF7043' },
    { value: 'internet', label: 'İnternet', color: '#66BB6A' },
    { value: 'phone', label: 'Telefon', color: '#AB47BC' },
    { value: 'rent', label: 'Kira', color: '#8D6E63' },
    { value: 'insurance', label: 'Sigorta', color: '#78909C' },
    { value: 'other', label: 'Diğer', color: '#90A4AE' }
  ];

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bills', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBills(response.data);
    } catch (err) {
      setError('Faturalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        recurringDay: formData.recurringDay ? parseInt(formData.recurringDay) : null
      };

      if (editingBill) {
        await axios.put(
          `http://localhost:5000/api/bills/${editingBill.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/bills',
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchBills();
      handleCloseDialog();
    } catch (err) {
      setError('İşlem sırasında hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu fatura kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/bills/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBills();
      } catch (err) {
        setError('Silme işlemi sırasında hata oluştu');
      }
    }
  };

  const togglePaymentStatus = async (bill) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/bills/${bill.id}/payment`,
        { isPaid: !bill.isPaid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBills();
    } catch (err) {
      setError('Ödeme durumu güncellenirken hata oluştu');
    }
  };

  const handleOpenDialog = (bill = null) => {
    if (bill) {
      setEditingBill(bill);
      setFormData({
        name: bill.name,
        type: bill.type,
        amount: bill.amount.toString(),
        dueDate: bill.dueDate.split('T')[0],
        isRecurring: bill.isRecurring,
        recurringDay: bill.recurringDay?.toString() || '',
        notes: bill.notes || ''
      });
    } else {
      setEditingBill(null);
      setFormData({
        name: '',
        type: '',
        amount: '',
        dueDate: new Date().toISOString().split('T')[0],
        isRecurring: true,
        recurringDay: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBill(null);
    setFormData({
      name: '',
      type: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      isRecurring: true,
      recurringDay: '',
      notes: ''
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

  const getBillTypeInfo = (type) => {
    return billTypes.find(billType => billType.value === type) || { label: type, color: '#666' };
  };

  const isOverdue = (dueDate, isPaid) => {
    if (isPaid) return false;
    return new Date(dueDate) < new Date();
  };

  const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidBills = bills.filter(bill => bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0);
  const unpaidBills = totalBills - paidBills;
  const overdueBills = bills.filter(bill => isOverdue(bill.dueDate, bill.isPaid));

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
            <ReceiptIcon sx={{ color: 'info.main' }} />
            Faturalarım
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Yeni Fatura Ekle
          </Button>
        </Box>

        {/* Özet Kartları */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
              }}
            >
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Toplam Faturalar</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{formatAmount(totalBills)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Ödenen</Typography>
              <Typography variant="h6">{formatAmount(paidBills)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="subtitle2">Ödenmemiş</Typography>
              <Typography variant="h6">{formatAmount(unpaidBills)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography variant="subtitle2">Gecikmiş</Typography>
              <Typography variant="h6">{overdueBills.length}</Typography>
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
                <TableCell>Fatura Adı</TableCell>
                <TableCell>Tip</TableCell>
                <TableCell>Tutar</TableCell>
                <TableCell>Vade Tarihi</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Tekrarlayan</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      Henüz fatura kaydı bulunmamaktadır
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bills.map((bill) => {
                  const typeInfo = getBillTypeInfo(bill.type);
                  const overdue = isOverdue(bill.dueDate, bill.isPaid);
                  
                  return (
                    <TableRow 
                      key={bill.id}
                      sx={{ 
                        bgcolor: overdue ? 'error.light' : 'inherit',
                        opacity: bill.isPaid ? 0.7 : 1
                      }}
                    >
                      <TableCell>
                        <Typography variant="body1" fontWeight={overdue ? 'bold' : 'normal'}>
                          {bill.name}
                        </Typography>
                        {bill.notes && (
                          <Typography variant="caption" color="text.secondary">
                            {bill.notes}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={typeInfo.label} 
                          size="small"
                          sx={{ bgcolor: typeInfo.color, color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6">
                          {formatAmount(bill.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color={overdue ? 'error.main' : 'inherit'}>
                          {formatDate(bill.dueDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => togglePaymentStatus(bill)}
                            color={bill.isPaid ? 'success' : 'default'}
                          >
                            {bill.isPaid ? <CheckCircleIcon /> : <CancelIcon />}
                          </IconButton>
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {bill.isPaid ? 'Ödendi' : 'Ödenmedi'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {bill.isRecurring ? (
                          <Chip 
                            label={`Her ay ${bill.recurringDay || 'belirsiz'}`} 
                            size="small" 
                            color="info" 
                          />
                        ) : (
                          <Chip label="Tek seferlik" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(bill)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(bill.id)}
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
            {editingBill ? 'Fatura Düzenle' : 'Yeni Fatura Ekle'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Fatura Adı"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              select
              label="Fatura Tipi"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              margin="normal"
              required
            >
              {billTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: type.color,
                        borderRadius: '50%',
                        mr: 1
                      }}
                    />
                    {type.label}
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
              label="Vade Tarihi"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                />
              }
              label="Tekrarlayan Fatura"
              sx={{ mt: 1 }}
            />

            {formData.isRecurring && (
              <TextField
                fullWidth
                label="Tekrarlanma Günü (1-31)"
                type="number"
                value={formData.recurringDay}
                onChange={(e) => setFormData(prev => ({ ...prev, recurringDay: e.target.value }))}
                margin="normal"
                inputProps={{ min: 1, max: 31 }}
                helperText="Faturanın her ay hangi gününde geldiğini belirtin"
              />
            )}
            
            <TextField
              fullWidth
              label="Notlar"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              margin="normal"
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingBill ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Bills;
