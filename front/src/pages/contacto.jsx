// src/pages/contacto.jsx
import { Link } from 'react-router-dom';

export default function Contacto() {
  return (
    <div className="space-y-12">
      
      <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
        Póngase en Contacto con ACME TRANS
      </h1>

      {/* Sección CTA Digital (La más importante) */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-8 rounded-lg shadow-lg max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-blue-900 mb-4">
          ¿Listo para Cotizar su Carga?
        </h2>
        <p className="text-xl text-blue-800 mb-8">
          La forma más rápida y eficiente de gestionar su solicitud y obtener una cotización 
          personalizada es a través de nuestro nuevo Portal de Clientes. 
          ¡Regístrese o Inicie Sesión ahora!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/registro"
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 text-lg shadow-md"
          >
            Registrarse Aquí
          </Link>
          <Link
            to="/login"
            className="bg-white text-blue-600 border border-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition duration-300 text-lg shadow-md"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>

      {/* Sección Nuestros Centros de Operación */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
          Nuestros Centros de Operación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sede Osorno */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition duration-300">
            <img 
              src="sede_osorno.jpg"
              alt="Vista de la sede de Osorno de ACME TRANS" 
              className="w-full h-48 object-cover rounded-md mb-4" 
            />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Sede Osorno</h3>
            <p className="text-gray-600 mb-3">Región Sur de Chile</p>
            <p className="text-gray-700 font-medium">
              Flota: 3 GC y 6 MC listas para operar.
            </p>
          </div>
          
          {/* Sede Santiago */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition duration-300">
            <img 
              src="sede_santiago.jpg"
              alt="Vista de la sede de Santiago de ACME TRANS" 
              className="w-full h-48 object-cover rounded-md mb-4" 
            />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Sede Santiago</h3>
            <p className="text-gray-600 mb-3">Centro Neurálgico de Operaciones</p>
            <p className="text-gray-700 font-medium">
              Flota: 5 GC y 8 MC para una cobertura amplia.
            </p>
          </div>
          
          {/* Sede Coquimbo */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition duration-300">
            <img 
              src="sede_coquimbo.jpg" 
              alt="Vista de la sede de Coquimbo de ACME TRANS" 
              className="w-full h-48 object-cover rounded-md mb-4" 
            />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Sede Coquimbo</h3>
            <p className="text-gray-600 mb-3">Puerta al Norte del País</p>
            <p className="text-gray-700 font-medium">
              Flota: 3 GC y 4 MC para su logística en el norte.
            </p>
          </div>
        </div>
      </div>

      {/* Sección Contacto General */}
      <div className="text-center max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">
          Consultas Generales y Soporte
        </h2>
        <p className="text-lg text-gray-700 mb-6">
          Para otras consultas que no sean solicitudes de cotización o soporte técnico, 
          nuestro equipo está disponible para ayudarle.
        </p>
        <p className="text-xl text-blue-600 font-medium hover:underline inline-block">
          <a href="mailto:consultas@acmetrans.cl">consultas@acmetrans.cl</a>
        </p>
        <p className="text-gray-500 text-sm mt-2">
          (Por favor, use el portal para cotizaciones)
        </p>
      </div>

    </div>
  );
}