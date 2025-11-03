// src/pages/admin/EmpleadosPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // 1. Importa useParams
import useAxiosPrivate from '../../hooks/useAxiosPrivate.js';
import EmpleadoFormModal from '../../components/EmpleadoFormModal.jsx';

export default function EmpleadosPage() {
  const { id: sucursalId } = useParams(); // 2. Obtiene el ID

  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);

  // --- Cargar Empleados (Modificado) ---
  const fetchEmpleados = useCallback(async () => {
    setLoading(true);
    setError(null);

    // 3. Decide la URL
    let apiUrl = '/api/admin/empleados/';
    if (sucursalId) {
      apiUrl += `?sucursal_id=${sucursalId}`;
    }

    try {
      const response = await axiosPrivate.get(apiUrl);
      setEmpleados(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los empleados.');
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, sucursalId]); // 4. Añade dependencia

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  // ... (Lógica de CRUD: handleOpenModal, handleCloseModal, handleSave, handleDelete) ...
  // ... (No necesita cambios) ...
  const handleOpenModal = (empleado = null) => {
    setSelectedEmpleado(empleado);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmpleado(null);
  };
  const handleSave = async (formData, empleadoId) => {
    try {
      if (empleadoId) {
        await axiosPrivate.put(`/api/admin/empleados/${empleadoId}/`, formData);
      } else {
        await axiosPrivate.post('/api/admin/empleados/', formData);
      }
      handleCloseModal();
      fetchEmpleados();
    } catch (err) {
      console.error(err);
      setError('Error al guardar el empleado. ¿El usuario o email ya existen?');
    }
  };
  const handleDelete = async (empleadoId) => {
    if (window.confirm('¿Estás seguro? Esto eliminará al empleado Y su cuenta de usuario asociada.')) {
      try {
        await axiosPrivate.delete(`/api/admin/empleados/${empleadoId}/`);
        fetchEmpleados();
      } catch (err) {
        console.error(err);
        setError('Error al eliminar el empleado.');
      }
    }
  };


  // --- Renderizado (Modificado) ---
  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-4">Cargando empleados...</div>;
    }
    if (error) {
      return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;
    }
    if (empleados.length === 0) {
      return (
        <div className="text-center p-4 text-gray-600">
          {/* 5. Mensaje dinámico */}
          {sucursalId ? 
            "No se encontraron empleados para esta sucursal." :
            "No se encontraron empleados."
          }
        </div>
      );
    }

    // ... (La tabla es la misma) ...
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sucursal</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {empleados.map((empleado) => (
            <tr key={empleado.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{empleado.user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{empleado.user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{empleado.get_cargo_display}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{empleado.sucursal}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                <button 
                  onClick={() => handleOpenModal(empleado)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(empleado.id)}
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
          {sucursalId ? "Gestión de Empleados (Filtrada)" : "Gestión de Empleados (Todos)"}
        </h1>
        <button
          onClick={() => handleOpenModal(null)}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          + Crear Empleado
        </button>
      </div>

      {renderContent()}

      <EmpleadoFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        empleadoData={selectedEmpleado}
      />
    </div>
  );
}