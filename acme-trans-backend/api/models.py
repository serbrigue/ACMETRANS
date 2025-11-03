# api/models.py

from django.db import models
from django.contrib.auth.models import User

# --- 1. Modelo Sucursal ---
# Almacena los 3 centros de operación: Osorno, Santiago, Coquimbo.
class Sucursal(models.Model):
    nombre = models.CharField(max_length=100, unique=True) # Ej: "Osorno"
    direccion = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Sucursales" # Corrige el plural en el Admin

    def __str__(self):
        return self.nombre # Muestra "Osorno" en el admin

# --- 2. Modelo Cliente ---
# Usamos OneToOneField para 'extender' el modelo User de Django.
# El User maneja el (username, password, email).
# Este modelo guarda la info ADICIONAL del cliente.
class Cliente(models.Model):
    # Link al modelo de autenticación de Django
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cliente_profile")
    
    # Info adicional
    nombre_empresa = models.CharField(max_length=200, blank=True, null=True)
    rut_empresa = models.CharField(max_length=12, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        # Muestra el username del User asociado
        return self.user.username

# --- 3. Modelo Empleado ---
# También extiende el User de Django. Un empleado (conductor, admin)
# también necesita una cuenta de usuario para interactuar con el sistema.
class Empleado(models.Model):
    
    # Opciones para el cargo del empleado
    CARGO_CHOICES = [
        ('ADM', 'Administrador'),
        ('CON', 'Conductor'),
        ('MEC', 'Mecánico'),
        ('AUX', 'Auxiliar'),
        ('GER', 'Gerente'), # Para Sr. Marcos, Luisa, etc.
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="empleado_profile")
    cargo = models.CharField(max_length=3, choices=CARGO_CHOICES)
    
    # Un empleado pertenece a una sucursal
    sucursal = models.ForeignKey(
        Sucursal, 
        on_delete=models.PROTECT, # Evita borrar una sucursal si tiene empleados
        related_name="empleados"
    )

    def __str__(self):
        # Muestra "username (Cargo)"
        return f"{self.user.username} ({self.get_cargo_display()})"

# --- 4. Modelo Camion ---
# Almacena la flota de 29 camiones.
class Camion(models.Model):

    # Opciones para la capacidad (GC y MC)
    CAPACIDAD_CHOICES = [
        ('MC', 'Mediana Capacidad'),
        ('GC', 'Gran Capacidad'),
    ]

    matricula = models.CharField(max_length=10, unique=True) # Patente
    capacidad = models.CharField(max_length=2, choices=CAPACIDAD_CHOICES)
    
    # Cada camión tiene su base en una sucursal
    sucursal_base = models.ForeignKey(
        Sucursal, 
        on_delete=models.PROTECT, 
        related_name="camiones_en_base"
    )

    # El conductor asignado. Es un Empleado.
    conductor_asignado = models.ForeignKey(
        Empleado,
        on_delete=models.SET_NULL, # Si se borra el conductor, el camión no se borra
        null=True, # Puede estar temporalmente sin conductor
        blank=True,
        related_name="camion_asignado",
        # ¡Magia de Django! Solo permite seleccionar empleados
        # que tengan el cargo 'CON' (Conductor).
        limit_choices_to={'cargo': 'CON'}
    )

    def __str__(self):
        return f"Matrícula: {self.matricula} ({self.get_capacidad_display()})"
    
class Pedido(models.Model):
    ESTADO_CHOICES = [
        ('SOLICITADO', 'Solicitado'), # Cliente acaba de pedir
        ('COTIZADO', 'Cotizado'),     # Admin ya envió precio
        ('CONFIRMADO', 'Confirmado'),   # Cliente aceptó
        ('EN_RUTA', 'En Ruta'),
        ('COMPLETADO', 'Completado'),
        ('CANCELADO', 'Cancelado'),
    ]

    # Quién lo pidió
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name="pedidos")
    
    # Info de la solicitud
    sucursal_origen = models.ForeignKey(
        Sucursal, 
        on_delete=models.PROTECT, 
        related_name="pedidos_originados",default=None
    )
    destino = models.CharField(max_length=255)
    tipo_carga = models.CharField(max_length=100, help_text="Ej: Alimentos, Retail, Agrícola")
    detalles_carga = models.TextField(blank=True, null=True, help_text="Dimensiones, peso, etc.")
    fecha_deseada = models.DateField(help_text="Fecha en que el cliente quiere el transporte")

    # Info de estado y auditoría
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='SOLICITADO')

    # Campos que el ADMIN llenará
    costo_estimado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    precio_cotizado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    camion_asignado = models.ForeignKey(
        Camion,
        on_delete=models.SET_NULL, # Si se borra el camión, el pedido no se borra
        null=True, 
        blank=True,
        related_name="pedidos_asignados"
    )
   
    def __str__(self):
        # Actualizamos el __str__ para que use el nuevo campo
        return f"Pedido {self.id} de {self.cliente.user.username} ({self.sucursal_origen.nombre} -> {self.destino})"