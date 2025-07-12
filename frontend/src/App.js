import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import CategoryPage from './pages/CategoryPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import RoomCategoriesPage from './pages/RoomCategoriesPage';
import RoomDetailsPage from './pages/RoomDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/room-categories" element={<RoomCategoriesPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/room/:roomId" element={<RoomDetailsPage />} />
        {/* Future routes: room details, etc. */}
      </Routes>
      
      {/* Global Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Router>
  );
}

export default App; 