import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';

const Login = () => {
  const [email, setEmail] = useState('test@example.com'); // Pre-filled with demo user
  const [password, setPassword] = useState('123456'); // Pre-filled with demo password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showSuccess } = useSnackbar();
  const navigate = useNavigate();

  // Auto-login for demo purposes
  React.useEffect(() => {
    const autoLogin = async () => {
      const testPasswords = ['123456', 'password', 'test123', 'admin', '111111'];
      
      for (const testPassword of testPasswords) {
        try {
          console.log(`=== Auto Login Attempting with password: ${testPassword} ===`);
          const result = await login('test@example.com', testPassword);
          console.log('Auto login result:', result);
          if (result.success) {
            showSuccess(`Demo kullanıcı olarak otomatik giriş yapıldı! (Password: ${testPassword})`);
            navigate('/');
            return;
          } else {
            console.log(`Password ${testPassword} failed:`, result.message);
          }
        } catch (err) {
          console.log(`Password ${testPassword} error:`, err);
        }
      }
      
      console.log('All auto-login attempts failed. Manual login required.');
      setError('Otomatik giriş başarısız. Manuel giriş yapın: test@example.com / [şifre deneyin]');
    };
    
    // Auto-login after a short delay to allow context to initialize
    const timer = setTimeout(autoLogin, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Keeping dependency array empty to run only once

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        showSuccess(result.message);
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Giriş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Finansal Takip
          </Typography>
          <Typography component="h2" variant="h5" align="center" gutterBottom>
            Giriş Yap
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Adresi"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Şifre"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
            <Box textAlign="center">
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography color="primary">
                  Hesabınız yok mu? Kayıt olun
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
