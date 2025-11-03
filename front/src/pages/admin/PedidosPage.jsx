// src/pages/admin/PedidosPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // 1. Importa useParams
import useAxiosPrivate from '../../hooks/useAxiosPrivate.js';
import PedidoAdminModal from '../../components/PedidoAdminModal.jsx';

export default function PedidosPage() {
  const { id: sucursalId } = useParams(); // Obtiene el ID de la sucursal (si existe)

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);

  // --- Cargar Pedidos (Modificado) ---
  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Decide la URL (filtrada o general)
    let apiUrl = '/api/admin/pedidos/';
    if (sucursalId) {
      apiUrl += `?sucursal_id=${sucursalId}`;
    }

    try {
      const response = await axiosPrivate.get(apiUrl);
      setPedidos(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, sucursalId]); // Añade sucursalId como dependencia

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // --- Lógica de CRUD (Modal) ---
  const handleOpenModal = (pedido) => {
    setSelectedPedido(pedido);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPedido(null);
  };

  const handleSave = async (formData, pedidoId) => {
    try {
      // Usamos PATCH para enviar solo los campos modificados
      await axiosPrivate.patch(`/api/admin/pedidos/${pedidoId}/`, formData);
      handleCloseModal();
      fetchPedidos(); // Recarga la lista
    } catch (err) {
      console.error(err);
      setError('Error al actualizar el pedido.');
    }
  };

  // --- Renderizado ---
  const renderContent = () => {
    if (loading) return <p className="text-center p-4">Cargando pedidos...</p>;
    if (error) return <p className="bg-red-100 text-red-700 p-4 rounded">{error}</p>;
    if (pedidos.length === 0) {
      return (
        <div className="text-center p-4 text-gray-600">
          {sucursalId ? 
            "No se encontraron pedidos asignados a esta sucursal." :
            "No se encontraron pedidos."
          }
        </div>
      );
    }

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
            {/* TÍTULO CORREGIDO */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruta (Origen → Destino)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camión Asignado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pedido.cliente_username}</td>
              
              {/* CAMPO CORREGIDO */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {pedido.sucursal_origen_display} → {pedido.destino}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {pedido.camion_asignado_display || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {pedido.precio_cotizado ? `$${pedido.precio_cotizado}` : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{pedido.estado}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                <button 
                  onClick={() => handleOpenModal(pedido)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Gestionar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {/* Título dinámico */}
        {sucursalId ? "Gestión de Pedidos (Filtrada)" : "Gestión de Pedidos (Todos)"}
      </h1>
      
      {/* Muestra el error de 'handleSave' si ocurre */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {renderContent()}

      {/* Renderiza el modal (solo se muestra si isOpen es true) */}
      {selectedPedido && (
        <PedidoAdminModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          pedidoData={selectedPedido}
        />
      )}
    </div>
  );
}