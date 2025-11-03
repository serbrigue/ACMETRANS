// src/pages/admin/CamionesPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // 1. Importa useParams
import useAxiosPrivate from '../../hooks/useAxiosPrivate.js';
import CamionFormModal from '../../components/CamionFormModal.jsx';

export default function CamionesPage() {
  // 2. Obtiene el 'id' de la sucursal desde la URL
  // Si 'id' no existe (ruta antigua), será 'undefined'
  const { id: sucursalId } = useParams();

  const [camiones, setCamiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCamion, setSelectedCamion] = useState(null);

  // --- Función para Cargar Camiones (Modificada) ---
  const fetchCamiones = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // 3. Decide la URL de la API
    let apiUrl = '/api/admin/camiones/';
    if (sucursalId) {
      // Si estamos en una ruta de sucursal, añade el filtro
      apiUrl += `?sucursal_id=${sucursalId}`;
    }

    try {
      const response = await axiosPrivate.get(apiUrl);
      setCamiones(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los camiones. ¿Tienes permisos?');
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, sucursalId]); // 4. Añade sucursalId como dependencia

  // --- Carga inicial de datos ---
  useEffect(() => {
    fetchCamiones();
  }, [fetchCamiones]); 


  // ... (TODA LA LÓGICA DE CRUD: handleOpenModal, handleCloseModal, handleSave, handleDelete) ...
  // ... (No necesita cambios) ...
  const handleOpenModal = (camion = null) => {
    setSelectedCamion(camion);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCamion(null);
  };
  const handleSave = async (formData, camionId) => {
    try {
      if (camionId) {
        await axiosPrivate.put(`/api/admin/camiones/${camionId}/`, formData);
      } else {
        await axiosPrivate.post('/api/admin/camiones/', formData);
      }
      handleCloseModal();
      fetchCamiones();
    } catch (err) {
      console.error(err);
      setError('Error al guardar el camión.');
    }
  };
  const handleDelete = async (camionId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este camión?')) {
      try {
        await axiosPrivate.delete(`/api/admin/camiones/${camionId}/`);
        fetchCamiones();
      } catch (err) {
        console.error(err);
        setError('Error al eliminar el camión.');
      }
    }
  };


  // --- Renderizado (Modificado) ---
  const renderContent = () => {
    // ... (Estados de Loading y Error) ...
    if (loading) {
      return <div className="text-center p-4">Cargando camiones...</div>;
    }
    if (error) {
      return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;
    }
    
    // 3. Estado de Cero Camiones
    if (camiones.length === 0) {
      return (
        <div className="text-center p-4 text-gray-600">
          {/* 5. Mensaje dinámico */}
          {sucursalId ? 
            "No se encontraron camiones para esta sucursal." :
            "No se encontraron camiones en la base de datos."
          }
        </div>
      );
    }

    // 4. Estado Exitoso (Mostrar tabla)
    // ... (La tabla es la misma) ...
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matrícula</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sucursal Base</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conductor</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {camiones.map((camion) => (
            <tr key={camion.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{camion.matricula}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{camion.get_capacidad_display}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{camion.sucursal_base}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {camion.conductor_asignado ? camion.conductor_asignado : 'Sin Asignar'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                <button 
                  onClick={() => handleOpenModal(camion)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(camion.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {/* 6. Título dinámico */}
          {sucursalId ? "Gestión de Flota (Filtrada)" : "Gestión de Flota (Todos)"}
        </h1>
        <button
          onClick={() => handleOpenModal(null)}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          + Crear Camión
        </button>
      </div>

      {renderContent()}

      <CamionFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        camionData={selectedCamion}
      />
    </div>
  );
}