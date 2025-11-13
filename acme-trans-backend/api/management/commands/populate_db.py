# acme-trans-backend/api/management/commands/populate_db.py

import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
from faker import Faker
from decimal import Decimal

# Importamos TODOS los modelos
from api.models import Sucursal, Cliente, Empleado, Camion, Pedido

fake = Faker('es_ES') # Usar local de español para nombres y direcciones

# --- Configuración de la Población ---
NUM_CLIENTES = 5
NUM_EMPLEADOS_POR_SUCURSAL = {
    'Osorno': 15,
    'Santiago': 25,
    'Coquimbo': 10
}
# Total 29 camiones (según PDF)
NUM_CAMIONES_POR_SUCURSAL = {
    'Osorno': {'GC': 3, 'MC': 6},
    'Santiago': {'GC': 5, 'MC': 8},
    'Coquimbo': {'GC': 3, 'MC': 4}
}
NUM_PEDIDOS = 50
PASSWORD_CLIENTE = "pass123"
PASSWORD_EMPLEADO = "pass123"

class Command(BaseCommand):
    help = 'Pobla la base de datos con datos de prueba realistas de ACMETRANS'

    @transaction.atomic # Si algo falla, se revierte todo
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Iniciando población de la base de datos...'))

        # 0. Limpiar datos antiguos (¡Cuidado en producción!)
        self.stdout.write('Limpiando datos antiguos...')
        User.objects.filter(is_superuser=False).delete()
        Sucursal.objects.all().delete()
        Camion.objects.all().delete()
        Empleado.objects.all().delete()
        Cliente.objects.all().delete()
        Pedido.objects.all().delete()

        # 1. Crear Sucursales
        sucursales = self._create_sucursales()
        
        # 2. Crear Clientes
        clientes = self._create_clientes()
        
        # 3. Crear Empleados (Conductores, Mecánicos, etc.)
        empleados = self._create_empleados(sucursales)
        
        # 4. Crear Camiones y asignarles conductores
        # (Se crean después de empleados para poder asignar conductores)
        camiones = self._create_camiones(sucursales, empleados)

        # 5. Crear Pedidos de ejemplo
        self._create_pedidos(clientes, sucursales, camiones)

        self.stdout.write(self.style.SUCCESS(f'\n¡Población completada con éxito!'))
        self.stdout.write(self.style.WARNING(f'Usuario Cliente: cliente / {PASSWORD_CLIENTE}'))
        self.stdout.write(self.style.WARNING(f'Usuarios Empleados: (ej: p.rojas) / {PASSWORD_EMPLEADO}'))

    def _create_sucursales(self):
        self.stdout.write('Creando sucursales...')
        sucursales_data = [
            {"nombre": "Osorno", "direccion": "Av. Los Héroes 123", "ciudad": "Osorno"},
            {"nombre": "Santiago", "direccion": "Panamericana Norte 456", "ciudad": "Santiago"},
            {"nombre": "Coquimbo", "direccion": "Ruta 5 Norte 789", "ciudad": "Coquimbo"},
        ]
        sucursales = {}
        for data in sucursales_data:
            suc = Sucursal.objects.create(**data)
            sucursales[suc.nombre] = suc
            self.stdout.write(f'  Creada sucursal: {suc.nombre}')
        return sucursales

    def _create_clientes(self):
        self.stdout.write('Creando clientes de prueba...')
        clientes = []
        
        # Cliente 1 (Fijo para pruebas)
        user_cliente = User.objects.create_user(
            username="cliente",
            password=PASSWORD_CLIENTE,
            first_name="Juan",
            last_name="Pérez",
            email="cliente@empresa.com",
            is_staff=False
        )
        cliente = Cliente.objects.create(
            user=user_cliente,
            nombre_empresa="Empresa XYZ",
            rut_empresa="76.123.456-K",
            telefono="+56912345678"
        )
        clientes.append(cliente)

        # Clientes aleatorios
        for _ in range(NUM_CLIENTES - 1):
            first_name = fake.first_name()
            last_name = fake.last_name()
            username = f"{first_name[0].lower()}{last_name.lower().split(' ')[0]}"
            user = User.objects.create_user(
                username=username,
                password=PASSWORD_CLIENTE,
                first_name=first_name,
                last_name=last_name,
                email=f"{username}@{fake.free_email_domain()}",
                is_staff=False
            )
            cliente = Cliente.objects.create(
                user=user,
                nombre_empresa=fake.company(),
                rut_empresa=f"{random.randint(70, 99)}.{random.randint(100, 999)}.{random.randint(100, 999)}-{random.randint(0, 9)}",
                telefono=fake.phone_number()
            )
            clientes.append(cliente)
        
        self.stdout.write(f'  Creados {len(clientes)} clientes.')
        return clientes

    def _create_empleados(self, sucursales):
        self.stdout.write('Creando empleados...')
        empleados = {'CON': [], 'MEC': [], 'ADM': []}
        
        # Crear a Pedro Rojas (Jefe de Operaciones/Mecánico en Santiago)
        user_pedro = User.objects.create_user(
            username="p.rojas",
            password=PASSWORD_EMPLEADO,
            first_name="Pedro",
            last_name="Rojas",
            email="pedro.rojas@acmetrans.cl",
            is_staff=True # Puede entrar al admin
        )
        pedro = Empleado.objects.create(
            user=user_pedro,
            cargo='MEC',
            estado='DIS', 
            sucursal=sucursales['Santiago']
        )
        empleados['MEC'].append(pedro)

        # Crear empleados aleatorios por sucursal
        for nombre_sucursal, num in NUM_EMPLEADOS_POR_SUCURSAL.items():
            sucursal = sucursales[nombre_sucursal]
            for i in range(num):
                first_name = fake.first_name()
                last_name = fake.last_name()
                username = f"{first_name[0].lower()}.{last_name.lower().split(' ')[0]}{i}"
                user = User.objects.create_user(
                    username=username,
                    password=PASSWORD_EMPLEADO,
                    first_name=first_name,
                    last_name=last_name,
                    email=f"{username}@acmetrans.cl",
                    is_staff=True # Todos los empleados son staff
                )
                
                # Definir cargos (mayoría conductores)
                if i < (num * 0.6): # 60% Conductores
                    cargo = 'CON'
                elif i < (num * 0.8): # 20% Mecánicos
                    cargo = 'MEC'
                else: # 20% Administradores/Auxiliares
                    cargo = random.choice(['ADM', 'AUX'])
                
                empleado = Empleado.objects.create(
                    user=user,
                    cargo=cargo,
                    estado='DIS', # Todos inician 'Disponibles'
                    sucursal=sucursal
                )
                
                if cargo == 'CON':
                    empleados['CON'].append(empleado)
                elif cargo == 'MEC':
                    empleados['MEC'].append(empleado)
                else:
                    empleados['ADM'].append(empleado)

        self.stdout.write(f'  Creados {len(empleados["CON"])} Conductores, {len(empleados["MEC"])} Mecánicos, y {len(empleados["ADM"])} Admin/Aux.')
        return empleados


    def _create_camiones(self, sucursales, empleados):
        self.stdout.write('Creando flota de camiones...')
        camiones = []
        conductores_disponibles = list(empleados['CON']) 

        for nombre_sucursal, capacidades in NUM_CAMIONES_POR_SUCURSAL.items():
            sucursal = sucursales[nombre_sucursal]
            
            # Crear Camiones GC
            for _ in range(capacidades['GC']):
                camion = Camion.objects.create(
                    matricula=fake.license_plate().replace(' ', ''),
                    capacidad='GC',
                    estado='DIS', 
                    sucursal_base=sucursal,
                    conductor_asignado=None 
                )
                camiones.append(camion)
            
            # Crear Camiones MC
            for _ in range(capacidades['MC']):
                camion = Camion.objects.create(
                    matricula=fake.license_plate().replace(' ', ''),
                    capacidad='MC',
                    estado='DIS', 
                    sucursal_base=sucursal,
                    conductor_asignado=None
                )
                camiones.append(camion)
        
        # Asignar algunos conductores a camiones (solo los de la misma sucursal)
        self.stdout.write('Asignando algunos conductores disponibles a camiones...')
        camiones_sin_conductor = list(Camion.objects.filter(conductor_asignado__isnull=True))
        
        for cond in conductores_disponibles:
            if not camiones_sin_conductor:
                break 
            
            # Buscar un camión libre EN LA MISMA SUCURSAL del conductor
            camion_para_asignar = next((c for c in camiones_sin_conductor if c.sucursal_base == cond.sucursal), None)
            
            if camion_para_asignar:
                camion_para_asignar.conductor_asignado = cond
                camion_para_asignar.save()
                camiones_sin_conductor.remove(camion_para_asignar)

        self.stdout.write(f'  Creados {len(camiones)} camiones.')
        return camiones


    def _create_pedidos(self, clientes, sucursales, camiones):
        self.stdout.write('Creando pedidos de ejemplo...')
        
        tipos_carga_comunes = ["Alimentos Perecibles", "Retail", "Maquinaria Agrícola", "Carga Seca", "Materiales de Construcción"]
        
        for i in range(NUM_PEDIDOS):
            sucursal_origen = random.choice(list(sucursales.values()))
            destino_ciudad = random.choice(["Valparaíso", "Rancagua", "Talca", "Concepción", "Temuco", "Puerto Montt", "La Serena", "Antofagasta"])
            
            if i < NUM_PEDIDOS * 0.4:
                estado_pedido = 'COMPLETADO'
            elif i < NUM_PEDIDOS * 0.7:
                estado_pedido = 'SOLICITADO'
            elif i < NUM_PEDIDOS * 0.8:
                estado_pedido = 'COTIZADO'
            elif i < NUM_PEDIDOS * 0.9:
                estado_pedido = 'EN_RUTA'
            else:
                estado_pedido = 'CONFIRMADO'

            camion_asignado = None
            precio = None
            costo = None

            if estado_pedido in ['CONFIRMADO', 'EN_RUTA', 'COMPLETADO']:
                camion = Camion.objects.filter(
                    sucursal_base=sucursal_origen, 
                    estado='DIS', 
                    conductor_asignado__isnull=False 
                ).first()
                
                if camion:
                    camion_asignado = camion
                    precio = fake.pydecimal(left_digits=7, right_digits=0, positive=True, min_value=500000, max_value=3000000)
                    costo = precio * Decimal(random.uniform(0.6, 0.8))
                    
                    if estado_pedido in ['CONFIRMADO', 'EN_RUTA']:
                        camion.estado = 'RUT' 
                        camion.save()
                        
                        if camion.conductor_asignado:
                            conductor = camion.conductor_asignado
                            conductor.estado = 'RUT' 
                            conductor.save()
            
            # --- ¡CORRECCIÓN APLICADA AQUÍ! ---
            # left_digits=4 cambiado a left_digits=5
            peso = fake.pydecimal(
                left_digits=5, # Permitir hasta 5 dígitos (ej: 25000)
                right_digits=2, 
                positive=True, 
                min_value=100, 
                max_value=25000
            )
            volumen = fake.pydecimal(
                left_digits=2, 
                right_digits=2, 
                positive=True, 
                min_value=1, 
                max_value=90
            )
            
            Pedido.objects.create(
                cliente=random.choice(clientes),
                sucursal_origen=sucursal_origen,
                destino=f"{fake.street_address()}, {destino_ciudad}",
                tipo_carga=random.choice(tipos_carga_comunes),
                peso_kg=peso,
                volumen_m3=volumen,
                detalles_carga=f"Carga {fake.word()}. {random.randint(1, 20)} pallets.",
                fecha_deseada=fake.future_date(end_date="+30d"),
                estado=estado_pedido,
                costo_estimado=costo,
                precio_cotizado=precio,
                camion_asignado=camion_asignado
            )
        
        self.stdout.write(f'  Creados {NUM_PEDIDOS} pedidos.')