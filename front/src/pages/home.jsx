import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Bienvenidos a ACME TRANS (AT)
      </h1>
      <p className="text-lg text-gray-700 mb-4">
        Su socio estratégico en transporte de carga a lo largo de Chile. 
        Operamos en la zona sur, centro y norte, especializándonos en los sectores 
        agrícola, multitiendas y alimentos.
      </p>
      <Link 
        to="/proceso-cotizacion" // (Eventualmente crearemos esta ruta)
        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Solicitar Cotización
      </Link>
    </div>
  )


}

