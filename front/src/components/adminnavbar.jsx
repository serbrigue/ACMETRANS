// src/components/AdminNavbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminNavbar() {
  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        <span className="font-semibold text-lg">Panel de Administración</span>

        {/* Ahora solo hay un enlace principal */}
        <div className="flex gap-6">
          <Link 
            to="/admin/sucursales" 
            className="text-gray-300 hover:text-white font-medium"
          >
            Ver Sucursales
          </Link>
        </div>
      </div>
    </nav>
  );
}