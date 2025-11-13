// src/pages/MisPedidos.jsx

import { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, faListAlt, faSpinner, faExclamationTriangle,
  faWarehouse, faMapPin, faCalendarAlt, faBox, faPencilAlt,
  faDollarSign, faCheck, faTruckFast, faTimes, faHourglassStart,
  faWeightHanging, faCube // <-- ¡NUEVOS ICONOS!
} from '@fortawesome/free-solid-svg-icons';

// --- ¡ACTUALIZADO! ---
const initialState = {
  sucursal_origen: '',
  destino: '',
  tipo_carga: '',
  peso_kg: '',      // <-- AÑADIDO
  volumen_m3: '',   // <-- AÑADIDO
  detalles_carga: '',
  fecha_deseada: '',
};

export default function MisPedidosPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formState, setFormState] = useState(initialState);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const axiosPrivate = useAxiosPrivate();

  // (fetchPageData sin cambios)
  const fetchPageData = async () => {
    try {
      setLoading(true);
      const [solicitudesRes, sucursalesRes] = await Promise.all([
        axiosPrivate.get('/api/mis-pedidos/'),
        axiosPrivate.get('/api/data/sucursales/')
      ]);
      setSolicitudes(solicitudesRes.data);
      setSucursales(sucursalesRes.data);
      setError(null);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError('No se pudo cargar la información. Intente recargar la página.');
    } finally {
      setLoading(false);
    }
  };
  
  // (fetchSolicitudes sin cambios)
  const fetchSolicitudes = async () => {
     try {
      const solicitudesRes = await axiosPrivate.get('/api/mis-pedidos/');
      setSolicitudes(solicitudesRes.data);
    } catch (err) {
      console.error("Error recargando solicitudes:", err);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, [axiosPrivate]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // (handleFormSubmit sin cambios, ya que envía el formState completo)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await axiosPrivate.post('/api/mis-pedidos/', formState);
      setFormState(initialState);
      await fetchSolicitudes(); 
    } catch (err) {
      console.error("Error creando solicitud:", err.response.data);
      // --- Error mejorado ---
      let errorMsg = 'Error al enviar. Verifique los campos obligatorios.';
      if (err.response?.data?.peso_kg) {
        errorMsg = 'Error: El peso debe ser un número válido.';
      } else if (err.response?.data?.volumen_m3) {
        errorMsg = 'Error: El volumen debe ser un número válido.';
      }
      setFormError(errorMsg);
    } finally {
      setFormLoading(false);
    }
  };

  // --- Renderizado ---

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <FontAwesomeIcon icon={faSpinner} className="text-blue-600 text-4xl animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-16 bg-red-50 text-red-700 font-semibold rounded-lg">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-3" />
        <p>{error}</p>
      </div>
    );
  }

  const inputStd = "block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Mis Solicitudes de Transporte
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna 1: Formulario de Creación */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg sticky top-28">
            <h2 className="text-2xl font-semibold text-gray-900 mb-5 flex items-center gap-3">
              <FontAwesomeIcon icon={faPaperPlane} className="text-blue-600" />
              Crear Nueva Solicitud
            </h2>
            
            {/* --- FORMULARIO ACTUALIZADO --- */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Origen y Destino (en una fila) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sucursal_origen" className="block text-sm font-medium text-gray-700">Origen*</label>
                  <div className="relative mt-1">
                    <FontAwesomeIcon icon={faWarehouse} className="absolute left-3 top-3.5 text-gray-400" />
                    <select
                      id="sucursal_origen" name="sucursal_origen"
                      value={formState.sucursal_origen} onChange={handleFormChange} required
                      className={`${inputStd} pl-10 bg-white`}
                    >
                      <option value="" disabled>Seleccione...</option>
                      {sucursales.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="fecha_deseada" className="block text-sm font-medium text-gray-700">Fecha Deseada*</label>
                  <div className="relative mt-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="date" id="fecha_deseada" name="fecha_deseada"
                      value={formState.fecha_deseada} onChange={handleFormChange} required
                      min={new Date().toISOString().split("T")[0]} 
                      className={`${inputStd} pl-10`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Destino (ocupa toda la fila) */}
              <div>
                <label htmlFor="destino" className="block text-sm font-medium text-gray-700">Dirección de Destino*</label>
                <div className="relative mt-1">
                  <FontAwesomeIcon icon={faMapPin} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text" id="destino" name="destino"
                    value={formState.destino} onChange={handleFormChange} required
                    placeholder="Ej: Av. Siempre Viva 742, Springfield"
                    className={`${inputStd} pl-10`}
                  />
                </div>
              </div>
              
              {/* Tipo de Carga */}
              <div>
                <label htmlFor="tipo_carga" className="block text-sm font-medium text-gray-700">Tipo de Carga*</label>
                <div className="relative mt-1">
                  <FontAwesomeIcon icon={faBox} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text" id="tipo_carga" name="tipo_carga"
                    value={formState.tipo_carga} onChange={handleFormChange} required
                    placeholder="Ej: Alimentos, Retail, Agrícola"
                    className={`${inputStd} pl-10`}
                  />
                </div>
              </div>

              {/* --- ¡NUEVOS CAMPOS! Peso y Volumen (en una fila) --- */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="peso_kg" className="block text-sm font-medium text-gray-700">Peso (kg)*</label>
                  <div className="relative mt-1">
                    <FontAwesomeIcon icon={faWeightHanging} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="number" id="peso_kg" name="peso_kg"
                      value={formState.peso_kg} onChange={handleFormChange} required
                      placeholder="Ej: 500.5"
                      step="0.01" min="0"
                      className={`${inputStd} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="volumen_m3" className="block text-sm font-medium text-gray-700">Volumen (m³)*</label>
                  <div className="relative mt-1">
                    <FontAwesomeIcon icon={faCube} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="number" id="volumen_m3" name="volumen_m3"
                      value={formState.volumen_m3} onChange={handleFormChange} required
                      placeholder="Ej: 15.2"
                      step="0.01" min="0"
                      className={`${inputStd} pl-10`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Detalles */}
              <div>
                <label htmlFor="detalles_carga" className="block text-sm font-medium text-gray-700">Detalles Adicionales (Opcional)</label>
                <div className="relative mt-1">
                  <FontAwesomeIcon icon={faPencilAlt} className="absolute left-3 top-3.5 text-gray-400" />
                  <textarea
                    id="detalles_carga" name="detalles_carga"
                    value={formState.detalles_carga} onChange={handleFormChange}
                    rows="2"
                    placeholder="Ej: Carga frágil, apilable, etc."
                    className={`${inputStd} pl-10`}
                  ></textarea>
                </div>
              </div>

              <button
                type="submit" disabled={formLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2 transition duration-200"
              >
                {formLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faPaperPlane} />}
                {formLoading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
              
              {formError && (
                <p className="text-sm text-red-600 font-medium text-center">{formError}</p>
              )}
            </form>
          </div>
        </div>

        {/* Columna 2: Historial de Solicitudes (Sin cambios) */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-900 mb-5 flex items-center gap-3">
            <FontAwesomeIcon icon={faListAlt} className="text-gray-500" />
            Historial de Solicitudes
          </h2>
          
          <div className="space-y-6">
            {solicitudes.length === 0 ? (
              <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                <p className="text-gray-500">No tiene solicitudes pendientes.</p>
                <p className="text-gray-500">Use el formulario para crear su primera solicitud.</p>
              </div>
            ) : (
              solicitudes.map(sol => (
                <SolicitudCard key={sol.id} solicitud={sol} />
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

// --- Componente de Tarjeta de Solicitud (Añadido peso y volumen) ---

function SolicitudCard({ solicitud }) {
  
  const getStatusVisuals = (estado) => {
    switch (estado) {
      case 'SOLICITADO': return { icon: faHourglassStart, text: 'Solicitado', clase: 'bg-yellow-100 text-yellow-800' };
      case 'COTIZADO': return { icon: faDollarSign, text: 'Cotizado', clase: 'bg-blue-100 text-blue-800' };
      case 'CONFIRMADO': return { icon: faCheck, text: 'Confirmado', clase: 'bg-green-100 text-green-800' };
      case 'EN_RUTA': return { icon: faTruckFast, text: 'En Ruta', clase: 'bg-indigo-100 text-indigo-800' };
      case 'COMPLETADO': return { icon: faCheck, text: 'Completado', clase: 'bg-gray-100 text-gray-700' };
      case 'CANCELADO': return { icon: faTimes, text: 'Cancelado', clase: 'bg-red-100 text-red-800' };
      default: return { icon: faSpinner, text: estado, clase: 'bg-gray-100 text-gray-700' };
    }
  };
  
  const status = getStatusVisuals(solicitud.estado);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className={`flex justify-between items-center p-4 border-b ${status.clase.replace('text', 'border')} ${status.clase.replace('text', 'bg').replace('100', '50')}`}>
        <span className="font-bold text-lg text-gray-800">
          Solicitud #{solicitud.id}
        </span>
        <span className={`font-semibold py-1 px-3 rounded-full text-sm flex items-center gap-2 ${status.clase}`}>
          <FontAwesomeIcon icon={status.icon} />
          {status.text}
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Detalles del Viaje */}
        <div className="md:col-span-2 space-y-3">
          {/* (Origen y Destino) */}
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faWarehouse} className="text-gray-500 w-5" />
            <div>
              <p className="text-sm text-gray-500">Origen</p>
              <p className="font-semibold text-gray-800">{solicitud.sucursal_origen_nombre}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faMapPin} className="text-gray-500 w-5" />
            <div>
              <p className="text-sm text-gray-500">Destino</p>
              <p className="font-semibold text-gray-800">{solicitud.destino}</p>
            </div>
          </div>
          
          {/* --- ¡NUEVOS CAMPOS EN LA TARJETA! --- */}
          <div className="flex items-center gap-3 pt-2">
            <FontAwesomeIcon icon={faBox} className="text-gray-500 w-5" />
            <div>
              <p className="text-sm text-gray-500">Carga</p>
              <p className="font-semibold text-gray-800">
                {solicitud.tipo_carga} 
                ({solicitud.peso_kg} kg / {solicitud.volumen_m3} m³)
              </p>
            </div>
          </div>
        </div>

        {/* Precio Cotizado */}
        <div className="md:col-span-1 flex flex-col justify-center items-center md:items-end bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-600">Precio Cotizado</p>
          {solicitud.precio_cotizado ? (
            <p className="text-3xl font-bold text-green-700">
              ${Number(solicitud.precio_cotizado).toLocaleString('es-CL')}
            </p>
          ) : (
            <p className="text-lg font-semibold text-gray-500 italic">
              Pendiente
            </p>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-3 border-t text-sm text-gray-600 flex justify-between">
        <span>Solicitado: {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CL')}</span>
        <span>Transporte: {new Date(solicitud.fecha_deseada).toLocaleDateString('es-CL')}</span>
      </div>
    </div>
  );
}