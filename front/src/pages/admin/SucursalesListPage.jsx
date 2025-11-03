// src/pages/admin/SucursalesListPage.jsx

import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.js';
import { Link } from 'react-router-dom';

export default function SucursalesListPage() {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const response = await axiosPrivate.get('/api/data/sucursales/');
        setSucursales(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSucursales();
  }, [axiosPrivate]);

  if (loading) {
    return <p>Cargando sucursales...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Centros de Operación (Sucursales)
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sucursales.map((sucursal) => (
          <Link 
            key={sucursal.id}
            to={`/admin/sucursales/${sucursal.id}`} // Enlace a la página de detalle
            className="block p-6 bg-gray-50 rounded-lg shadow border border-gray-200 hover:bg-blue-50 transition"
          >
            <h2 className="text-2xl font-bold text-blue-800">{sucursal.nombre}</h2>
            <p className="text-gray-600">{sucursal.ciudad}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}