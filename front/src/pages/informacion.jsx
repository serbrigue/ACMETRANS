// src/pages/informacion.jsx

export default function Informacion() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Nuestra Historia y Compromiso
      </h1>

      {/* Sección: De la Experiencia a la Excelencia */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12 bg-blue-50 p-6 rounded-lg">
        <div className="md:w-1/2">
          <h2 className="text-3xl font-semibold text-blue-800 mb-4">De la Experiencia a la Excelencia</h2>
          <p className="text-lg text-gray-700 mb-4">
            <strong>ACME TRANS (AT)</strong> es una PYME de carácter familiar fundada y 
            dirigida por el Sr. Marcos Rojas. Nuestra empresa nace de la experiencia directa: 
            el Sr. Rojas trabajó durante 10 años como conductor de camiones, lo que nos 
            brinda una comprensión única y profunda del negocio del transporte.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img 
            src="historia_fundador.jpg" 
            alt="Sr. Marcos Rojas con un camión, simbolizando la experiencia" 
            className="w-full md:w-3/4 h-auto rounded-lg shadow-md object-cover" 
          />
        </div>
      </div>

      {/* Sección: Crecimiento y Adaptación */}
      <div className="flex flex-col md:flex-row-reverse items-center gap-8 mb-12 p-6 bg-gray-50 rounded-lg">
        <div className="md:w-1/2">
          <h2 className="text-3xl font-semibold text-blue-800 mb-4">Crecimiento y Adaptación</h2>
          <p className="text-lg text-gray-700 mb-4">
            Comenzamos nuestras operaciones enfocados en el sector agrícola en la zona sur 
            del país. Viendo las necesidades del mercado, nos diversificamos 
            exitosamente para atender a sectores industriales clave como multitiendas y 
            alimentos, expandiendo nuestra cobertura a la región central y norte.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img 
            src="/crecimiento.jpg" 
            alt="Mapa de Chile con rutas de transporte destacadas" 
            className="w-full md:w-3/4 h-auto rounded-lg shadow-md object-cover" 
          />
        </div>
      </div>

      {/* Sección: Nuestra Flota */}
      <div className="text-center mb-12 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-3xl font-semibold text-blue-800 mb-6">Nuestra Flota: Potencia y Versatilidad</h2>
        <img 
          src="camiones.jpg" 
          alt="Vista aérea de la flota de camiones de ACME TRANS" 
          className="w-full h-80 object-cover rounded-lg shadow-md mb-6 mx-auto" 
        />
        <p className="text-lg text-gray-700 mb-4">
          Nuestra capacidad operativa se basa en una flota propia de 29 camiones, 
          distribuidos estratégicamente en nuestros centros de operación:
        </p>
        <ul className="list-disc list-inside text-xl font-medium text-gray-800 space-y-2 max-w-md mx-auto">
          <li><strong>11 Camiones de Gran Capacidad (GC)</strong></li>
          <li><strong>18 Camiones de Mediana Capacidad (MC)</strong></li>
        </ul>
      </div>

      {/* Sección: Equipo Directivo */}
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <h2 className="text-3xl font-semibold text-blue-800 mb-6">Equipo Directivo</h2>
        <img 
            src="equipo.jpg" 
            alt="Foto del equipo directivo de ACME TRANS" 
            className="w-full md:w-2/3 h-64 object-cover object-top shadow-md mb-6 mx-auto" 
        />
        <p className="text-lg text-gray-700 mb-4">
          Somos una empresa familiar donde cada miembro clave aporta a nuestro éxito y visión:
        </p>
        <ul className="list-disc list-inside text-xl font-medium text-gray-800 space-y-2 max-w-md mx-auto">
          <li><strong>Sr. Marcos Rojas:</strong> Dirección General y Gestión de Contratos.</li>
          <li><strong>Pedro Rojas:</strong> Mantenimiento y Coordinación de Recursos.</li>
          <li><strong>Luisa Rojas:</strong> Gestión Financiera y Contable.</li>
          <li><strong>Administración General:</strong> Gestión administrativa de la empresa.</li>
        </ul>
      </div>
    </div>
  );
}