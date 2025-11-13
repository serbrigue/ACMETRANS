// src/pages/admin/SucursalDashboardPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, faUsers, faRoute, faHourglassStart,
  faChartPie, faChartBar, faSpinner, faListAlt
} from '@fortawesome/free-solid-svg-icons';

// Importamos componentes de Recharts
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

// Colores (sin cambios)
const PIE_COLORS = {
  'SOLICITADO': '#EF4444', 'COTIZADO': '#EAB308', 'CONFIRMADO': '#22C55E',
  'EN_RUTA': '#3B82F6', 'COMPLETADO': '#6B7280', 'CANCELADO': '#111827',
};
const BAR_COLORS = {
  'Disponible': '#22C55E', 'En Ruta': '#3B82F6', 'En Mantención': '#EAB308', 'En Reparación': '#EF4444',
};

// Mapeo para traducir clicks del gráfico de camiones (sin cambios)
const camionEstadoMap = {
  'Disponible': 'DIS',
  'En Ruta': 'RUT',
  'En Mantención': 'MAN',
  'En Reparación': 'REP',
};

export default function SucursalDashboardPage() {
  const { id: sucursalId } = useParams(); 
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  
  const navigate = useNavigate();

  // useEffect (sin cambios)
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(
          `/api/admin/sucursales/${sucursalId}/dashboard/`, 
          { signal: controller.signal }
        );
        if (isMounted) {
          setDashboardData(response.data);
          setError(null);
        }
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error("Error fetching dashboard data:", err);
          setError("No se pudo cargar la información del dashboard.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchDashboardData();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [sucursalId, axiosPrivate]);

  // Handler para clicks en el gráfico de Torta (Pedidos) (Sin cambios)
  const handlePieClick = (data) => {
    if (data && data.name) {
      const estadoKey = data.name.toUpperCase().replace(' ', '_');
      navigate(`pedidos?estado=${estadoKey}`); // Ruta relativa
    }
  };

  // --- ¡HANDLER CORREGIDO! ---
  // Ahora recibe el dataKey ("Disponible", "En Ruta", etc.) directamente
  const handleBarClick = (dataKey) => {
    if (dataKey) {
      const estadoKey = camionEstadoMap[dataKey]; // Traduce a "DIS", "RUT", etc.
      if (estadoKey) {
        navigate(`camiones?estado=${estadoKey}`); // Ruta relativa
      }
    }
  };

  // --- ESTADOS DE CARGA Y ERROR (Sin cambios) ---
  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <FontAwesomeIcon icon={faSpinner} className="text-blue-600 text-4xl animate-spin" />
        <span className="ml-4 text-2xl text-gray-700">Cargando Dashboard...</span>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="text-center p-16 bg-red-50 text-red-700 font-semibold rounded-lg">
        {error || "No se pudieron cargar los datos."}
      </div>
    );
  }

  const { kpis, grafico_pedidos, grafico_camiones, sucursal_nombre } = dashboardData;

  // --- RENDERIZADO DEL DASHBOARD ---
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">
        Dashboard: <span className="text-blue-700">{sucursal_nombre}</span>
      </h1>

      {/* 2. Fila de Métricas Clave (KPIs) (Sin cambios) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Camiones Disponibles" value={kpis.camiones_disponibles} icon={faTruck} color="blue" linkTo="camiones" />
        <KpiCard title="Conductores Disponibles" value={kpis.conductores_disponibles} icon={faUsers} color="green" linkTo="empleados" />
        <KpiCard title="Solicitudes en Ruta" value={kpis.pedidos_en_ruta} icon={faRoute} color="yellow" linkTo="pedidos" />
        <KpiCard title="Nuevas Solicitudes" value={kpis.pedidos_nuevos} icon={faHourglassStart} color="red" linkTo="pedidos" />
      </div>

      {/* 3. Fila de Gráficos (Clicables) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Estado de Pedidos (Torta) (Sin cambios) */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
            <FontAwesomeIcon icon={faChartPie} className="text-gray-400" />
            Estado de Solicitudes (Activos)
          </h3>
          <div className="h-80 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip 
                  formatter={(value, name) => [value, name]} 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', borderColor: '#e5e7eb' }}
                />
                <Legend />
                <Pie
                  data={grafico_pedidos} 
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  onClick={handlePieClick} 
                >
                  {grafico_pedidos.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PIE_COLORS[entry.name.toUpperCase().replace(' ', '_')] || '#8884d8'} 
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Uso de Flota (Barras) (¡onClick CORREGIDO!) */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
            <FontAwesomeIcon icon={faChartBar} className="text-gray-400" />
            Uso de la Flota (Total: {kpis.total_camiones})
          </h3>
          <div className="h-80 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={grafico_camiones} 
                layout="vertical" 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', borderColor: '#e5e7eb' }}
                />
                <Legend />
                {/* --- ¡EVENTOS onClick CORREGIDOS! --- */}
                <Bar dataKey="Disponible" stackId="a" fill={BAR_COLORS['Disponible']} onClick={() => handleBarClick('Disponible')} /> 
                <Bar dataKey="En Ruta" stackId="a" fill={BAR_COLORS['En Ruta']} onClick={() => handleBarClick('En Ruta')} />
                <Bar dataKey="En Mantención" stackId="a" fill={BAR_COLORS['En Mantención']} onClick={() => handleBarClick('En Mantención')} />
                <Bar dataKey="En Reparación" stackId="a" fill={BAR_COLORS['En Reparación']} onClick={() => handleBarClick('En Reparación')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* 4. Fila de Actividad Reciente (Placeholder) (Sin cambios) */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
          <FontAwesomeIcon icon={faListAlt} className="text-gray-400" />
          Solicitudes Recientes
        </h3>
        <p className="text-gray-500">Aquí se mostrarían las últimas 5 solicitudes...</p>
      </div>

    </div>
  );
}

// --- Componente de Tarjeta de Métrica (KPI) (Sin cambios) ---
function KpiCard({ title, value, icon, color, linkTo }) {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
  };
  const theme = colors[color] || colors.blue;

  return (
    <div 
      className={`bg-white shadow-lg rounded-lg p-5 border-l-4 ${theme.border} flex justify-between items-center group`}
    >
      <div>
        <p className={`text-sm font-medium ${theme.text} uppercase`}>{title}</p>
        <p className="text-4xl font-bold text-gray-800">{value ?? '...'}</p>
        <Link 
          to={linkTo} 
          className="text-sm text-gray-500 hover:text-blue-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Ver detalle &rarr;
        </Link>
      </div>
      <div 
        className={`w-16 h-16 rounded-full ${theme.bg} flex items-center justify-center`}
      >
        <FontAwesomeIcon icon={icon} className={`text-3xl ${theme.text}`} />
      </div>
    </div>
  );
}