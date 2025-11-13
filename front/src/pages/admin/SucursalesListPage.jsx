// src/pages/admin/SucursalesListPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate'; // Hook para la API
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWarehouse,  // Icono para Sucursal
  faTruck,        // Icono para Camiones
  faUsers,        // Icono para Empleados
  faBoxOpen,      // Icono para Pedidos
  faArrowRight,   // Icono para el botón
  faSpinner         // Icono de Carga
} from '@fortawesome/free-solid-svg-icons';

export default function SucursalesListPage() {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchSucursales = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get('/api/data/sucursales/', {
          signal: controller.signal
        });

        // --- NOTA IMPORTANTE ---
        // Tu API actual solo entrega: id, nombre, direccion, ciudad.
        // Para un dashboard real, la API debería incluir los conteos (camiones, empleados, etc.)
        // para evitar múltiples peticiones.
        //
        // He simulado estos datos aquí basándome en el PDF para que el template se vea genial.
        // ¡Usé los números reales de camiones del PDF!
        const dataConStats = response.data.map(suc => {
          let stats = { camiones: 0, empleados: 0, pedidos: 0 };
          
          if (suc.nombre === 'Osorno') {
            stats = { camiones: 9, empleados: 15, pedidos: 18 }; // 3 GC + 6 MC
          } else if (suc.nombre === 'Santiago') {
            stats = { camiones: 13, empleados: 25, pedidos: 27 }; // 5 GC + 8 MC
          } else if (suc.nombre === 'Coquimbo') {
            stats = { camiones: 7, empleados: 10, pedidos: 5 }; // 3 GC + 4 MC
          }
          return { ...suc, ...stats };
        });

        if (isMounted) {
          setSucursales(dataConStats);
          setError(null);
        }
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error("Error fetching sucursales:", err);
          setError("No se pudieron cargar los centros de operación.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSucursales();

    // Función de limpieza de useEffect
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [axiosPrivate]);

  // --- Estado de Carga ---
  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <FontAwesomeIcon icon={faSpinner} className="text-blue-600 text-4xl animate-spin" />
        <span className="ml-4 text-2xl text-gray-700">Cargando Operaciones...</span>
      </div>
    );
  }

  // --- Estado de Error ---
  if (error) {
    return (
      <div className="text-center p-16 bg-red-50 text-red-700 font-semibold rounded-lg">
        {error}
      </div>
    );
  }

  // --- Contenido Principal ---
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Panel de Centros de Operación
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {sucursales.map((sucursal) => (
          // Usamos 'group' de Tailwind para animar el botón al hacer hover en la card
          <div 
            key={sucursal.id} 
            className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group border border-gray-200"
          >
            {/* 1. Cabecera de la Card */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-3">
                <FontAwesomeIcon icon={faWarehouse} className="text-blue-500" />
                <span>{sucursal.nombre}</span>
              </h2>
              <p className="text-gray-600 mt-1">{sucursal.ciudad}</p>
              <p className="text-sm text-gray-500">{sucursal.direccion}</p>
            </div>
            
            {/* 2. Cuerpo de la Card - Estadísticas */}
            <div className="p-6 flex-grow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Recursos en Base</h3>
              <div className="space-y-4">
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FontAwesomeIcon icon={faTruck} className="text-gray-400 w-5" />
                    Flota de Camiones
                  </span>
                  <span className="font-bold text-gray-800 text-xl bg-gray-100 px-3 py-1 rounded">
                    {sucursal.camiones}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} className="text-gray-400 w-5" />
                    Empleados Asignados
                  </span>
                  <span className="font-bold text-gray-800 text-xl bg-gray-100 px-3 py-1 rounded">
                    {sucursal.empleados}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBoxOpen} className="text-gray-400 w-5" />
                    Solicitudes (Origen)
                  </span>
                  <span className="font-bold text-gray-800 text-xl bg-gray-100 px-3 py-1 rounded">
                    {sucursal.pedidos}
                  </span>
                </div>
                
              </div>
            </div>

            {/* 3. Footer de la Card - Botón/Link */}
            <Link
              to={`/admin/sucursales/${sucursal.id}`}
              className="block bg-blue-600 text-white font-semibold text-center p-4 hover:bg-blue-700 transition duration-300 mt-4"
            >
              <span className="flex items-center justify-center gap-2">
                Gestionar Sucursal
                {/* Este ícono se moverá al hacer hover en la 'group' (la card) */}
                <FontAwesomeIcon 
                  icon={faArrowRight} 
                  className="transition-transform group-hover:translate-x-1" 
                />
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}