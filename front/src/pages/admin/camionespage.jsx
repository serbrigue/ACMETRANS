// src/pages/admin/camionespage.jsx

import { useState, useEffect } from 'react';
// --- ¡NUEVO! Importamos useSearchParams ---
import { useParams, useSearchParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import CamionFormModal from '../../components/CamionFormModal.jsx'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTruck, faSearch, faSpinner, faTrafficLight } from '@fortawesome/free-solid-svg-icons';

// Opciones de Estado (de models.py)
const ESTADO_CAMION_CHOICES = [
  { value: 'DIS', label: 'Disponible' },
  { value: 'RUT', label: 'En Ruta' },
  { value: 'MAN', label: 'En Mantención' },
  { value: 'REP', label: 'En Reparación' },
];

export default function CamionesPage() {
  const { id: sucursalId } = useParams();
  const [camiones, setCamiones] = useState([]); // Lista original de la API
  const [filteredCamiones, setFilteredCamiones] = useState([]); // Lista para mostrar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCamion, setSelectedCamion] = useState(null);

  // --- ¡NUEVO! Leer filtros de la URL ---
  const [searchParams] = useSearchParams();
  const estadoFromUrl = searchParams.get('estado'); // Ej: "DIS", "RUT", o null

  // --- ¡ACTUALIZADO! Estados de filtro ---
  const [filterCapacidad, setFilterCapacidad] = useState(''); 
  // El estado inicial del filtro usa el valor de la URL
  const [filterEstado, setFilterEstado] = useState(estadoFromUrl || ''); 
  const [filterSearch, setFilterSearch] = useState(''); 

  // 1. Cargar todos los camiones
  const fetchCamiones = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(`/api/admin/camiones/?sucursal_id=${sucursalId}`);
      setCamiones(response.data);
      setError(null);
    } catch (err) {
      console.error("Error cargando camiones:", err);
      setError('No se pudieron cargar los camiones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamiones();
  }, [sucursalId, axiosPrivate]); 

  // 2. useEffect para aplicar filtros
  useEffect(() => {
    let tempCamiones = [...camiones];

    if (filterCapacidad) {
      tempCamiones = tempCamiones.filter(c => c.capacidad === filterCapacidad);
    }
    
    if (filterEstado) {
      tempCamiones = tempCamiones.filter(c => c.estado === filterEstado);
    }

    if (filterSearch) {
      tempCamiones = tempCamiones.filter(c => 
        c.matricula.toLowerCase().includes(filterSearch.toLowerCase())
      );
    }

    setFilteredCamiones(tempCamiones);
  }, [filterCapacidad, filterEstado, filterSearch, camiones]);

  // Handlers Modal (sin cambios)
  const handleOpenModal = (camion = null) => {
    setSelectedCamion(camion);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCamion(null);
  };

  const handleSave = () => {
    fetchCamiones(); 
    handleCloseModal();
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Flota</h1>

      {/* --- Barra de Filtros --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-white rounded-lg shadow">
        
        <div className="relative md:col-span-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">Buscar por Matrícula</label>
          <input
            type="text" id="search"
            value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Ej: ABCD-12"
            className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-9 text-gray-400" />
        </div>

        <div className="md:col-span-1">
          <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700">Capacidad</label>
          <select
            id="capacidad"
            value={filterCapacidad} onChange={(e) => setFilterCapacidad(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm"
          >
            <option value="">Todas</option>
            <option value="MC">Mediana Capacidad</option>
            <option value="GC">Gran Capacidad</option>
          </select>
        </div>
        
        <div className="md:col-span-1">
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            id="estado"
            value={filterEstado} // <-- ¡Este 'value' se inicializa desde la URL!
            onChange={(e) => setFilterEstado(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm"
          >
            <option value="">Todos</option>
            {ESTADO_CAMION_CHOICES.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1 md:mt-6">
          <button
            onClick={() => handleOpenModal(null)}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Añadir Camión
          </button>
        </div>
      </div>

      {/* --- Contenedor de la Tabla --- */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading && (
          <div className="p-6 text-center text-gray-500">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin" />
            <p className="mt-3">Cargando flota...</p>
          </div>
        )}
        {error && <p className="p-4 text-red-600 font-semibold">{error}</p>}
        
        {!loading && !error && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matrícula</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conductor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCamiones.map((camion) => (
                <tr key={camion.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{camion.matricula}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {camion.capacidad_display}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {camion.estado_display}
                  </td>
                  <td className="px-6 py-4 whitespace-nowsemrap text-gray-600">
                    {camion.conductor_nombre || <span className="text-gray-400 italic">No asignado</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenModal(camion)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && !error && filteredCamiones.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <FontAwesomeIcon icon={faTruck} className="text-4xl text-gray-300 mb-3" />
            <p>No se encontraron camiones que coincidan con los filtros.</p>
          </div>
        )}
      </div>

      {/* --- Modal --- */}
      {isModalOpen && (
        <CamionFormModal
          camion={selectedCamion}
          sucursalId={sucursalId}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}