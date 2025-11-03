# api/management/commands/populate_db.py

import random
from decimal import Decimal
from faker import Faker
from django.db import transaction
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

# Importa todos tus modelos
from api.models import Sucursal, Cliente, Empleado, Camion, Pedido

class Command(BaseCommand):
    help = 'Popula la base de datos con datos de prueba realistas para ACME TRANS'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando la población de la base de datos...'))

        # Inicia Faker en español
        fake = Faker('es_ES')

        try:
            # Usa una transacción atómica para que todo se ejecute como una sola operación
            with transaction.atomic():
                # --- 1. LIMPIAR LA BASE DE DATOS ---
                # Borra todo en orden inverso de dependencias para evitar errores
                self.stdout.write('Limpiando la base de datos antigua...')
                Pedido.objects.all().delete()
                Camion.objects.all().delete()
                Empleado.objects.all().delete()
                Cliente.objects.all().delete()
                Sucursal.objects.all().delete()
                # Borra todos los usuarios excepto los superusuarios
                User.objects.filter(is_superuser=False).delete()

                # --- 2. CREAR SUCURSALES ---
                self.stdout.write('Creando Sucursales...')
                s_osorno = Sucursal.objects.create(nombre="Osorno", ciudad="Osorno", direccion=fake.address())
                s_santiago = Sucursal.objects.create(nombre="Santiago", ciudad="Santiago", direccion=fake.address())
                s_coquimbo = Sucursal.objects.create(nombre="Coquimbo", ciudad="Coquimbo", direccion=fake.address())
                sucursales = [s_osorno, s_santiago, s_coquimbo]

                # --- 3. CREAR EMPLEADOS (Conductores, Mecánicos, Admins) ---
                self.stdout.write('Creando Empleados...')
                conductores = []
                # Crear 15 conductores
                for i in range(15):
                    user = User.objects.create_user(
                        username=f'conductor_{i+1}',
                        password='pass123',
                        first_name=fake.first_name(),
                        last_name=fake.last_name(),
                        is_staff=True
                    )
                    emp = Empleado.objects.create(
                        user=user,
                        cargo='CON',
                        sucursal=random.choice(sucursales)
                    )
                    conductores.append(emp)
                
                # Crear 6 mecánicos (2 por sucursal)
                for i in range(6):
                    user = User.objects.create_user(
                        username=f'mecanico_{i+1}', password='pass123', 
                        first_name=fake.first_name(), last_name=fake.last_name(), is_staff=True
                    )
                    Empleado.objects.create(user=user, cargo='MEC', sucursal=sucursales[i % 3])

                # --- 4. CREAR CAMIONES (29 en total) ---
                self.stdout.write('Creando Flota de Camiones...')
                # Osorno: 3 GC, 6 MC
                for _ in range(3): Camion.objects.create(matricula=fake.license_plate(), capacidad='GC', sucursal_base=s_osorno)
                for _ in range(6): Camion.objects.create(matricula=fake.license_plate(), capacidad='MC', sucursal_base=s_osorno)
                # Santiago: 5 GC, 8 MC
                for _ in range(5): Camion.objects.create(matricula=fake.license_plate(), capacidad='GC', sucursal_base=s_santiago)
                for _ in range(8): Camion.objects.create(matricula=fake.license_plate(), capacidad='MC', sucursal_base=s_santiago)
                # Coquimbo: 3 GC, 4 MC
                for _ in range(3): Camion.objects.create(matricula=fake.license_plate(), capacidad='GC', sucursal_base=s_coquimbo)
                for _ in range(4): Camion.objects.create(matricula=fake.license_plate(), capacidad='MC', sucursal_base=s_coquimbo)

                # Asignar conductores a los primeros 15 camiones
                camiones_sin_conductor = list(Camion.objects.all())
                for i in range(len(conductores)):
                    camion = camiones_sin_conductor[i]
                    camion.conductor_asignado = conductores[i]
                    camion.save()

                # --- 5. CREAR CLIENTES ---
                self.stdout.write('Creando Clientes...')
                clientes = []
                # Crear un cliente de prueba fácil de recordar
                user_cliente_test = User.objects.create_user(username='cliente', password='pass123', email='cliente@test.com')
                clientes.append(Cliente.objects.create(user=user_cliente_test, nombre_empresa='Empresa de Prueba S.A.'))
                
                # Crear 20 clientes falsos
                for i in range(20):
                    user = User.objects.create_user(
                        username=f'cliente_{fake.user_name()}{i}',
                        password='pass123',
                        email=fake.email()
                    )
                    cli = Cliente.objects.create(
                        user=user,
                        nombre_empresa=fake.company()
                    )
                    clientes.append(cli)

                # --- 6. CREAR PEDIDOS ---
                self.stdout.write('Creando Pedidos de prueba...')
                tipos_carga = ['Alimentos', 'Retail', 'Agrícola', 'Electrónica', 'Materiales']
                estados_posibles = ['SOLICITADO', 'COTIZADO', 'CONFIRMADO', 'EN_RUTA', 'COMPLETADO', 'CANCELADO']
                
                for _ in range(50): # Crear 50 pedidos
                    cliente = random.choice(clientes)
                    sucursal_origen = random.choice(sucursales)
                    estado = random.choice(estados_posibles)
                    
                    p = Pedido.objects.create(
                        cliente=cliente,
                        sucursal_origen=sucursal_origen,
                        destino=fake.city(),
                        tipo_carga=random.choice(tipos_carga),
                        detalles_carga=fake.sentence(nb_words=10),
                        fecha_deseada=fake.date_between(start_date='today', end_date='+60d'),
                        estado=estado
                    )
                    
                    # Si el pedido está avanzado, añadirle más datos
                    if estado not in ['SOLICITADO', 'CANCELADO']:
                        p.precio_cotizado = Decimal(random.randint(50000, 1500000))
                        p.costo_estimado = p.precio_cotizado * Decimal(random.uniform(0.6, 0.8))
                        
                        # Asignar un camión de la misma sucursal de origen
                        camion_disponible = Camion.objects.filter(sucursal_base=sucursal_origen).order_by('?').first()
                        if camion_disponible:
                            p.camion_asignado = camion_disponible
                        p.save()

            self.stdout.write(self.style.SUCCESS('¡Población de la base de datos completada con éxito!'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error durante la población: {e}'))
            raise