// src/components/AdminRoute.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
  const { user } = useAuth();

  if (!user) {
    // Si no hay usuario, redirige a Login
    return <Navigate to="/login" replace />;
  }

  if (!user.is_superuser) {
    // Si el usuario existe pero NO es admin, redirige a Home
    return <Navigate to="/" replace />;
  }

  // Si el usuario es admin, muestra el contenido de la ruta (Outlet)
  return <Outlet />;
}