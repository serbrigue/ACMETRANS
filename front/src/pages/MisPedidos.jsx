// src/pages/MisPedidos.jsx

import React, { useState, useEffect, useCallback } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';

export default function MisPedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  // --- 1. NUEVO ESTADO para el dropdown ---
  const [sucursales, setSucursales] = useState([]);

  // --- 2. ESTADO MODIFICADO del formulario ---
  const [formData, setFormData] = useState({
    sucursal_origen: '', // 'origen' reemplazado
    destino: '',
    tipo_carga: 'General',
    detalles_carga: '',
    fecha_deseada: '',
  });

  // --- 3. Cargar Sucursales (para el dropdown) ---
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const response = await axiosPrivate.get('/api/data/sucursales/');
        setSucursales(response.data);
        // Pre-selecciona la primera sucursal en el formulario
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, sucursal_origen: response.data[0].id }));
        }
      } catch (err) {
        console.error("Error cargando sucursales", err);
      }
    };
    fetchSucursales();
  }, [axiosPrivate]); // Se ejecuta solo una vez al cargar

  // --- Cargar pedidos existentes (Sin cambios) ---
  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPrivate.get('/api/mis-pedidos/');
      setPedidos(response.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
          setError('Error: Tu cuenta no es de tipo "Cliente".');
      } else {
          setError('Error al cargar tus pedidos.');
      }
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // --- Manejadores del Formulario ---
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 4. Validar que una sucursal fue seleccionada
    if (!formData.sucursal_origen) {
        setError('Por favor, selecciona una sucursal de origen.');
        return;
    }
    setError(null);
    
    try {
      await axiosPrivate.post('/api/mis-pedidos/', formData);
      // 5. Resetear formulario
      setFormData({
        sucursal_origen: sucursales[0]?.id || '', // Resetea al primer item
        destino: '', 
        tipo_carga: 'General',
        detalles_carga: '', 
        fecha_deseada: '',
      });
      fetchPedidos(); // Recarga la lista
    } catch (err) {
      console.error(err);
      setError('Error al enviar la solicitud.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Columna 1: Formulario de Creación */}
      <div className="lg:col-span-1">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Solicitar Cotización</h2>
          
          {/* --- 6. CAMPO DE ORIGEN MODIFICADO (Select) --- */}
          <div className="mb-4">
            <label className="block text-gray-700">Origen (Sucursal ACME)</label>
            <select 
              name="sucursal_origen" 
              value={formData.sucursal_origen} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded" 
              required
            >
              <option value="" disabled>Selecciona una sucursal...</option>
              {sucursales.map(sucursal => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre} ({sucursal.ciudad})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Destino (Dirección)</label>
            <input type="text" name="destino" value={formData.destino} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
          </div>
          
          {/* ... (Resto de campos: Fecha, Tipo Carga, Detalles) ... */}
          <div className="mb-4">
            <label className="block text-gray-700">Fecha Deseada</label>
            <input type="date" name="fecha_deseada" value={formData.fecha_deseada} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Tipo de Carga</label>
            <input type="text" name="tipo_carga" value={formData.tipo_carga} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Detalles (Peso, Dimensiones, etc.)</label>
            <textarea name="detalles_carga" value={formData.detalles_carga} onChange={handleChange} className="w-full px-3 py-2 border rounded"></textarea>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
            Enviar Solicitud
          </button>
          
          {/* Muestra de Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Columna 2: Lista de Pedidos (Modificada para mostrar sucursal) */}
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Mis Solicitudes</h2>
          {loading && <p>Cargando...</p>}
          {/* Mostramos el error solo si NO es un 403 (porque ese error ya se muestra en el form) */}
          {error && !error.includes('Cliente') && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <div className="space-y-4">
              {pedidos.length === 0 ? (
                <p>No tienes solicitudes activas.</p>
              ) : (
                pedidos.map(pedido => (
                  <div key={pedido.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">
                        {/* 7. Actualiza el display de la ruta */}
                        {sucursales.find(s => s.id === pedido.sucursal_origen)?.nombre || 'Sucursal'} → {pedido.destino}
                      </span>
                      <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{pedido.estado}</span>
                    </div>
                    <p className="text-sm text-gray-600">Carga: {pedido.tipo_carga}</p>
                    <p className="text-sm text-gray-600">Fecha Solicitud: {new Date(pedido.fecha_solicitud).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}