# api/models.py

from django.db import models
from django.contrib.auth.models import User

# --- 1. Modelo Sucursal ---
# (Sin cambios)
class Sucursal(models.Model):
    nombre = models.CharField(max_length=100, unique=True) # Ej: "Osorno"
    direccion = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Sucursales" 

    def __str__(self):
        return self.nombre

# --- 2. Modelo Cliente ---
# (Sin cambios)
class Cliente(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cliente_profile")
    nombre_empresa = models.CharField(max_length=200, blank=True, null=True)
    rut_empresa = models.CharField(max_length=12, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.user.username

# --- 3. Modelo Empleado (¡MODIFICADO!) ---
class Empleado(models.Model):
    
    CARGO_CHOICES = [
        ('ADM', 'Administrador'),
        ('CON', 'Conductor'),
        ('MEC', 'Mecánico'),
        ('AUX', 'Auxiliar'),
        ('GER', 'Gerente'), 
    ]
    
    # --- ¡NUEVO! Campo Estado para Empleado ---
    ESTADO_EMPLEADO_CHOICES = [
        ('DIS', 'Disponible'),     # Activo y desocupado
        ('RUT', 'En Ruta'),         # Activo y ocupado
        ('LIC', 'Licencia'),      # Inactivo
        ('VAC', 'Vacaciones'),    # Inactivo
        ('PER', 'Permiso'),       # Inactivo
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="empleado_profile")
    cargo = models.CharField(max_length=3, choices=CARGO_CHOICES)
    
    # --- ¡NUEVO! ---
    estado = models.CharField(
        max_length=3, 
        choices=ESTADO_EMPLEADO_CHOICES, 
        default='DIS' # Por defecto, 'Disponible'
    )
    
    sucursal = models.ForeignKey(
        Sucursal, 
        on_delete=models.PROTECT, 
        related_name="empleados"
    )

    def __str__(self):
        # Muestra "username (Cargo) - Estado"
        return f"{self.user.username} ({self.get_cargo_display()}) - {self.get_estado_display()}"

# --- 4. Modelo Camion (¡MODIFICADO!) ---
class Camion(models.Model):

    CAPACIDAD_CHOICES = [
        ('MC', 'Mediana Capacidad'),
        ('GC', 'Gran Capacidad'),
    ]
    
    # --- ¡NUEVO! Campo Estado para Camión ---
    ESTADO_CAMION_CHOICES = [
        ('DIS', 'Disponible'),     # En base y listo
        ('RUT', 'En Ruta'),         # Ocupado en un pedido
        ('MAN', 'En Mantención'),   # No disponible
        ('REP', 'En Reparación'),   # No disponible
    ]

    matricula = models.CharField(max_length=10, unique=True) 
    capacidad = models.CharField(max_length=2, choices=CAPACIDAD_CHOICES)
    
    # --- ¡NUEVO! ---
    estado = models.CharField(
        max_length=3, 
        choices=ESTADO_CAMION_CHOICES, 
        default='DIS' # Por defecto, 'Disponible'
    )
    
    sucursal_base = models.ForeignKey(
        Sucursal, 
        on_delete=models.PROTECT, 
        related_name="camiones_en_base"
    )

    conductor_asignado = models.ForeignKey(
        Empleado,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="camion_asignado",
        limit_choices_to={'cargo': 'CON'}
    )

    def __str__(self):
        return f"Matrícula: {self.matricula} ({self.get_estado_display()})"
    
class Pedido(models.Model):
    ESTADO_CHOICES = [
        ('SOLICITADO', 'Solicitado'), 
        ('COTIZADO', 'Cotizado'),     
        ('CONFIRMADO', 'Confirmado'),   
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
    
    # --- ¡NUEVOS CAMPOS AÑADIDOS! ---
    peso_kg = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Peso total de la carga en kilogramos (kg)"
    )
    volumen_m3 = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Volumen total de la carga en metros cúbicos (m³)"
    )
    # --- FIN DE CAMPOS AÑADIDOS ---
    
    detalles_carga = models.TextField(blank=True, null=True, help_text="Dimensiones, fragilidad, etc.")
    fecha_deseada = models.DateField(help_text="Fecha en que el cliente quiere el transporte")

    # Info de estado y auditoría
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='SOLICITADO')

    # Campos que el ADMIN llenará
    costo_estimado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    precio_cotizado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    camion_asignado = models.ForeignKey(
        Camion,
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        related_name="pedidos_asignados"
    )
   
    def __str__(self):
        return f"Pedido {self.id} de {self.cliente.user.username} ({self.sucursal_origen.nombre} -> {self.destino})"