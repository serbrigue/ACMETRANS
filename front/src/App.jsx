// src/App.jsx

import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 

// Páginas Públicas
import Home from './pages/Home';
import Informacion from './pages/Informacion';
import Contacto from './pages/Contacto';
// Páginas de Autenticación
import Registro from './pages/Registro'; 
import Login from './pages/Login'; 
// Páginas de Cliente
import MisPedidosPage from './pages/MisPedidos.jsx';

// --- PÁGINAS DE ADMIN (NUEVA ESTRUCTURA) ---
import SucursalLayout from './pages/admin/SucursalLayout.jsx'; // El nuevo Layout
import SucursalesListPage from './pages/admin/SucursalesListPage.jsx';
import SucursalDashboardPage from './pages/admin/SucursalDashboardPage.jsx'; // El renombrado
import CamionesPage from './pages/admin/CamionesPage'; 
import EmpleadosPage from './pages/admin/EmpleadosPage.jsx';
import PedidosPage from './pages/admin/PedidosPage.jsx'; 

// Componentes de UI y Rutas
import AdminNavbar from './components/AdminNavbar';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, logoutUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* --- NAVEGACIÓN PRINCIPAL --- */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          
          <Link to="/" className="text-2xl font-bold text-blue-900">
            ACME TRANS (AT)
          </Link>

          {/* Menú de Links (Lado izquierdo) */}
          <div className="flex gap-6 items-center">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Home
            </Link>
            <Link to="/informacion" className="text-gray-700 hover:text-blue-600 font-medium">
              Información
            </Link>
            <Link to="/contacto" className="text-gray-700 hover:text-blue-600 font-medium">
              Contacto
            </Link>
            
            {user && !user.is_superuser && (
              <Link to="/mis-pedidos" className="text-blue-600 hover:text-blue-800 font-bold">
                Mis Pedidos
              </Link>
            )}
          </div>
          
          {/* Lógica de Navegación (Autenticación) */}
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <span className="text-gray-700">¡Hola, {user.username}!</span>
                <button
                  onClick={logoutUser}
                  className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/registro" 
                  className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* RENDERIZADO CONDICIONAL DE LA NAVBAR DE ADMIN (Simplificada) */}
      {user && user.is_superuser && <AdminNavbar />}

      {/* --- ÁREA DE CONTENIDO DE LA RUTA --- */}
      <div className="container mx-auto p-4">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/informacion" element={<Informacion />} />
          <Route path="/contacto" element={<Contacto />} />
          
          {/* Rutas de Autenticación */}
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<Login />} />
          
          {/* RUTA PROTEGIDA PARA CLIENTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          {/* --- RUTAS DE ADMIN PROTEGIDAS (NUEVA ESTRUCTURA) --- */}
          <Route element={<AdminRoute />}>
            {/* Ruta principal de Admin (Lista de sucursales) */}
            <Route path="/admin/sucursales" element={<SucursalesListPage />} />

            {/* Rutas anidadas para UNA sucursal */}
            <Route path="/admin/sucursales/:id" element={<SucursalLayout />}>
              {/* La ruta "index" (./) muestra el dashboard */}
              <Route index element={<SucursalDashboardPage />} />
              {/* Las rutas anidadas (./camiones) muestran las páginas de gestión */}
              <Route path="camiones" element={<CamionesPage />} />
              <Route path="empleados" element={<EmpleadosPage />} />
              <Route path="pedidos" element={<PedidosPage />} />
            </Route>
            
            {/* Opcional: Rutas "legacy" (aún funcionan pero no están en la nav) */}
            <Route path="/admin/camiones" element={<CamionesPage />} />
            <Route path="/admin/empleados" element={<EmpleadosPage />} />
            <Route path="/admin/pedidos" element={<PedidosPage />} />
          </Route>
          
        </Routes>
      </div>

    </div>
  );
}

export default App;