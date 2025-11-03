// src/components/EmpleadoFormModal.jsx

import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';

export default function EmpleadoFormModal({ isOpen, onClose, onSave, empleadoData }) {
  const [formData, setFormData] = useState({
    // Campos del User
    username: '',
    email: '',
    password: '',
    // Campos del Empleado
    cargo: 'CON',
    sucursal: '',
  });

  const [sucursales, setSucursales] = useState([]);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  
  // Si 'empleadoData' existe, estamos editando
  const isEditing = empleadoData !== null;

  // Carga las sucursales para el dropdown
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const response = await axiosPrivate.get('/api/data/sucursales/');
        setSucursales(response.data);
        // Pre-selecciona la primera sucursal si estamos creando
        if (!isEditing && response.data.length > 0) {
          setFormData(prev => ({ ...prev, sucursal: response.data[0].id }));
        }
      } catch (err) {
        setError('No se pudieron cargar las sucursales.');
      }
    };
    
    if (isOpen) {
      fetchSucursales();
    }
  }, [isOpen, isEditing, axiosPrivate]);

  // Pre-llena el formulario si estamos editando
  useEffect(() => {
    if (isEditing) {
      // En modo edición, cargamos los datos del empleado
      // No pedimos 'username', 'email' o 'password'
      setFormData({
        cargo: empleadoData.cargo,
        sucursal: sucursales.find(s => s.nombre === empleadoData.sucursal)?.id || '',
        // Dejamos los campos de User vacíos (no los enviaremos)
        username: empleadoData.user.username,
        email: empleadoData.user.email,
        password: '',
      });
    } else {
      // Resetea el form si estamos creando
      setFormData({
        username: '',
        email: '',
        password: '',
        cargo: 'CON',
        sucursal: sucursales[0]?.id || '',
      });
    }
  }, [empleadoData, isEditing, sucursales]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let dataToSend;
    if (isEditing) {
      // Si editamos, solo enviamos cargo y sucursal
      dataToSend = {
        cargo: formData.cargo,
        sucursal: formData.sucursal,
      };
    } else {
      // Si creamos, enviamos todo
      dataToSend = formData;
    }
    
    onSave(dataToSend, empleadoData ? empleadoData.id : null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">
          {isEditing ? `Editar Empleado: ${empleadoData.user.username}` : 'Crear Nuevo Empleado'}
        </h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          
          {/* Campos de User (Solo al CREAR) */}
          {!isEditing && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700">Nombre de Usuario</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Contraseña Temporal</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <hr className="my-4" />
            </>
          )}
          
          {/* Campos de Empleado (Siempre) */}
          <div className="mb-4">
            <label className="block text-gray-700">Cargo</label>
            <select
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="ADM">Administrador</option>
              <option value="CON">Conductor</option>
              <option value="MEC">Mecánico</option>
              <option value="AUX">Auxiliar</option>
              <option value="GER">Gerente</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Sucursal</label>
            <select
              name="sucursal"
              value={formData.sucursal}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="" disabled>Seleccione una sucursal</option>
              {sucursales.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
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