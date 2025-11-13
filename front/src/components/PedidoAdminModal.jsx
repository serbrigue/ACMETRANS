// src/components/PedidoAdminModal.jsx

import { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxOpen, 
  faSave, 
  faTimes, 
  faSpinner, 
  faExclamationTriangle, 
  faTruck, 
  faDollarSign, 
  faUser,
  faWeightHanging, // <-- ¡NUEVO ICONO!
  faCube             // <-- ¡NUEVO ICONO!
} from '@fortawesome/free-solid-svg-icons';

const ESTADO_CHOICES = [
  'SOLICITADO', 'COTIZADO', 'CONFIRMADO', 'EN_RUTA', 'COMPLETADO', 'CANCELADO'
];

export default function PedidoAdminModal({ pedidoId, onClose, onSave }) {
  
  const [pedido, setPedido] = useState(null); 
  const [formData, setFormData] = useState({
    estado: 'SOLICITADO',
    costo_estimado: '',
    precio_cotizado: '',
    camion_asignado: '',
  });

  const [camionesDisponibles, setCamionesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');
  
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchFullPedido = async () => {
      if (!pedidoId) return;

      setLoading(true);
      setError('');
      try {
        // 1. Cargamos los detalles completos del pedido
        // (Esto ahora incluirá 'peso_kg' y 'volumen_m3' desde el serializer)
        const pedidoRes = await axiosPrivate.get(`/api/admin/pedidos/${pedidoId}/`);
        const fullPedido = pedidoRes.data;
        setPedido(fullPedido);
        
        // 2. Llenamos el formulario
        setFormData({
          estado: fullPedido.estado,
          costo_estimado: fullPedido.costo_estimado || '',
          precio_cotizado: fullPedido.precio_cotizado || '',
          camion_asignado: fullPedido.camion_asignado ? fullPedido.camion_asignado.id : '',
        });

        // 3. Cargamos los camiones disponibles
        await fetchCamionesDisponibles(fullPedido);

      } catch (err) {
        console.error("Error al cargar pedido", err);
        setError('No se pudo cargar la información del pedido.');
      } finally {
        setLoading(false);
      }
    };

    // Función separada para cargar camiones
    const fetchCamionesDisponibles = async (currentPedido) => {
      try {
        const [camionesRes, pedidosRes] = await Promise.all([
          axiosPrivate.get('/api/admin/camiones/'), 
          axiosPrivate.get('/api/admin/pedidos/')  
        ]);

        const camionesOcupadosIds = new Set(
          pedidosRes.data
            .filter(p => (p.estado === 'CONFIRMADO' || p.estado === 'EN_RUTA') && p.id !== currentPedido.id) 
            .map(p => p.camion_asignado) 
            .filter(id => id != null)
        );
        
        const disponibles = camionesRes.data.filter(cam => 
          cam.sucursal_base.id == currentPedido.sucursal_origen.id && 
          !camionesOcupadosIds.has(cam.id)                   
        );
        
        setCamionesDisponibles(disponibles);

      } catch (err) {
        console.error("Error al cargar camiones", err);
        setError(prev => prev + ' (Error al cargar camiones disponibles)');
      }
    };

    fetchFullPedido();

  }, [pedidoId, axiosPrivate]);
  
  // (handleChange y handleSubmit sin cambios)
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
      costo_estimado: formData.costo_estimado === '' ? null : formData.costo_estimado,
      precio_cotizado: formData.precio_cotizado === '' ? null : formData.precio_cotizado,
      camion_asignado: formData.camion_asignado === '' ? null : formData.camion_asignado,
    };
    try {
      await axiosPrivate.patch(`/api/admin/pedidos/${pedido.id}/`, dataToSend);
      onSave();
    } catch (err) {
      console.error('Error al actualizar pedido:', err.response?.data);
      setError('Error al guardar. Revise los campos.');
      setLoading(false);
    }
  };
  
  const formatEstado = (estado) => {
    if (!estado) return '';
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase().replace('_', ' ');
  };
  
  // (Renderizado de Carga y Error sin cambios)
  if (!pedido && loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-10 flex flex-col items-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600 text-5xl" />
          <p className="text-gray-700 text-lg font-medium mt-4">Cargando Pedido...</p>
        </div>
      </div>
    );
  }
  if (!pedido && error) {
     return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-10 flex flex-col items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-5xl" />
          <p className="text-gray-700 text-lg font-medium mt-4 text-center">{error}</p>
          <button
              type="button"
              onClick={onClose}
              className="mt-6 bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300"
            >
              Cerrar
            </button>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO DEL MODAL (CON CAMPOS ACTUALIZADOS) ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl transform transition-all max-h-[90vh] flex flex-col">
        
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faBoxOpen} className="text-blue-600 text-2xl" />
            <h2 className="text-2xl font-bold text-gray-800">
              Gestionar Solicitud #{pedido.id}
            </h2>
          </div>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <FontAwesomeIcon icon={faTimes} className="text-2xl" />
          </button>
        </div>

        <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center rounded-b-xl z-10">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600 text-4xl" />
            </div>
          )}

          {/* Columna 1: Información del Pedido */}
          <div className="space-y-6">
            {/* Info Cliente (Sin cambios) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-gray-500" />
                Información del Cliente
              </h3>
              <div className="p-4 border rounded-lg bg-gray-50 space-y-2">
                <p><span className="font-semibold text-gray-700">Cliente:</span> {pedido.cliente_nombre}</p>
                <p><span className="font-semibold text-gray-700">Origen:</span> {pedido.sucursal_origen.nombre}</p>
                <p><span className="font-semibold text-gray-700">Destino:</span> {pedido.destino}</p>
              </div>
            </div>
            
            {/* --- ¡SECCIÓN ACTUALIZADA! --- */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faTruck} className="text-gray-500" />
                Detalles de la Carga
              </h3>
              {/* Cambiado a grid para mejor alineación */}
              <div className="p-4 border rounded-lg bg-gray-50 grid grid-cols-2 gap-4">
                {/* Tipo (spans 2 cols) */}
                <div className="col-span-2">
                  <span className="text-sm font-semibold text-gray-700">Tipo de Carga</span>
                  <p className="text-gray-900">{pedido.tipo_carga}</p>
                </div>
                
                {/* Peso */}
                <div>
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <FontAwesomeIcon icon={faWeightHanging} className="w-4" /> Peso
                  </span>
                  <p className="text-gray-900 font-medium">{pedido.peso_kg} kg</p>
                </div>
                
                {/* Volumen */}
                <div>
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <FontAwesomeIcon icon={faCube} className="w-4" /> Volumen
                  </span>
                  <p className="text-gray-900 font-medium">{pedido.volumen_m3} m³</p>
                </div>
                
                {/* Fecha (spans 2 cols) */}
                <div className="col-span-2">
                  <span className="text-sm font-semibold text-gray-700">Fecha Deseada</span>
                  <p className="text-gray-900">{new Date(pedido.fecha_deseada).toLocaleDateString('es-CL')}</p>
                </div>
                
                {/* Detalles (spans 2 cols) */}
                <div className="col-span-2">
                  <span className="text-sm font-semibold text-gray-700">Detalles Adicionales</span>
                  <p className="text-gray-900">{pedido.detalles_carga || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Columna 2: Formulario de Gestión (Sin cambios) */}
          <form onSubmit={handleSubmit} id="pedidoForm" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faDollarSign} className="text-gray-500" />
                Asignación y Costos (Admin)
              </h3>
              <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                {/* Estado */}
                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado del Pedido</label>
                  <select
                    id="estado" name="estado"
                    value={formData.estado} onChange={handleChange}
                    className="mt-1 w-full input-std bg-white"
                  >
                    {ESTADO_CHOICES.map(e => (
                      <option key={e} value={e}>{formatEstado(e)}</option>
                    ))}
                  </select>
                </div>
                {/* Precio Cotizado */}
                <div>
                  <label htmlFor="precio_cotizado" className="block text-sm font-medium text-gray-700">Precio Cotizado (CLP)</label>
                  <input
                    type="number" id="precio_cotizado" name="precio_cotizado"
                    value={formData.precio_cotizado} onChange={handleChange}
                    placeholder="Ej: 1500000"
                    className="mt-1 w-full input-std"
                  />
                </div>
                {/* Camión Asignado */}
                <div>
                  <label htmlFor="camion_asignado" className="block text-sm font-medium text-gray-700">Camión Asignado</label>
                  <select
                    id="camion_asignado" name="camion_asignado"
                    value={formData.camion_asignado} onChange={handleChange}
                    className="mt-1 w-full input-std bg-white"
                    disabled={loading}
                  >
                    <option value="">-- Sin Camión Asignado --</option>
                    {camionesDisponibles.map(cam => (
                      <option key={cam.id} value={cam.id}>
                        {cam.matricula} ({cam.capacidad}) - {cam.conductor_nombre || 'Sin cond.'}
                      </option>
                    ))}
                    {pedido.camion_asignado && !camionesDisponibles.some(c => c.id === pedido.camion_asignado.id) && (
                      <option key={pedido.camion_asignado.id} value={pedido.camion_asignado.id}>
                        {pedido.camion_asignado.matricula} (Asignado actualmente)
                      </option>
                    )}
                  </select>
                </div>
                {/* Costo Estimado */}
                <div>
                  <label htmlFor="costo_estimado" className="block text-sm font-medium text-gray-700">Costo Estimado (Interno)</label>
                  <input
                    type="number" id="costo_estimado" name="costo_estimado"
                    value={formData.costo_estimado} onChange={handleChange}
                    placeholder="Ej: 1000000"
                    className="mt-1 w-full input-std"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Pie del Modal (Sin cambios) */}
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
              type="submit" form="pedidoForm" disabled={loading}
              className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-400 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={loading ? faSpinner : faSave} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Actualizando...' : 'Actualizar Pedido'}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}

// (Asumo que tienes una clase global 'input-std' para los inputs,
// ej. en src/index.css, de lo contrario reemplázala por las clases de Tailwind)
// .input-std {
//   @apply block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
//          focus:outline-none focus:ring-2 focus:ring-blue-500;
// }