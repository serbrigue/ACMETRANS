// src/pages/admin/SucursalDashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.js';

export default function SucursalDashboardPage() {
  const { id: sucursalId } = useParams(); 
  
  const [sucursal, setSucursal] = useState(null);
  const [camiones, setCamiones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          sucursalRes,
          camionesRes,
          empleadosRes,
          pedidosRes // Esta es la variable correcta
        ] = await Promise.all([
          axiosPrivate.get(`/api/data/sucursales/${sucursalId}/`),
          axiosPrivate.get(`/api/admin/camiones/?sucursal_id=${sucursalId}`),
          axiosPrivate.get(`/api/admin/empleados/?sucursal_id=${sucursalId}`),
          axiosPrivate.get(`/api/admin/pedidos/?sucursal_id=${sucursalId}`)
        ]);

        // --- LÍNEA DE DEPURACIÓN CORREGIDA ---
        // Usamos 'pedidosRes.data', NO 'response.data'
        console.log('Respuesta de /api/admin/pedidos/ (Dashboard):', pedidosRes.data);
        // -------------------------------------

        setSucursal(sucursalRes.data);
        setCamiones(camionesRes.data);
        setEmpleados(empleadosRes.data);
        setPedidos(pedidosRes.data);
        
      } catch (err) {
        // Asegúrate de imprimir el error real si la API falla
        console.error("Error en fetchData:", err); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sucursalId, axiosPrivate]);

  if (loading) {
    return <p>Cargando datos de la sucursal...</p>;
  }

  if (!sucursal) {
    return <p>Sucursal no encontrada.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna 1: Camiones */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Camiones ({camiones.length})</h2>
          <ul className="divide-y divide-gray-200">
            {camiones.length > 0 ? camiones.map(c => (
              <li key={c.id} className="py-2">
                <span className="font-medium">{c.matricula}</span>
                <span className="text-sm text-gray-600 ml-2">({c.get_capacidad_display})</span>
              </li>
            )) : <p className="text-sm text-gray-500">No hay camiones asignados.</p>}
          </ul>
        </div>

        {/* Columna 2: Empleados */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Empleados ({empleados.length})</h2>
          <ul className="divide-y divide-gray-200">
            {empleados.length > 0 ? empleados.map(e => (
              <li key={e.id} className="py-2">
                <span className="font-medium">{e.user.username}</span>
                <span className="text-sm text-gray-600 ml-2">({e.get_cargo_display})</span>
              </li>
            )) : <p className="text-sm text-gray-500">No hay empleados asignados.</p>}
          </ul>
        </div>

        {/* Columna 3: Pedidos Asignados */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Pedidos Originados ({pedidos.length})</h2>
          <p className="text-xs text-gray-500 mb-4">(Solicitudes con origen en esta sucursal)</p>
          <ul className="divide-y divide-gray-200">
            {pedidos.length > 0 ? pedidos.map(p => (
              <li key={p.id} className="py-2">
                <span className="font-medium">Pedido #{p.id}</span>
                <span className="text-sm text-gray-600 ml-2">({p.estado})</span>
                <p className="text-sm">
                  {p.sucursal_origen_display} &rarr; {p.destino}
                </p>
              </li>
            )) : <p className="text-sm text-gray-500">No hay pedidos originados aquí.</p>}
          </ul>
        </div>

      </div>
    </div>
  );
}