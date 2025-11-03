// src/pages/Informacion.jsx

export default function Informacion() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Nuestra Empresa
      </h1>
      <p className="text-lg text-gray-700 mb-2">
        <strong>ACME TRANS (AT)</strong> es una PYME de carácter familiar fundada 
        y dirigida por el Sr. Marcos Rojas, con más de 10 años de experiencia en el rubro.
      </p>
      <p className="text-lg text-gray-700 mb-4">
        Contamos con una flota propia de <strong>29 camiones</strong> (11 de gran capacidad y 18 
        de mediana capacidad) y 3 centros de operación estratégicamente ubicados 
        en Osorno, Santiago y Coquimbo.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">Equipo Directivo</h2>
      <ul className="list-disc list-inside text-gray-700">
        <li><strong>Sr. Marcos Rojas:</strong> Dirección General.</li>
        <li><strong>Pedro Rojas:</strong> Mantenimiento y Coordinación de Recursos.</li>
        <li><strong>Luisa Rojas:</strong> Finanzas y Contabilidad.</li>
        <li><strong>Esposa del Sr. Rojas:</strong> Administración General.</li>
      </ul>
    </div>
  )
}