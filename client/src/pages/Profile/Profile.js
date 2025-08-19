import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  Grid,
  Alert,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  AccountBalance as AccountBalanceIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, token, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Profil bilgileri state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Türkiye',
    birthDate: '',
    occupation: '',
    income: ''
  });

  // Şifre değiştirme state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Bildirim ayarları state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    billReminders: true,
    paymentAlerts: true,
    monthlyReports: true
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || 'Türkiye',
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
        occupation: user.occupation || '',
        income: user.income || ''
      });
    }
    fetchUserProfile();
    fetchNotificationSettings();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setProfileData(prevData => ({
          ...prevData,
          ...response.data
        }));
      }
    } catch (err) {
      console.log('Profil bilgileri yüklenemedi');
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setNotificationSettings(response.data);
      }
    } catch (err) {
      console.log('Bildirim ayarları yüklenemedi');
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        'http://localhost:5000/api/user/profile',
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Context'teki user bilgilerini güncelle
      if (response.data) {
        login(token, response.data);
      }
      
      setSuccess('Profil bilgileriniz başarıyla güncellendi');
      setError('');
    } catch (err) {
      setError('Profil güncellenirken hata oluştu');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        'http://localhost:5000/api/user/password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Şifreniz başarıyla değiştirildi');
      setError('');
      setOpenPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError('Şifre değiştirirken hata oluştu. Mevcut şifrenizi kontrol edin.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setLoading(true);
      await axios.put(
        'http://localhost:5000/api/user/notifications',
        notificationSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Bildirim ayarlarınız güncellendi');
      setError('');
    } catch (err) {
      setError('Bildirim ayarları güncellenirken hata oluştu');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
  };

  const formatAmount = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Başlık */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PersonIcon sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Profil Ayarları
          </Typography>
        </Box>

        {/* Kullanıcı Kartı */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
              >
                {getInitials(profileData.name || 'U')}
              </Avatar>
              <Box>
                <Typography variant="h5" component="div">
                  {profileData.name || 'Kullanıcı Adı'}
                </Typography>
                <Typography color="text.secondary">
                  {profileData.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profileData.occupation || 'Meslek belirtilmemiş'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

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

        {/* Tab Navigation */}
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab icon={<PersonIcon />} label="Kişisel Bilgiler" />
            <Tab icon={<SecurityIcon />} label="Güvenlik" />
            <Tab icon={<NotificationsIcon />} label="Bildirimler" />
          </Tabs>

          {/* Kişisel Bilgiler Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ad Soyad"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="E-posta"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Doğum Tarihi"
                  type="date"
                  value={profileData.birthDate}
                  onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Meslek"
                  value={profileData.occupation}
                  onChange={(e) => setProfileData(prev => ({ ...prev, occupation: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Aylık Gelir (TL)"
                  type="number"
                  value={profileData.income}
                  onChange={(e) => setProfileData(prev => ({ ...prev, income: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adres"
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Şehir"
                  value={profileData.city}
                  onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ülke"
                  value={profileData.country}
                  onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleProfileUpdate}
                    disabled={loading}
                  >
                    Kaydet
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Güvenlik Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Şifre Değiştirme
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      Hesabınızın güvenliği için düzenli olarak şifrenizi değiştirin.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<SecurityIcon />}
                      onClick={() => setOpenPasswordDialog(true)}
                    >
                      Şifre Değiştir
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Hesap Güvenliği
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="E-posta Doğrulaması"
                          secondary={user?.emailVerified ? "Doğrulanmış" : "Henüz doğrulanmadı"}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Son Şifre Değişikliği"
                          secondary="Bilgi mevcut değil"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Bildirimler Tab */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Bildirim Tercihleri
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="E-posta Bildirimleri"
                          secondary="Önemli güncellemeler ve duyurular için"
                        />
                        <Button
                          variant={notificationSettings.emailNotifications ? "contained" : "outlined"}
                          size="small"
                          onClick={() => setNotificationSettings(prev => ({ 
                            ...prev, 
                            emailNotifications: !prev.emailNotifications 
                          }))}
                        >
                          {notificationSettings.emailNotifications ? "Açık" : "Kapalı"}
                        </Button>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Push Bildirimleri"
                          secondary="Anlık bildirimler için"
                        />
                        <Button
                          variant={notificationSettings.pushNotifications ? "contained" : "outlined"}
                          size="small"
                          onClick={() => setNotificationSettings(prev => ({ 
                            ...prev, 
                            pushNotifications: !prev.pushNotifications 
                          }))}
                        >
                          {notificationSettings.pushNotifications ? "Açık" : "Kapalı"}
                        </Button>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AccountBalanceIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Fatura Hatırlatmaları"
                          secondary="Yaklaşan fatura ödemeleri için"
                        />
                        <Button
                          variant={notificationSettings.billReminders ? "contained" : "outlined"}
                          size="small"
                          onClick={() => setNotificationSettings(prev => ({ 
                            ...prev, 
                            billReminders: !prev.billReminders 
                          }))}
                        >
                          {notificationSettings.billReminders ? "Açık" : "Kapalı"}
                        </Button>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Ödeme Uyarıları"
                          secondary="Kredi kartı ve kredi ödemeleri için"
                        />
                        <Button
                          variant={notificationSettings.paymentAlerts ? "contained" : "outlined"}
                          size="small"
                          onClick={() => setNotificationSettings(prev => ({ 
                            ...prev, 
                            paymentAlerts: !prev.paymentAlerts 
                          }))}
                        >
                          {notificationSettings.paymentAlerts ? "Açık" : "Kapalı"}
                        </Button>
                      </ListItem>
                    </List>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleNotificationUpdate}
                        disabled={loading}
                      >
                        Kaydet
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        {/* Şifre Değiştirme Dialog */}
        <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Şifre Değiştir
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Mevcut Şifre"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
            <TextField
              fullWidth
              label="Yeni Şifre"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              margin="normal"
              required
              helperText="En az 6 karakter olmalıdır"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
            <TextField
              fullWidth
              label="Yeni Şifre Tekrar"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPasswordDialog(false)} startIcon={<CancelIcon />}>
              İptal
            </Button>
            <Button onClick={handlePasswordChange} variant="contained" disabled={loading}>
              Şifreyi Değiştir
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Profile;
