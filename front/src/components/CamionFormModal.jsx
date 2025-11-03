// src/components/CamionFormModal.jsx

import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';

export default function CamionFormModal({ isOpen, onClose, onSave, camionData }) {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    matricula: '',
    capacidad: 'MC',
    sucursal_base: '',
    conductor_asignado: '',
  });

  // Estado para guardar los datos de los dropdowns
  const [sucursales, setSucursales] = useState([]);
  const [conductores, setConductores] = useState([]);
  
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  
  // Determina si estamos editando (vs creando)
  const isEditing = camionData !== null;

  // --- Carga de datos para Dropdowns (Sucursales y Conductores) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pedimos ambas listas de datos en paralelo
        const [sucResponse, conResponse] = await Promise.all([
          axiosPrivate.get('/api/data/sucursales/'),
          axiosPrivate.get('/api/data/conductores/')
        ]);
        setSucursales(sucResponse.data);
        setConductores(conResponse.data);
        
        // Si no estamos creando, pre-llenar los dropdowns
        if (!isEditing) {
            setFormData(prev => ({
                ...prev,
                sucursal_base: sucResponse.data[0]?.id || '',
                conductor_asignado: conResponse.data[0]?.id || '',
            }));
        }
      } catch (err) {
        setError('No se pudieron cargar los datos para el formulario.');
      }
    };
    
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, axiosPrivate, isEditing]);

  // --- Pre-llenado del formulario si estamos Editando ---
  useEffect(() => {
    if (isEditing) {
      // El 'camionData' de la tabla usa 'sucursal_base' (string)
      // Necesitamos encontrar el ID correspondiente
      const sucursal = sucursales.find(s => s.nombre === camionData.sucursal_base);
      const conductor = conductores.find(c => c.username === camionData.conductor_asignado?.split(' ')[0]);

      setFormData({
        matricula: camionData.matricula,
        capacidad: camionData.capacidad,
        sucursal_base: sucursal ? sucursal.id : '',
        conductor_asignado: conductor ? conductor.id : '',
      });
    } else {
      // Resetea el form si estamos creando
      setFormData({
        matricula: '',
        capacidad: 'MC',
        sucursal_base: sucursales[0]?.id || '',
        conductor_asignado: conductores[0]?.id || '',
      });
    }
  }, [camionData, isEditing, sucursales, conductores]);


  // --- Manejadores ---
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, camionData ? camionData.id : null);
  };

  // --- Renderizado ---
  if (!isOpen) {
    return null;
  }

  return (
    // Fondo oscuro del modal
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Contenedor del Modal */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">
          {isEditing ? 'Editar Camión' : 'Crear Nuevo Camión'}
        </h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Matricula */}
          <div className="mb-4">
            <label className="block text-gray-700">Matrícula</label>
            <input
              type="text"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {/* Capacidad */}
          <div className="mb-4">
            <label className="block text-gray-700">Capacidad</label>
            <select
              name="capacidad"
              value={formData.capacidad}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="MC">Mediana Capacidad</option>
              <option value="GC">Gran Capacidad</option>
            </select>
          </div>

          {/* Sucursal Base */}
          <div className="mb-4">
            <label className="block text-gray-700">Sucursal Base</label>
            <select
              name="sucursal_base"
              value={formData.sucursal_base}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              {sucursales.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>

          {/* Conductor Asignado */}
          <div className="mb-4">
            <label className="block text-gray-700">Conductor Asignado</label>
            <select
              name="conductor_asignado"
              value={formData.conductor_asignado}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">(Sin Asignar)</option>
              {conductores.map(c => (
                <option key={c.id} value={c.id}>{c.username}</option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}