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
              </Routes>
            </div>
          </Router>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;
