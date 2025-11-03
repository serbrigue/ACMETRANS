// src/pages/admin/SucursalLayout.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, NavLink, Outlet } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.js';

export default function SucursalLayout() {
  const { id: sucursalId } = useParams(); // Obtiene el ID de la URL
  const [sucursal, setSucursal] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  // Carga los datos de esta sucursal específica para mostrar el título
  useEffect(() => {
    const fetchSucursal = async () => {
      try {
        const response = await axiosPrivate.get(`/api/data/sucursales/${sucursalId}/`);
        setSucursal(response.data);
      } catch (err) {
        console.error("Error cargando la sucursal", err);
      }
    };
    fetchSucursal();
  }, [sucursalId, axiosPrivate]);

  // Estilo para el NavLink activo
  const activeClassName = "bg-blue-600 text-white px-3 py-2 rounded-md font-medium";
  const inactiveClassName = "text-gray-700 hover:bg-gray-200 hover:text-black px-3 py-2 rounded-md font-medium";

  if (!sucursal) {
    return <p>Cargando sucursal...</p>;
  }

  return (
    <div>
      {/* Botón para volver a la lista */}
      <Link 
        to="/admin/sucursales" 
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Volver a todas las Sucursales
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Gestionando Sucursal: {sucursal.nombre}
      </h1>

      {/* --- BARRA DE NAVEGACIÓN SECUNDARIA --- */}
      <nav className="bg-white rounded-lg shadow-md mb-6">
        <div className="container mx-auto px-4 py-3 flex gap-4">
          <NavLink
            to="." // '.' significa la ruta actual (/admin/sucursales/:id)
            end // 'end' es crucial para que no se active con las otras rutas
            className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="camiones" // Ruta anidada (/admin/sucursales/:id/camiones)
            className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
          >
            Gestionar Camiones
          </NavLink>
          <NavLink
            to="empleados" // Ruta anidada
            className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
          >
            Gestionar Empleados
          </NavLink>
          <NavLink
            to="pedidos" // Ruta anidada
            className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
          >
            Gestionar Pedidos
          </NavLink>
        </div>
      </nav>

      {/* --- Contenido Anidado --- */}
      {/* Aquí se renderizará <SucursalDashboardPage>, <CamionesPage>, etc. */}
      <Outlet /> 
    </div>
  );
}