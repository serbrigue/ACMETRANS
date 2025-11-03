import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importamos para redirigir

export default function Registro() {
  // Estado para guardar los datos del formulario
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  // Estado para manejar mensajes de error
  const [error, setError] = useState(null);
  
  // Hook para redirigir al usuario (por ejemplo, al login) después del registro
  const navigate = useNavigate();

  // Manejador para actualizar el estado cuando el usuario escribe
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Manejador para enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setError(null); // Resetea errores previos

    try {
      // Hacemos la petición POST a la API de Django
      // La URL completa del endpoint que creamos en el backend
      const response = await axios.post('http://localhost:8000/api/register/', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Si todo sale bien (HTTP 201 Created)
      console.log('Usuario registrado:', response.data);
      
      // Opcional: Redirigir al usuario a la página de login
      // (Crearemos /login en el siguiente paso)
      // navigate('/login'); 
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');

    } catch (err) {
      // Si la API devuelve un error
      console.error('Error en el registro:', err.response.data);
      
      // Intentamos mostrar un mensaje de error más claro
      if (err.response.data.username) {
        setError(`Error: ${err.response.data.username[0]}`);
      } else if (err.response.data.password) {
        setError(`Error: ${err.response.data.password[0]}`);
      } else {
        setError('Ocurrió un error. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Crear Cuenta
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
            name="username" // Debe coincidir con el estado y la API
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Input para Email */}
        <div className="mb-4">
          <label 
            htmlFor="email" 
            className="block text-gray-700 font-medium mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email" // Debe coincidir con el estado y la API
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label 
            htmlFor="nombre_empresa" 
            className="block text-gray-700 font-medium mb-2"
          >
            Nombre de la Empresa 
            {/* 1. Añade un texto de 'Opcional' */}
            <span className="text-gray-500 font-normal ml-1">(Opcional)</span>
          </label>
          <input
            type="text"
            id="nombre_empresa"
            name="nombre_empresa"
            value={formData.nombre_empresa}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            // 2. QUITA EL 'required'
            // required 
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
            name="password" // Debe coincidir con el estado y la API
            value={formData.password}
            onChange={handleChange}
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
          Registrarse
        </button>
      </form>
    </div>
  );
}