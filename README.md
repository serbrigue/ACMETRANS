# ACMETRANS

Plataforma de Gestión ACME TRANS (AT)

Este proyecto es una aplicación web full-stack moderna, desarrollada con una arquitectura desacoplada (Headless), diseñada para digitalizar y optimizar las operaciones logísticas de la empresa ACME TRANS.

La plataforma permite dos flujos de usuario principales:

    Portal de Cliente: Donde los clientes pueden registrarse, iniciar sesión, y enviar solicitudes de cotización de transporte, indicando un origen (sucursal ACME), destino y detalles de la carga.

    Panel de Administración: Un dashboard interno para los administradores de ACME TRANS. Permite gestionar toda la operación por sucursal, incluyendo la flota de camiones, los empleados (conductores, mecánicos) y el ciclo de vida de los pedidos (desde la cotización hasta la asignación).

🚀 Características Principales

    Autenticación JWT: Sistema de autenticación seguro basado en tokens (Access y Refresh) para la API.

    Roles de Usuario: Separación clara de permisos entre Clientes (solo pueden ver y crear sus pedidos) y Administradores (acceso total a la gestión).

    Panel de Cliente: Formulario de solicitud de servicio y listado de historial de pedidos con su estado actual.

    Panel de Admin Anidado: La gestión se centra en la sucursal. Los administradores navegan de la lista de sucursales a un dashboard específico (/admin/sucursales/:id), que a su vez contiene la gestión filtrada de:

        Gestión de Camiones (CRUD): Crear, leer, editar y eliminar camiones de la flota.

        Gestión de Empleados (CRUD): Crear, leer, editar y eliminar perfiles de empleados (Conductores, Mecánicos, etc.), incluyendo la creación de su cuenta de usuario asociada.

        Gestión de Pedidos (CRUD): Visualizar pedidos por sucursal, y gestionarlos (cambiar estado, asignar precio/contra-oferta, y asignar un camión/conductor).

    Script de Población de Datos: Un comando de Django (populate_db) para llenar la base de datos con datos de prueba realistas (Sucursales, Clientes, 29 Camiones, Empleados, y 50 Pedidos de ejemplo).

    Seguridad: Implementación de variables de entorno (.env) tanto en el frontend como en el backend para proteger claves secretas y URLs de API.

⚙️ Tecnologías Utilizadas

Backend (API)

    Framework: Django

    API: Django REST Framework (DRF)

    Autenticación: djangorestframework-simplejwt (JSON Web Tokens)

    Comandos: Django Management Commands (para el seeder)

    Datos Falsos: Faker

    CORS: django-cors-headers

    Variables de Entorno: python-dotenv

Frontend (Cliente)

    Framework: React 18

    Bundler: Vite

    Enrutamiento: React Router DOM

    Estilos: Tailwind CSS

    Peticiones HTTP: Axios

    Estado Global: React Context API (para Autenticación)

    Utilidades: jwt-decode



    Guía de Ejecución Resumida

1. Backend (Terminal 1)

    Navegar a la carpeta:
    Bash

cd acme-trans-backend

Crear y activar entorno virtual:
Bash

python -m venv venv
.\venv\Scripts\activate 

Instalar dependencias (Usando requirements.txt):
Bash

pip install -r requirements.txt


Crear la Base de Datos:

python manage.py makemigrations api
python manage.py migrate

Crear Admin:

python manage.py createsuperuser

Poblar Datos (Recomendado para demo):
Bash

python manage.py populate_db

Ejecutar:

    python manage.py runserver

    El backend estará en http://localhost:8000.

2. Frontend 

Navegar a la carpeta:

cd mi-proyecto-tailwind

Instalar dependencias:
npm install


Ejecutar:

    npm run dev

    El frontend estará en http://localhost:5173.

Cuentas de Prueba (Post-Población)

    Admin: La que creaste con createsuperuser.

    Cliente: cliente / pass123
