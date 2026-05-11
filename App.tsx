
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HiveDetail from './pages/HiveDetail';
import Simulator from './pages/Simulator';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import RegisterHive from './pages/RegisterHive';
import Profile from './pages/Profile';
import Login from './components/Login';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Recupera o usuário salvo para evitar login repetitivo
    const savedUser = localStorage.getItem('smarthive_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Atualiza o favicon dinamicamente do Supabase se a URL estiver presente
  useEffect(() => {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (supabaseUrl) {
      const links = document.querySelectorAll("link[rel*='icon']") as NodeListOf<HTMLLinkElement>;
      const faviconUrl = `${supabaseUrl}/storage/v1/object/public/img/Favicon.png`;
      links.forEach(link => {
        link.href = faviconUrl;
      });
    }
  }, []);

  const handleLogin = (newUser: User) => {
    localStorage.setItem('smarthive_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('smarthive_user');
    setUser(null);
  };

  const handleUpdateUser = (updatedUser: Partial<User>) => {
    setUser(prev => {
        if (!prev) return null;
        const newUser = { ...prev, ...updatedUser };
        localStorage.setItem('smarthive_user', JSON.stringify(newUser));
        return newUser;
    });
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cadastrar" element={<RegisterHive />} />
          <Route path="/perfil" element={<Profile user={user} onUpdateUser={handleUpdateUser} />} />
          <Route path="/hive/:id" element={<HiveDetail />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/analises" element={<Alerts />} /> 
          <Route path="/relatorios" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
