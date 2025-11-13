// src/pages/home.jsx
import { Link } from 'react-router-dom';

// --- ¡NUEVO! Importamos los iconos ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAward, faTruck, faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  return (
    <div className="space-y-12">
      
      {/* Sección Héroe con Imagen de Fondo (Esta se queda igual) */}
      <div 
        className="relative bg-blue-800 text-white p-8 md:p-16 rounded-lg shadow-xl flex items-center justify-center min-h-[400px] overflow-hidden"
      >
        {/* Imagen de fondo (reemplazar con tu propia imagen) */}
        <img 
          src="hero_camion.jpg" 
          alt="Camiones de ACME TRANS en carretera al atardecer" 
          className="absolute inset-0 w-full h-full object-cover object-bottom opacity-60" 
        />
        <div className="relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Su socio estratégico en transporte de carga
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Conectamos el sur, centro y norte de Chile, especializándonos en los sectores 
            agrícola, multitiendas y alimentos.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/registro"
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition duration-300 shadow-lg"
            >
              Solicitar Cotización Ahora
            </Link>
            <Link
              to="/informacion"
              className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg text-lg hover:bg-gray-300 transition duration-300 shadow-lg"
            >
              Conocer Más
            </Link>
          </div>
        </div>
      </div>

      {/* Sección "Nuestros Valores" (¡CON ICONOS!) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-gray-50 rounded-lg shadow-inner">
        
        {/* Card 1: Experiencia */}
        <div className="flex flex-col items-center text-center bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
          {/* --- Icono Font Awesome --- */}
          <FontAwesomeIcon 
            icon={faAward} 
            className="text-blue-600 text-5xl mb-5" 
          />
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Experiencia Comprobada</h3>
          <p className="text-gray-700 leading-relaxed">
            Fundada por el Sr. Marcos Rojas, con más de 10 años de experiencia directa 
            en el negocio del transporte de camiones.
          </p>
        </div>
        
        {/* Card 2: Flota Versátil */}
        <div className="flex flex-col items-center text-center bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
          {/* --- Icono Font Awesome --- */}
          <FontAwesomeIcon 
            icon={faTruck} 
            className="text-blue-600 text-5xl mb-5" 
          />
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Flota Versátil</h3>
          <p className="text-gray-700 leading-relaxed">
            Contamos con 29 camiones propios, incluyendo 11 de gran capacidad (GC) 
            y 18 de mediana capacidad (MC), listos para su carga.
          </p>
        </div>

        {/* Card 3: Cobertura Nacional */}
        <div className="flex flex-col items-center text-center bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
          {/* --- Icono Font Awesome --- */}
          <FontAwesomeIcon 
            icon={faMapMarkedAlt} 
            className="text-blue-600 text-5xl mb-5" 
          />
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Cobertura Nacional</h3>
          <p className="text-gray-700 leading-relaxed">
            Con 3 centros de operación estratégicos en Osorno, Santiago y Coquimbo 
            para atender sus necesidades logísticas.
          </p>
        </div>
      </div>
    </div>
  );
}