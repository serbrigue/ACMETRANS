// src/pages/Login.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // 1. Importa el hook de Auth

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // Estado para errores

  // 2. Obtiene la función 'loginUser' del contexto
  const { loginUser } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpia errores previos

    // 3. Llama a la función del contexto
    const loginError = await loginUser(username, password);
    
    if (loginError) {
      setError(loginError); // Si loginUser devuelve un error, lo mostramos
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Iniciar Sesión
        </h2>
        
        {/* Input para Username */}
        <div className="mb-4">
          <label 
            htmlFor="username" 
            className="block text-gray-700 font-medium mb-2"
          >
            Nombre de Usuario
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Input para Contraseña */}
        <div className="mb-6">
          <label 
            htmlFor="password" 
            className="block text-gray-700 font-medium mb-2"
          >
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Muestra de Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Botón de Submit */}
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}