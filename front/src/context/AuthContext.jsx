// src/context/AuthContext.jsx

import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Importamos jwt-decode
import { useNavigate } from 'react-router-dom';

// 1. Definir la URL de la API (usa variable de entorno Vite: VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 2. Crear el Contexto
const AuthContext = createContext();

// 3. Función 'hook' para usar el contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};

// 4. Crear el Proveedor (Provider) del Contexto
export const AuthProvider = ({ children }) => {
  // Guardamos los tokens y el usuario en el estado
  // Intentamos leer del localStorage para persistir la sesión
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens'))
      : null
  );

  const [user, setUser] = useState(() =>
    localStorage.getItem('authTokens')
      ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access)
      : null
  );

  const [loading, setLoading] = useState(true); // Para manejo de carga inicial
  const navigate = useNavigate();

  // Función de Login
  const loginUser = async (username, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/token/`,
        {
          username: username,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Si la petición es exitosa (HTTP 200)
      const data = response.data;
      setAuthTokens(data);
      setUser(jwtDecode(data.access)); // Decodificamos el token para info del user

      // Guardamos los tokens en localStorage
      localStorage.setItem('authTokens', JSON.stringify(data));

      navigate('/'); // Redirigimos al Home
      return null; // Sin error
    } catch (err) {
      console.error('Error de inicio de sesión:', err);
      if (err.response && err.response.status === 401) {
        return 'Usuario o contraseña incorrectos.';
      }
      return 'Ocurrió un error en el servidor.';
    }
  };

  // Función de Logout
  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    navigate('/login'); // Opcional: redirigir a login al cerrar sesión
  };

  // 5. El "valor" que proveerá el contexto
  const contextData = {
    user: user,
    authTokens: authTokens,
    loginUser: loginUser,
    logoutUser: logoutUser,
  };

  // Manejo de la carga inicial
  useEffect(() => {
    if (authTokens) {
      setUser(jwtDecode(authTokens.access));
    }
    setLoading(false);
  }, [authTokens]);

  // 'children' son todos los componentes que envolvemos
  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children} 
    </AuthContext.Provider>
  );
};