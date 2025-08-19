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
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Loans = () => {
  const { token } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    principal: '',
    interestRate: '',
    termMonths: '',
    startDate: new Date().toISOString().split('T')[0],
    bank: '',
    notes: ''
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const loanTypes = [
    { value: 'personal', label: 'Bireysel Kredi' },
    { value: 'home', label: 'Konut Kredisi' },
    { value: 'auto', label: 'Taşıt Kredisi' },
    { value: 'credit_card', label: 'Kredi Kartı Borcu' },
    { value: 'business', label: 'İş Kredisi' },
    { value: 'other', label: 'Diğer' }
  ];

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/loans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(response.data);
    } catch (err) {
      setError('Krediler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        principal: parseFloat(formData.principal),
        interestRate: parseFloat(formData.interestRate),
        termMonths: parseInt(formData.termMonths)
      };

      if (editingLoan) {
        await axios.put(
          `http://localhost:5000/api/loans/${editingLoan.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/loans',
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchLoans();
      handleCloseDialog();
    } catch (err) {
      setError('İşlem sırasında hata oluştu');
    }
  };

  const handlePayment = async () => {
    try {
      const data = {
        amount: parseFloat(paymentData.amount),
        paymentDate: paymentData.paymentDate
      };

      await axios.post(
        `http://localhost:5000/api/loans/${selectedLoan.id}/payment`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchLoans();
      handleClosePaymentDialog();
    } catch (err) {
      setError('Ödeme kaydı sırasında hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kredi kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/loans/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchLoans();
      } catch (err) {
        setError('Silme işlemi sırasında hata oluştu');
      }
    }
  };

  const handleOpenDialog = (loan = null) => {
    if (loan) {
      setEditingLoan(loan);
      setFormData({
        name: loan.name,
        type: loan.type,
        principal: loan.principal.toString(),
        interestRate: loan.interestRate.toString(),
        termMonths: loan.termMonths.toString(),
        startDate: loan.startDate.split('T')[0],
        bank: loan.bank || '',
        notes: loan.notes || ''
      });
    } else {
      setEditingLoan(null);
      setFormData({
        name: '',
        type: '',
        principal: '',
        interestRate: '',
        termMonths: '',
        startDate: new Date().toISOString().split('T')[0],
        bank: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLoan(null);
  };

  const handleOpenPaymentDialog = (loan) => {
    setSelectedLoan(loan);
    setPaymentData({
      amount: loan.monthlyPayment?.toString() || '',
      paymentDate: new Date().toISOString().split('T')[0]
    });
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setSelectedLoan(null);
    setPaymentData({
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0]
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

  const getLoanTypeLabel = (type) => {
    const loanType = loanTypes.find(t => t.value === type);
    return loanType ? loanType.label : type;
  };

  const getProgressPercentage = (loan) => {
    if (!loan.termMonths || !loan.paidPayments) return 0;
    return (loan.paidPayments / loan.termMonths) * 100;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'defaulted':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Tamamlandı';
      case 'defaulted':
        return 'Gecikme';
      default:
        return status;
    }
  };

  const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0);
  const totalRemaining = loans.reduce((sum, loan) => sum + (loan.remainingBalance || 0), 0);
  const totalMonthlyPayment = loans.filter(loan => loan.status === 'active').reduce((sum, loan) => sum + (loan.monthlyPayment || 0), 0);

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
            <AccountBalanceIcon sx={{ color: 'secondary.main' }} />
            Kredilerim
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 12px 40px rgba(139, 92, 246, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Yeni Kredi Ekle
          </Button>
        </Box>

        {/* Özet Kartları */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(15, 23, 42, 0.6)'
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(148, 163, 184, 0.1)'
                  : 'rgba(203, 213, 225, 0.3)',
                boxShadow: '0 10px 25px rgba(139, 92, 246, 0.15)',
              }}
            >
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Toplam Kredi Tutarı
                </Typography>
                <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                  {formatAmount(totalPrincipal)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Kalan Borç
                </Typography>
                <Typography variant="h5" component="div" color="error.main">
                  {formatAmount(totalRemaining)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Aylık Toplam Ödeme
                </Typography>
                <Typography variant="h5" component="div" color="primary.main">
                  {formatAmount(totalMonthlyPayment)}
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kredi Adı</TableCell>
                <TableCell>Tip</TableCell>
                <TableCell>Ana Para</TableCell>
                <TableCell>Kalan Borç</TableCell>
                <TableCell>Aylık Ödeme</TableCell>
                <TableCell>İlerleme</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">
                      Henüz kredi kaydı bulunmamaktadır
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {loan.name}
                        </Typography>
                        {loan.bank && (
                          <Typography variant="caption" color="text.secondary">
                            {loan.bank}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getLoanTypeLabel(loan.type)} 
                        size="small" 
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6">
                        {formatAmount(loan.principal)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" color="error.main">
                        {formatAmount(loan.remainingBalance || loan.principal)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" color="primary.main">
                        {formatAmount(loan.monthlyPayment || 0)}
                      </Typography>
                      {loan.nextPaymentDate && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Sonraki: {formatDate(loan.nextPaymentDate)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={getProgressPercentage(loan)} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {loan.paidPayments || 0}/{loan.termMonths || 0} taksit
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(loan.status)} 
                        size="small" 
                        color={getStatusColor(loan.status)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {loan.status === 'active' && (
                        <IconButton
                          size="small"
                          onClick={() => handleOpenPaymentDialog(loan)}
                          color="success"
                          title="Ödeme Yap"
                        >
                          <PaymentIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(loan)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(loan.id)}
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

        {/* Kredi Ekleme/Düzenleme Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingLoan ? 'Kredi Düzenle' : 'Yeni Kredi Ekle'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Kredi Adı"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Kredi Tipi"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  margin="normal"
                  required
                >
                  {loanTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ana Para (TL)"
                  type="number"
                  value={formData.principal}
                  onChange={(e) => setFormData(prev => ({ ...prev, principal: e.target.value }))}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Faiz Oranı (%)"
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                  margin="normal"
                  inputProps={{ step: 0.1 }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vade (Ay)"
                  type="number"
                  value={formData.termMonths}
                  onChange={(e) => setFormData(prev => ({ ...prev, termMonths: e.target.value }))}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Başlangıç Tarihi"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Banka/Kurum"
                  value={formData.bank}
                  onChange={(e) => setFormData(prev => ({ ...prev, bank: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notlar"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
              {editingLoan ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Ödeme Dialog */}
        <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Kredi Ödemesi
          </DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>
              {selectedLoan?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Kalan Borç: {formatAmount(selectedLoan?.remainingBalance || 0)}
            </Typography>
            
            <TextField
              fullWidth
              label="Ödeme Tutarı (TL)"
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
              margin="normal"
              required
              helperText={`Önerilen aylık ödeme: ${formatAmount(selectedLoan?.monthlyPayment || 0)}`}
            />
            
            <TextField
              fullWidth
              label="Ödeme Tarihi"
              type="date"
              value={paymentData.paymentDate}
              onChange={(e) => setPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaymentDialog}>İptal</Button>
            <Button onClick={handlePayment} variant="contained">
              Ödeme Yap
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Loans;
