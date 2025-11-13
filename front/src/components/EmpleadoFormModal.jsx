// src/components/EmpleadoFormModal.jsx

import { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faSave, faTimes, faSpinner, faExclamationTriangle, faIdCard, faBriefcase, faTrafficLight } from '@fortawesome/free-solid-svg-icons';

// Opciones de Cargo (de models.py)
const CARGO_CHOICES = [
  { value: 'ADM', label: 'Administrador' },
  { value: 'CON', label: 'Conductor' },
  { value: 'MEC', label: 'Mecánico' },
  { value: 'AUX', label: 'Auxiliar' },
  { value: 'GER', label: 'Gerente' },
];

// --- NUEVO: Opciones de Estado de Empleado ---
const ESTADO_EMPLEADO_CHOICES = [
  { value: 'DIS', label: 'Disponible' },
  { value: 'RUT', label: 'En Ruta' },
  { value: 'LIC', label: 'Licencia' },
  { value: 'VAC', label: 'Vacaciones' },
  { value: 'PER', label: 'Permiso' },
];

export default function EmpleadoFormModal({ empleado, sucursalId, onClose, onSave }) {
  
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '', 
    cargo: 'CON',
    estado: 'DIS', // --- NUEVO ---
    sucursal: sucursalId,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const axiosPrivate = useAxiosPrivate();
  const isEditing = Boolean(empleado);

  useEffect(() => {
    if (empleado) {
      setFormData({
        username: empleado.user.username,
        first_name: empleado.user.first_name,
        last_name: empleado.user.last_name,
        email: empleado.user.email,
        password: '', 
        cargo: empleado.cargo,
        estado: empleado.estado, // --- NUEVO ---
        sucursal: empleado.sucursal.id,
      });
    }
  }, [empleado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const method = isEditing ? 'patch' : 'post';
    const url = isEditing ? `/api/admin/empleados/${empleado.id}/` : '/api/admin/empleados/';
    
    const dataToSend = {
      user: {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      },
      cargo: formData.cargo,
      estado: formData.estado, // --- NUEVO ---
      sucursal: formData.sucursal,
    };
    
    if (!isEditing && formData.password) {
      dataToSend.user.password = formData.password;
    }
    if (isEditing && formData.password) {
      dataToSend.user.password = formData.password;
    }

    try {
      await axiosPrivate[method](url, dataToSend);
      onSave();
    } catch (err) {
      console.error('Error al guardar empleado:', err.response.data);
      let errorMsg = 'Error al guardar. Revise los campos.';
      if (err.response?.data?.user?.username) {
        errorMsg = 'Error: El nombre de usuario ya existe.';
      }
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl transform transition-all max-h-[90vh] flex flex-col">
        
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faUserPlus} className="text-blue-600 text-2xl" />
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Editar Empleado' : 'Crear Nuevo Empleado'}
            </h2>
          </div>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <FontAwesomeIcon icon={faTimes} className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="empleadoForm" className="p-6 overflow-y-auto">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center rounded-b-xl z-10">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600 text-4xl" />
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faIdCard} className="text-gray-500" />
              Datos de Usuario y Acceso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 border rounded-lg bg-gray-50">
              {/* (Campos username, email, password - sin cambios) */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nombre de Usuario *</label>
                <input
                  type="text" id="username" name="username"
                  value={formData.username} onChange={handleChange} required
                  className="mt-1 w-full input-std"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email" id="email" name="email"
                  value={formData.email} onChange={handleChange}
                  className="mt-1 w-full input-std"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña {isEditing ? '(Dejar en blanco para no cambiar)' : '*'}
                </label>
                <input
                  type="password" id="password" name="password"
                  value={formData.password} onChange={handleChange}
                  required={!isEditing} 
                  className="mt-1 w-full input-std"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faBriefcase} className="text-gray-500" />
              Perfil de Empleado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 border rounded-lg bg-gray-50">
              {/* (Campos first_name, last_name - sin cambios) */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Nombres *</label>
                <input
                  type="text" id="first_name" name="first_name"
                  value={formData.first_name} onChange={handleChange} required
                  className="mt-1 w-full input-std"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Apellidos *</label>
                <input
                  type="text" id="last_name" name="last_name"
                  value={formData.last_name} onChange={handleChange} required
                  className="mt-1 w-full input-std"
                />
              </div>
              <div>
                <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">Cargo *</label>
                <select
                  id="cargo" name="cargo"
                  value={formData.cargo} onChange={handleChange} required
                  className="mt-1 w-full input-std bg-white"
                >
                  {CARGO_CHOICES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              
              {/* --- ¡NUEVO! Campo Estado Empleado --- */}
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado *</label>
                <select
                  id="estado" name="estado"
                  value={formData.estado} onChange={handleChange} required
                  className="mt-1 w-full input-std bg-white"
                >
                  {ESTADO_EMPLEADO_CHOICES.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>

              {/* (Campo Sucursal - sin cambios) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Sucursal *</label>
                <input
                  type="text"
                  value={isEditing ? empleado.sucursal.nombre : (sucursalId === '1' ? 'Osorno' : (sucursalId === '2' ? 'Santiago' : 'Coquimbo'))}
                  disabled
                  className="mt-1 w-full input-std bg-gray-200 text-gray-500"
                />
                <input type="hidden" name="sucursal" value={formData.sucursal} />
              </div>
            </div>
          </div>
        </form>
        
        <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-xl mt-auto">
          {error && (
            <div className="text-red-600 font-medium mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>{error}</span>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button" onClick={onClose} disabled={loading}
              className="bg-white text-gray-700 font-semibold py-2 px-5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit" form="empleadoForm" disabled={loading}
              className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-400 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={loading ? faSpinner : faSave} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Empleado')}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}