import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Add,
  CreditCard,
  MoreVert,
  Payment,
  ShoppingCart,
  TrendingUp,
  Warning
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAuth } from '../../contexts/AuthContext';

const CreditCards = () => {
  const { token } = useAuth();
  const [creditCards, setCreditCards] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Debug token
  useEffect(() => {
    console.log('=== CreditCards Component Debug ===');
    console.log('AuthContext token:', token);
    console.log('localStorage token:', localStorage.getItem('token'));
    console.log('Token type:', typeof token);
    console.log('Token length:', token?.length);
  }, [token]);
  const [anchorEl, setAnchorEl] = useState(null);
  const { showSuccess, showError } = useSnackbar();

  console.log('CreditCards component token:', token);

  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    limit: '',
    currentDebt: '',
    minimumPaymentRate: '2',
    minimumPaymentAmount: '100',
    interestRate: '2.5',
    cutoffDay: '1',
    paymentDueDay: '20'
  });

  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const [expenseData, setExpenseData] = useState({
    amount: '',
    description: '',
    category: 'other',
    expenseDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (token) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching credit cards data...');
      console.log('Token:', token);
      
      if (!token) {
        showError('Yetkilendirme token\'ı bulunamadı');
        return;
      }
      
      const [cardsResponse, summaryResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/credit-cards', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/credit-cards/summary', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      console.log('Credit cards response:', cardsResponse.data);
      console.log('Summary response:', summaryResponse.data);
      
      setCreditCards(cardsResponse.data);
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error('Credit cards fetch error:', error);
      console.error('Error response:', error.response?.data);
      showError('Veriler yüklenirken hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Submit request data:', {
        formData,
        token: token ? 'Token exists' : 'No token from AuthContext'
      });

      if (!token) {
        showError('Oturum açmanız gerekiyor');
        return;
      }

      await axios.post('http://localhost:5000/api/credit-cards', {
        ...formData,
        limit: parseFloat(formData.limit),
        currentDebt: parseFloat(formData.currentDebt || 0),
        minimumPaymentRate: parseFloat(formData.minimumPaymentRate),
        minimumPaymentAmount: parseFloat(formData.minimumPaymentAmount),
        interestRate: parseFloat(formData.interestRate),
        cutoffDay: parseInt(formData.cutoffDay),
        paymentDueDay: parseInt(formData.paymentDueDay)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      showSuccess('Kredi kartı başarıyla eklendi');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Submit error:', error.response?.data || error.message);
      showError(error.response?.data?.message || 'Kredi kartı eklenirken hata oluştu');
    }
  };

  const handlePayment = async () => {
    try {
      console.log('Payment request data:', {
        cardId: selectedCard?.id,
        amount: paymentData.amount,
        paymentDate: paymentData.paymentDate,
        token: token ? 'Token exists' : 'No token from AuthContext'
      });

      if (!token) {
        showError('Oturum açmanız gerekiyor');
        return;
      }

      await axios.post(`http://localhost:5000/api/credit-cards/${selectedCard.id}/payment`, {
        amount: parseFloat(paymentData.amount),
        paymentDate: paymentData.paymentDate
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      showSuccess('Ödeme başarıyla kaydedildi');
      setPaymentDialogOpen(false);
      setPaymentData({ amount: '', paymentDate: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error) {
      console.error('Payment error:', error.response?.data || error.message);
      showError(error.response?.data?.message || 'Ödeme kaydedilirken hata oluştu');
    }
  };

  const handleExpense = async () => {
    try {
      console.log('Expense request data:', {
        cardId: selectedCard?.id,
        amount: expenseData.amount,
        description: expenseData.description,
        token: token ? 'Token exists' : 'No token from AuthContext'
      });

      if (!token) {
        showError('Oturum açmanız gerekiyor');
        return;
      }

      await axios.post(`http://localhost:5000/api/credit-cards/${selectedCard.id}/expense`, {
        amount: parseFloat(expenseData.amount),
        description: expenseData.description,
        category: expenseData.category,
        expenseDate: expenseData.expenseDate
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      showSuccess('Harcama başarıyla kaydedildi');
      setExpenseDialogOpen(false);
      setExpenseData({ 
        amount: '', 
        description: '', 
        category: 'other', 
        expenseDate: new Date().toISOString().split('T')[0] 
      });
      fetchData();
    } catch (error) {
      console.error('Expense error:', error.response?.data || error.message);
      showError(error.response?.data?.message || 'Harcama kaydedilirken hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      bank: '',
      limit: '',
      currentDebt: '',
      minimumPaymentRate: '2',
      minimumPaymentAmount: '100',
      interestRate: '2.5',
      cutoffDay: '1',
      paymentDueDay: '20'
    });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't reset selectedCard here as we need it for dialogs
  };

  const getUtilizationColor = (rate) => {
    if (rate < 30) return 'success';
    if (rate < 70) return 'warning';
    return 'error';
  };

  const handleMenuClick = (event, card) => {
    console.log('=== handleMenuClick Debug ===');
    console.log('Card object:', card);
    console.log('Card currentDebt:', card?.currentDebt);
    console.log('Card id:', card?.id);
    console.log('Card name:', card?.name);
    setAnchorEl(event.currentTarget);
    setSelectedCard(card);
  };

  const handleOpenPaymentDialog = () => {
    console.log('=== Opening Payment Dialog ===');
    console.log('Selected card from menu:', selectedCard);
    
    // Find the current card data from creditCards array to ensure we have fresh data
    const currentCardData = creditCards.find(card => card.id === selectedCard?.id);
    console.log('Current card data from creditCards:', currentCardData);
    
    if (currentCardData) {
      setSelectedCard(currentCardData); // Update with fresh data
    }
    
    setPaymentDialogOpen(true);
    handleMenuClose();
  };

  const handleOpenExpenseDialog = () => {
    console.log('=== Opening Expense Dialog ===');
    console.log('Selected card from menu:', selectedCard);
    
    // Find the current card data from creditCards array to ensure we have fresh data
    const currentCardData = creditCards.find(card => card.id === selectedCard?.id);
    console.log('Current card data from creditCards:', currentCardData);
    
    if (currentCardData) {
      setSelectedCard(currentCardData); // Update with fresh data
    }
    
    setExpenseDialogOpen(true);
    handleMenuClose();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
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
        <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
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
            <CreditCard sx={{ color: 'warning.main' }} />
            Kredi Kartları
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                boxShadow: '0 12px 40px rgba(245, 158, 11, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Yeni Kredi Kartı
          </Button>
        </Box>

      {/* Özet Kartları */}
      {summary && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CreditCard color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Toplam Kart
                    </Typography>
                    <Typography variant="h5">
                      {summary.totalCards}
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
                  <TrendingUp color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Toplam Limit
                    </Typography>
                    <Typography variant="h5">
                      ₺{summary.totalLimit.toLocaleString()}
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
                  <Warning color="error" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Toplam Borç
                    </Typography>
                    <Typography variant="h5">
                      ₺{summary.totalDebt.toLocaleString()}
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
                  <Payment color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Asgari Ödeme
                    </Typography>
                    <Typography variant="h5">
                      ₺{summary.totalMinimumPayment.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Kredi Kartları Tablosu */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Kredi Kartları
          </Typography>
          {creditCards.length === 0 ? (
            <Alert severity="info">
              Henüz kredi kartınız bulunmuyor. Yeni kredi kartı ekleyerek başlayın.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Kart Adı</TableCell>
                    <TableCell>Banka</TableCell>
                    <TableCell align="right">Limit</TableCell>
                    <TableCell align="right">Borç</TableCell>
                    <TableCell align="right">Kullanılabilir</TableCell>
                    <TableCell align="center">Kullanım Oranı</TableCell>
                    <TableCell align="right">Asgari Ödeme</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {creditCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{card.name}</Typography>
                      </TableCell>
                      <TableCell>{card.bank}</TableCell>
                      <TableCell align="right">
                        ₺{(card.limit || 0).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Typography color={(card.currentDebt || 0) > 0 ? 'error' : 'inherit'}>
                          ₺{(card.currentDebt || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="success.main">
                          ₺{(card.availableCredit || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(parseFloat(card.utilizationRate), 100)}
                            color={getUtilizationColor(parseFloat(card.utilizationRate))}
                            sx={{ mb: 1 }}
                          />
                          <Chip
                            label={`%${card.utilizationRate}`}
                            size="small"
                            color={getUtilizationColor(parseFloat(card.utilizationRate))}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ₺{card.minimumPaymentDue.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={(e) => handleMenuClick(e, card)}>
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Kart İşlemleri Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenPaymentDialog}>
          <Payment sx={{ mr: 1 }} />
          Ödeme Yap
        </MenuItem>
        <MenuItem onClick={handleOpenExpenseDialog}>
          <ShoppingCart sx={{ mr: 1 }} />
          Harcama Ekle
        </MenuItem>
      </Menu>

      {/* Yeni Kredi Kartı Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Kredi Kartı Ekle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Kart Adı"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Banka"
                fullWidth
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Limit"
                type="number"
                fullWidth
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mevcut Borç"
                type="number"
                fullWidth
                value={formData.currentDebt}
                onChange={(e) => setFormData({ ...formData, currentDebt: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Asgari Ödeme Oranı (%)"
                type="number"
                fullWidth
                value={formData.minimumPaymentRate}
                onChange={(e) => setFormData({ ...formData, minimumPaymentRate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Asgari Ödeme Tutarı"
                type="number"
                fullWidth
                value={formData.minimumPaymentAmount}
                onChange={(e) => setFormData({ ...formData, minimumPaymentAmount: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">Ekle</Button>
        </DialogActions>
      </Dialog>

      {/* Ödeme Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>{selectedCard?.name} - Ödeme Yap</DialogTitle>
        <DialogContent>
          <TextField
            label="Ödeme Tutarı"
            type="number"
            fullWidth
            margin="normal"
            value={paymentData.amount}
            onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
            helperText={`Mevcut borç: ₺${(selectedCard?.currentDebt || 0).toLocaleString()} (Debug: ${JSON.stringify({
              currentDebt: selectedCard?.currentDebt,
              type: typeof selectedCard?.currentDebt,
              selectedCardId: selectedCard?.id
            })})`}
          />
          <TextField
            label="Ödeme Tarihi"
            type="date"
            fullWidth
            margin="normal"
            value={paymentData.paymentDate}
            onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>İptal</Button>
          <Button onClick={handlePayment} variant="contained">Ödeme Yap</Button>
        </DialogActions>
      </Dialog>

      {/* Harcama Dialog */}
      <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)}>
        <DialogTitle>{selectedCard?.name} - Harcama Ekle</DialogTitle>
        <DialogContent>
          <TextField
            label="Harcama Tutarı"
            type="number"
            fullWidth
            margin="normal"
            value={expenseData.amount}
            onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
            helperText={`Kullanılabilir limit: ₺${selectedCard?.availableCredit?.toLocaleString()}`}
          />
          <TextField
            label="Açıklama"
            fullWidth
            margin="normal"
            value={expenseData.description}
            onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
          />
          <TextField
            label="Harcama Tarihi"
            type="date"
            fullWidth
            margin="normal"
            value={expenseData.expenseDate}
            onChange={(e) => setExpenseData({ ...expenseData, expenseDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpenseDialogOpen(false)}>İptal</Button>
          <Button onClick={handleExpense} variant="contained">Harcama Ekle</Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default CreditCards;
