// src/hooks/useAxiosPrivate.js

import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Read API base URL from Vite env variable (must start with VITE_)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Creamos la instancia UNA SOLA VEZ, fuera del hook.
// Esto la hace estable.
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

const useAxiosPrivate = () => {
  const { authTokens } = useAuth(); // (Nota: Aún no implementamos el refresh, pero lo dejamos listo)

  useEffect(() => {
    // Adjuntamos el interceptor usando el token actual
    const requestIntercept = axiosInstance.interceptors.request.use(
      (config) => {
        if (authTokens) {
          config.headers['Authorization'] = `Bearer ${authTokens.access}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Función de limpieza:
    // Se ejecuta cuando el hook se desmonta o los tokens cambian
    return () => {
      // Quitamos el interceptor para evitar duplicados
      axiosInstance.interceptors.request.eject(requestIntercept);
    };

  }, [authTokens]); // El interceptor se re-adjunta solo si los tokens cambian

  // Devolvemos la instancia ESTABLE
  return axiosInstance;
};

export default useAxiosPrivate;