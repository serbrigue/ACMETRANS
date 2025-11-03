// src/components/PedidoAdminModal.jsx

import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';

// Lista de estados que el admin puede asignar
const ESTADO_CHOICES = [
  'SOLICITADO',
  'COTIZADO',
  'CONFIRMADO',
  'EN_RUTA',
  'COMPLETADO',
  'CANCELADO',
];

export default function PedidoAdminModal({ isOpen, onClose, onSave, pedidoData }) {
  const [formData, setFormData] = useState({});
  const [camiones, setCamiones] = useState([]);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  // Carga la lista de camiones para el dropdown
  useEffect(() => {
    const fetchCamiones = async () => {
      try {
        const response = await axiosPrivate.get('/api/data/camiones/');
        setCamiones(response.data);
      } catch (err) {
        setError('No se pudieron cargar los camiones.');
      }
    };
    if (isOpen) {
      fetchCamiones();
    }
  }, [isOpen, axiosPrivate]);

  // Pre-llena el formulario cuando 'pedidoData' cambia
  useEffect(() => {
    if (pedidoData) {
      // Necesitamos encontrar el ID del camión basado en el 'display name'
      const camionActual = camiones.find(
        c => c.display_name === pedidoData.camion_asignado_display
      );
      
      setFormData({
        estado: pedidoData.estado || 'SOLICITADO',
        precio_cotizado: pedidoData.precio_cotizado || '',
        costo_estimado: pedidoData.costo_estimado || '',
        camion_asignado: camionActual ? camionActual.id : '',
      });
    }
  }, [pedidoData, camiones]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filtra los datos para no enviar strings vacíos si el campo es un número
    const dataToSend = {
      ...formData,
      precio_cotizado: formData.precio_cotizado || null,
      costo_estimado: formData.costo_estimado || null,
      camion_asignado: formData.camion_asignado || null,
    };
    onSave(dataToSend, pedidoData.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">
          Gestionar Pedido #{pedidoData.id} ({pedidoData.cliente_username})
        </h2>
        <p className="mb-4">{pedidoData.origen} → {pedidoData.destino}</p>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Estado */}
          <div className="mb-4">
            <label className="block text-gray-700">Estado del Pedido</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              {ESTADO_CHOICES.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>

          {/* Precio (Contra-oferta) */}
          <div className="mb-4">
            <label className="block text-gray-700">Precio Cotizado (Contra-oferta)</label>
            <input
              type="number"
              step="0.01"
              name="precio_cotizado"
              value={formData.precio_cotizado}
              onChange={handleChange}
              placeholder="Ej: 1500.00"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          {/* Costo Estimado (Interno) */}
          <div className="mb-4">
            <label className="block text-gray-700">Costo Estimado (Interno)</label>
            <input
              type="number"
              step="0.01"
              name="costo_estimado"
              value={formData.costo_estimado}
              onChange={handleChange}
              placeholder="Ej: 1000.00"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Asignar Camión (y Conductor) */}
          <div className="mb-4">
            <label className="block text-gray-700">Asignar Camión (Conductor)</label>
            <select
              name="camion_asignado"
              value={formData.camion_asignado}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">(No Asignar Aún)</option>
              {camiones.map(camion => (
                <option key={camion.id} value={camion.id}>{camion.display_name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Actualizar Pedido</button>
          </div>
        </form>
      </div>
    </div>
  );
}