// src/pages/Contacto.jsx

export default function Contacto() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Contacto y Centros de Operación
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Para cotizaciones de servicio, por favor envíe su solicitud vía email a 
        <a href="mailto:cotizaciones@acmetrans.cl" className="text-blue-600 font-medium hover:underline ml-1">
          cotizaciones@acmetrans.cl
        </a>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Osorno */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800">Sede Osorno</h3>
          <p className="text-gray-600">Encargado: Administrador Osorno</p>
          <p className="text-gray-600">Flota: 3 GC y 6 MC</p>
        </div>
        {/* Santiago */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800">Sede Santiago</h3>
          <p className="text-gray-600">Encargado: Administrador Santiago</p>
          <p className="text-gray-600">Flota: 5 GC y 8 MC</p>
        </div>
        {/* Coquimbo */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800">Sede Coquimbo</h3>
          <p className="text-gray-600">Encargado: Administrador Coquimbo</p>
          <p className="text-gray-600">Flota: 3 GC y 4 MC</p>
        </div>
      </div>
    </div>
  )
}