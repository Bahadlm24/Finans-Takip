import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Container,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Receipt as BillIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as LoanIcon,
  Analytics as AnalyticsIcon,
  Savings as SavingsIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigationItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, priority: 'high' },
    { text: 'Gelirler', path: '/income', icon: <IncomeIcon />, priority: 'high' },
    { text: 'Harcamalar', path: '/expenses', icon: <ExpenseIcon />, priority: 'high' },
    { text: 'Faturalar', path: '/bills', icon: <BillIcon />, priority: 'medium' },
    { text: 'Kredi Kartları', path: '/credit-cards', icon: <CreditCardIcon />, priority: 'medium' },
    { text: 'Krediler', path: '/loans', icon: <LoanIcon />, priority: 'medium' },
    { text: 'Birikimler', path: '/savings', icon: <SavingsIcon />, priority: 'high' },
    { text: 'Analitikler', path: '/analytics', icon: <AnalyticsIcon />, priority: 'medium' },
  ];

  // High priority items for desktop navbar
  const primaryNavItems = navigationItems.filter(item => item.priority === 'high');
  const secondaryNavItems = navigationItems.filter(item => item.priority === 'medium');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Mobile Drawer
  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            💰 Finansal Takip
          </Typography>
          <Chip 
            label="v2.0" 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              color: 'white',
              fontSize: '0.7rem'
            }} 
          />
        </Box>
        <IconButton 
          onClick={() => setDrawerOpen(false)}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      <List sx={{ px: 1, py: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                backgroundColor: isActive(item.path) 
                  ? 'rgba(33, 150, 243, 0.1)' 
                  : 'transparent',
                border: isActive(item.path) 
                  ? '1px solid rgba(33, 150, 243, 0.3)' 
                  : '1px solid transparent',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon sx={{ 
                color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                minWidth: 40 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontWeight: isActive(item.path) ? 600 : 400,
                    color: isActive(item.path) ? 'primary.main' : 'text.primary',
                  } 
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      <Box sx={{ p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {darkMode ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
              Dark Mode
            </Box>
          }
        />
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backdropFilter: 'blur(20px)',
          background: darkMode 
            ? 'rgba(26, 29, 58, 0.95)' 
            : 'rgba(33, 150, 243, 0.95)',
          borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ minHeight: '70px !important' }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: isMobile ? 1 : 0,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mr: 4,
                cursor: 'pointer'
              }}
              onClick={() => handleNavigation('/dashboard')}
            >
              💰 Finansal Takip
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                {/* Primary Navigation Items */}
                {primaryNavItems.map((item) => (
                  <Button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    variant={isActive(item.path) ? 'contained' : 'text'}
                    sx={{
                      color: isActive(item.path) ? 'white' : 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: isActive(item.path) ? 600 : 400,
                      backgroundColor: isActive(item.path) 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
                
                {/* More Menu for Secondary Items */}
                <Button
                  onClick={handleMenuOpen}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Daha Fazla ↓
                </Button>
              </Box>
            )}

            {/* Theme Toggle */}
            {!isMobile && (
              <IconButton
                onClick={toggleDarkMode}
                color="inherit"
                sx={{ mr: 2 }}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            )}

            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && (
                <Chip
                  label={user?.name || 'User'}
                  variant="outlined"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    mr: 1
                  }}
                />
              )}
              
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    fontSize: '0.9rem'
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* User Menu Dropdown */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }
        }}
      >
        {/* Secondary Navigation Items for Desktop */}
        {!isMobile && secondaryNavItems.map((item) => (
          <MenuItem 
            key={item.path}
            onClick={() => { handleNavigation(item.path); handleMenuClose(); }}
            sx={{
              backgroundColor: isActive(item.path) ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
            }}
          >
            {item.icon}
            <Typography sx={{ ml: 2 }}>{item.text}</Typography>
          </MenuItem>
        ))}
        
        {!isMobile && <Divider />}
        
        {/* User Options */}
        <MenuItem onClick={() => { handleNavigation('/profile'); handleMenuClose(); }}>
          <PersonIcon sx={{ mr: 2 }} />
          Profil
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 2 }} />
          Çıkış Yap
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'background.default',
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
