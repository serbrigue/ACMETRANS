import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    // Si no hay usuario, redirige a Login
    return <Navigate to="/login" replace />;
  }

  // Si el usuario existe, permite el acceso a la ruta (ej: Mis Pedidos)
  return <Outlet />;
}