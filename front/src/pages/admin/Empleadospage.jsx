// src/pages/admin/Empleadospage.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import EmpleadoFormModal from '../../components/EmpleadoFormModal.jsx'; // Asumo que este es el modal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';

// Opciones de Cargo (basadas en models.py)
const CARGO_CHOICES = [
  { value: 'ADM', label: 'Administrador' },
  { value: 'CON', label: 'Conductor' },
  { value: 'MEC', label: 'Mecánico' },
  { value: 'AUX', label: 'Auxiliar' },
  { value: 'GER', label: 'Gerente' },
];

export default function EmpleadosPage() {
  const { id: sucursalId } = useParams();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);

  // --- ¡NUEVO! Estados para los Filtros ---
  const [filterCargo, setFilterCargo] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filteredEmpleados, setFilteredEmpleados] = useState([]);

  // 1. Cargar todos los empleados
  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(`/api/admin/empleados/?sucursal_id=${sucursalId}`);
      setEmpleados(response.data);
      setFilteredEmpleados(response.data);
    } catch (err) {
      setError('No se pudieron cargar los empleados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, [sucursalId, axiosPrivate]);

  // 2. ¡NUEVO! useEffect para aplicar filtros
  useEffect(() => {
    let tempEmpleados = [...empleados];

    if (filterCargo) {
      tempEmpleados = tempEmpleados.filter(e => e.cargo === filterCargo);
    }

    if (filterSearch) {
      const search = filterSearch.toLowerCase();
      tempEmpleados = tempEmpleados.filter(e => 
        e.user.username.toLowerCase().includes(search) ||
        e.user.first_name.toLowerCase().includes(search) ||
        e.user.last_name.toLowerCase().includes(search)
      );
    }

    setFilteredEmpleados(tempEmpleados);
  }, [filterCargo, filterSearch, empleados]);

  // Handlers Modal
  const handleOpenModal = (empleado = null) => {
    setSelectedEmpleado(empleado);
    setIsModalOpen(true);
  };
  
  // (Resto de tus handlers... handleCloseModal, handleSave, handleDelete)
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSave = () => {
    fetchEmpleados();
    handleCloseModal();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Personal</h1>

      {/* --- ¡NUEVO! Barra de Filtros --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-lg shadow">
        {/* Filtro por Búsqueda (Nombre/Usuario) */}
        <div className="relative">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">Buscar por Nombre o Usuario</label>
          <input
            type="text"
            id="search"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Ej: Pedro Rojas"
            className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-9 text-gray-400" />
        </div>

        {/* Filtro por Cargo */}
        <div>
          <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">Filtrar por Cargo</label>
          <select
            id="cargo"
            value={filterCargo}
            onChange={(e) => setFilterCargo(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm"
          >
            <option value="">Todos los Cargos</option>
            {CARGO_CHOICES.map(cargo => (
              <option key={cargo.value} value={cargo.value}>{cargo.label}</option>
            ))}
          </select>
        </div>

        {/* Botón de Añadir */}
        <div className="md:mt-6">
          <button
            onClick={() => handleOpenModal(null)}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Añadir Empleado
          </button>
        </div>
      </div>

      {/* --- Contenedor de la Tabla/Lista --- */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading && <p className="p-4">Cargando...</p>}
        {error && <p className="p-4 text-red-600">{error}</p>}
        
        {!loading && !error && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Mapeamos sobre filteredEmpleados */}
              {filteredEmpleados.map((emp) => (
                <tr key={emp.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {emp.user.first_name || ''} {emp.user.last_name || ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{emp.user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{emp.cargo_display}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenModal(emp)}
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
        {!loading && filteredEmpleados.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-300 mb-3" />
            <p>No se encontraron empleados que coincidan con los filtros.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <EmpleadoFormModal
          empleado={selectedEmpleado}
          sucursalId={sucursalId}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}