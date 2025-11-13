// src/components/CamionFormModal.jsx

import { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faUser, faSave, faTimes, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ESTADO_CAMION_CHOICES = [
  { value: 'DIS', label: 'Disponible' },
  { value: 'RUT', label: 'En Ruta' },
  { value: 'MAN', label: 'En Mantención' },
  { value: 'REP', label: 'En Reparación' },
];

export default function CamionFormModal({ camion, sucursalId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    matricula: '',
    capacidad: 'MC',
    estado: 'DIS', 
    conductor_asignado: '',
    sucursal_base: sucursalId,
  });

  const [conductoresDisponibles, setConductoresDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const axiosPrivate = useAxiosPrivate();

  // --- ¡CORRECCIÓN! ---
  // Movemos la definición de conductorActualId aquí, al scope del componente.
  const conductorActualId = camion?.conductor_asignado?.id || null;

  useEffect(() => {
    // Ya no se define aquí, viene del scope de arriba.

    const fetchConductoresDisponibles = async () => {
      setLoading(true);
      setError('');
      try {
        const [empleadosRes, camionesRes] = await Promise.all([
          axiosPrivate.get('/api/admin/empleados/'),
          axiosPrivate.get('/api/admin/camiones/')
        ]);

        const conductoresAsignadosIds = new Set(
          camionesRes.data
            .map(c => c.conductor_asignado ? c.conductor_asignado.id : null)
            .filter(id => id != null && id !== conductorActualId) // Excluir al actual
        );
        
        const disponibles = empleadosRes.data.filter(emp => {
          const esDeLaSucursal = emp.sucursal.id == sucursalId;
          const esConductor = emp.cargo === 'CON';
          const estaAsignadoAOtro = conductoresAsignadosIds.has(emp.id);

          // Si es el conductor ya asignado a ESTE camión
          if (emp.id === conductorActualId) {
            return true; 
          }
          
          // O si es un conductor disponible
          return esDeLaSucursal && esConductor && emp.estado === 'DIS' && !estaAsignadoAOtro;
        });
        
        setConductoresDisponibles(disponibles);

      } catch (err) {
        console.error("Error al cargar datos para el modal", err);
        setError('No se pudieron cargar las opciones de conductores.');
      } finally {
        setLoading(false);
      }
    };

    fetchConductoresDisponibles();
    
    // Llenar el formulario si estamos editando
    if (camion) {
      setFormData({
        matricula: camion.matricula,
        capacidad: camion.capacidad,
        estado: camion.estado, 
        conductor_asignado: conductorActualId || '', // Usamos el ID
        sucursal_base: camion.sucursal_base.id,
      });
    }

  // --- ¡CORRECCIÓN! ---
  // Añadimos conductorActualId a la lista de dependencias del useEffect
  }, [camion, sucursalId, axiosPrivate, conductorActualId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const dataToSend = {
      ...formData,
      conductor_asignado: formData.conductor_asignado === '' ? null : formData.conductor_asignado,
    };

    const method = camion ? 'put' : 'post';
    const url = camion ? `/api/admin/camiones/${camion.id}/` : '/api/admin/camiones/';

    try {
      await axiosPrivate[method](url, dataToSend);
      onSave(); 
    } catch (err) {
      console.error('Error al guardar camión:', err);
      setError('Error al guardar. Verifique que la matrícula no esté repetida.');
      setLoading(false);
    }
  };

  return (
    // Modal UI
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faTruck} className="text-blue-600 text-2xl" />
            <h2 className="text-2xl font-bold text-gray-800">
              {camion ? 'Editar Camión' : 'Añadir Nuevo Camión'}
            </h2>
          </div>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <FontAwesomeIcon icon={faTimes} className="text-2xl" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} id="camionForm" className="p-6 overflow-y-auto">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center rounded-b-xl z-10">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600 text-4xl" />
            </div>
          )}
          
          {/* Fila 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="matricula" className="block text-sm font-semibold text-gray-700 mb-2">
                Matrícula (Patente)
              </label>
              <input
                type="text" id="matricula" name="matricula"
                value={formData.matricula} onChange={handleChange} required
                className="w-full input-std"
                placeholder="ABCD-12"
              />
            </div>
            <div>
              <label htmlFor="capacidad" className="block text-sm font-semibold text-gray-700 mb-2">
                Capacidad
              </label>
              <select
                id="capacidad" name="capacidad"
                value={formData.capacidad} onChange={handleChange}
                className="w-full input-std bg-white"
              >
                <option value="MC">Mediana Capacidad</option>
                <option value="GC">Gran Capacidad</option>
              </select>
            </div>
            
            {/* Fila 2 (Estado) */}
            <div>
              <label htmlFor="estado" className="block text-sm font-semibold text-gray-700 mb-2">
                Estado del Camión
              </label>
              <select
                id="estado" name="estado"
                value={formData.estado} onChange={handleChange}
                className="w-full input-std bg-white"
              >
                {ESTADO_CAMION_CHOICES.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Fila 3 (Conductor) */}
          <div className="mt-6">
            <label htmlFor="conductor_asignado" className="block text-sm font-semibold text-gray-700 mb-2">
              Conductor Asignado (Opcional)
            </label>
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faUser} className="text-gray-400" />
              <select
                id="conductor_asignado" name="conductor_asignado"
                value={formData.conductor_asignado} onChange={handleChange}
                className="w-full input-std bg-white"
                disabled={loading}
              >
                <option value="">-- Sin Conductor Asignado --</option>
                {conductoresDisponibles.map(cond => (
                  <option key={cond.id} value={cond.id}>
                    {cond.user.first_name} {cond.user.last_name} ({cond.user.username})
                    {/* --- ¡AQUÍ ESTABA EL ERROR! --- 
                      Ahora 'conductorActualId' SÍ está definido en este scope.
                    */}
                    {cond.id === conductorActualId ? ' (Asignado)' : ` (${cond.estado_display})`}
                  </option>
                ))}
              </select>
            </div>
            {!loading && conductoresDisponibles.length === 0 && !camion?.conductor_asignado && (
              <p className="text-sm text-gray-500 mt-2">
                No hay conductores 'Disponibles' en esta sucursal.
              </p>
            )}
          </div>

          <input type="hidden" name="sucursal_base" value={formData.sucursal_base} />
        </form>
        
        {/* Pie del Modal */}
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
              type="submit" form="camionForm" onClick={handleSubmit} disabled={loading}
              className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-400 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={loading ? faSpinner : faSave} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Guardando...' : (camion ? 'Guardar Cambios' : 'Crear Camión')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}