// src/pages/admin/PedidosPage.jsx

import { useState, useEffect } from 'react';
// ¡Importamos useSearchParams!
import { useParams, useSearchParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import PedidoAdminModal from '../../components/PedidoAdminModal.jsx'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faFilter, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Opciones de Estado (basadas en models.py)
const ESTADO_CHOICES = [
  'SOLICITADO', 'COTIZADO', 'CONFIRMADO', 'EN_RUTA', 'COMPLETADO', 'CANCELADO'
];

export default function PedidosPage() {
  const { id: sucursalId } = useParams();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState(null);

  // --- ¡NUEVO! Leer filtros de la URL ---
  const [searchParams] = useSearchParams();
  const estadoFromUrl = searchParams.get('estado'); // Ej: "COTIZADO" o null

  // --- ¡ACTUALIZADO! El estado inicial del filtro usa el valor de la URL ---
  const [filterEstado, setFilterEstado] = useState(estadoFromUrl || '');
  const [filterSearch, setFilterSearch] = useState('');
  const [filteredPedidos, setFilteredPedidos] = useState([]);

  // Cargar todos los pedidos
  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(`/api/admin/pedidos/?sucursal_id=${sucursalId}`);
      setPedidos(response.data);
      // setFilteredPedidos(response.data); // No es necesario, el useEffect de filtro se encargará
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [sucursalId, axiosPrivate]);

  // useEffect para aplicar filtros
  useEffect(() => {
    let tempPedidos = [...pedidos];

    if (filterEstado) {
      tempPedidos = tempPedidos.filter(p => p.estado === filterEstado);
    }

    if (filterSearch) {
      const search = filterSearch.toLowerCase();
      tempPedidos = tempPedidos.filter(p => 
        (p.cliente_nombre && p.cliente_nombre.toLowerCase().includes(search)) ||
        (p.destino && p.destino.toLowerCase().includes(search))
      );
    }

    setFilteredPedidos(tempPedidos);
  }, [filterEstado, filterSearch, pedidos]);

  // Handlers Modal
  const handleOpenModal = (pedidoId) => {
    setSelectedPedidoId(pedidoId);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPedidoId(null);
  };
  
  const handleSave = () => {
    fetchPedidos(); // Recargamos la lista
    handleCloseModal();
  };
  
  const formatEstado = (estado) => {
    if (!estado) return '';
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase().replace('_', ' ');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Solicitudes</h1>

      {/* Barra de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-lg shadow">
        {/* Filtro por Búsqueda (Cliente/Destino) */}
        <div className="relative">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">Buscar por Cliente o Destino</label>
          <input
            type="text"
            id="search"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Ej: Empresa XYZ o Calama"
            className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-9 text-gray-400" />
        </div>

        {/* Filtro por Estado */}
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Filtrar por Estado</label>
          <select
            id="estado"
            value={filterEstado} // <-- ¡Este 'value' se inicializa desde la URL!
            onChange={(e) => setFilterEstado(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm"
          >
            <option value="">Todos los Estados</option>
            {ESTADO_CHOICES.map(estado => (
              <option key={estado} value={estado}>{formatEstado(estado)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenedor de la Tabla/Lista */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading && (
          <div className="p-6 text-center text-gray-500">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin" />
            <p className="mt-3">Cargando solicitudes...</p>
          </div>
        )}
        {error && <p className="p-4 text-red-600 font-semibold">{error}</p>}
        
        {!loading && !error && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cotizado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPedidos.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{p.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{p.cliente_nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{p.destino}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{formatEstado(p.estado)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {p.precio_cotizado ? `$${Number(p.precio_cotizado).toLocaleString('es-CL')}` : '---'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenModal(p.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !error && filteredPedidos.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <FontAwesomeIcon icon={faBoxOpen} className="text-4xl text-gray-300 mb-3" />
            <p>No se encontraron solicitudes que coincidan con los filtros.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <PedidoAdminModal
          pedidoId={selectedPedidoId}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}