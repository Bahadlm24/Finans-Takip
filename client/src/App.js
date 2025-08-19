import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { SnackbarProvider } from './contexts/SnackbarContext';

// Components
import Navbar from './components/Layout/Navbar';
import PrivateRoute from './components/Layout/PrivateRoute';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Income from './pages/Income/Income';
import Expenses from './pages/Expenses/Expenses';
import Bills from './pages/Bills/Bills';
import CreditCards from './pages/CreditCards/CreditCards';
import Loans from './pages/Loans/Loans';
import Savings from './pages/Savings/Savings';
import Analytics from './pages/Analytics/Analytics';
import Profile from './pages/Profile/Profile';

function App() {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <SnackbarProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                  <PrivateRoute>
                    <Navbar />
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Navbar />
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/income" element={
                  <PrivateRoute>
                    <Navbar />
                    <Income />
                  </PrivateRoute>
                } />
                <Route path="/expenses" element={
                  <PrivateRoute>
                    <Navbar />
                    <Expenses />
                  </PrivateRoute>
                } />
                <Route path="/bills" element={
                  <PrivateRoute>
                    <Navbar />
                    <Bills />
                  </PrivateRoute>
                } />
                <Route path="/credit-cards" element={
                  <PrivateRoute>
                    <Navbar />
                    <CreditCards />
                  </PrivateRoute>
                } />
                <Route path="/loans" element={
                  <PrivateRoute>
                    <Navbar />
                    <Loans />
                  </PrivateRoute>
                } />
                <Route path="/savings" element={
                  <PrivateRoute>
                    <Navbar />
                    <Savings />
                  </PrivateRoute>
                } />
                <Route path="/analytics" element={
                  <PrivateRoute>
                    <Navbar />
                    <Analytics />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Navbar />
                    <Profile />
                  </PrivateRoute>
                } />
              </Routes>
            </div>
          </Router>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;
