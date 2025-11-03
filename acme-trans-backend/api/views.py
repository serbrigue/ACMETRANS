# api/views.py

from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

# Importamos todos los modelos
from .models import Sucursal, Cliente, Empleado, Camion, Pedido

# Importamos todos los Serializers
from .serializers import (
    UserSerializer, 
    MyTokenObtainPairSerializer, 
    CamionReadSerializer, 
    CamionWriteSerializer,
    SucursalSerializer, 
    ConductorSerializer,
    EmpleadoReadSerializer, 
    EmpleadoCreateSerializer, 
    EmpleadoUpdateSerializer,
    PedidoClienteSerializer, 
    PedidoAdminSerializer,
    PedidoAdminUpdateSerializer,
    CamionDropdownSerializer
)

# Importamos los Permisos
from .permissions import IsSuperUser, IsCliente

# Vistas de Autenticación
from rest_framework_simplejwt.views import TokenObtainPairView

# --- VISTAS DE AUTENTICACIÓN Y REGISTRO ---

class RegisterView(generics.CreateAPIView):
    """
    Endpoint de API para registrar nuevos usuarios (Clientes).
    """
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para el login que usa el serializer
    que añade 'is_superuser' al token.
    """
    serializer_class = MyTokenObtainPairSerializer

# --- VISTAS DE ADMIN: CAMIONES ---

class CamionListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para Listar (GET) y Crear (POST) camiones.
    Acepta filtro: ?sucursal_id=1
    """
    permission_classes = [IsSuperUser]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CamionWriteSerializer
        return CamionReadSerializer

    def get_queryset(self):
        queryset = Camion.objects.all().order_by('sucursal_base')
        
        # LÓGICA DE FILTRO
        sucursal_id = self.request.query_params.get('sucursal_id')
        if sucursal_id:
            queryset = queryset.filter(sucursal_base_id=sucursal_id)
        
        return queryset

class CamionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para Ver (GET), Actualizar (PUT/PATCH) y Eliminar (DELETE)
    un camión específico.
    """
    permission_classes = [IsSuperUser]
    queryset = Camion.objects.all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CamionWriteSerializer
        return CamionReadSerializer

# --- VISTAS DE ADMIN: EMPLEADOS ---

class EmpleadoListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para Listar (GET) y Crear (POST) Empleados.
    Acepta filtro: ?sucursal_id=1
    """
    permission_classes = [IsSuperUser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EmpleadoCreateSerializer
        return EmpleadoReadSerializer
    
    def get_queryset(self):
        queryset = Empleado.objects.select_related('user', 'sucursal')
        
        # LÓGICA DE FILTRO
        sucursal_id = self.request.query_params.get('sucursal_id')
        if sucursal_id:
            queryset = queryset.filter(sucursal_id=sucursal_id)
        
        return queryset

class EmpleadoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para Ver (GET), Actualizar (PUT/PATCH) y Eliminar (DELETE)
    un Empleado específico.
    """
    permission_classes = [IsSuperUser]
    queryset = Empleado.objects.select_related('user', 'sucursal')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EmpleadoUpdateSerializer
        return EmpleadoReadSerializer

# --- VISTAS DE PEDIDOS (CLIENTE) ---
class MyPedidoListView(generics.ListCreateAPIView):
    """
    Endpoint para Clientes:
    - GET: Ver (Listar) mis pedidos
    - POST: Crear un pedido
    """
    permission_classes = [IsCliente]
    serializer_class = PedidoClienteSerializer

    def get_queryset(self):
        return Pedido.objects.filter(cliente=self.request.user.cliente_profile).order_by('-fecha_solicitud')

    def perform_create(self, serializer):
        serializer.save(cliente=self.request.user.cliente_profile)

# --- VISTAS DE PEDIDOS (ADMIN) ---
class PedidoAdminListView(generics.ListAPIView):
    """
    Endpoint para Admins:
    - GET: Ver TODOS los pedidos
    Acepta filtro: ?sucursal_id=1
    """
    permission_classes = [IsSuperUser]
    serializer_class = PedidoAdminSerializer

    def get_queryset(self):
        # 1. Obtenemos el queryset base
        queryset = Pedido.objects.all().select_related('cliente__user', 'camion_asignado', 'sucursal_origen')
        
        sucursal_id = self.request.query_params.get('sucursal_id')
        
        if sucursal_id:
            # 2. LÓGICA DE FILTRO CORREGIDA:
            # Filtramos por la sucursal de ORIGEN del pedido.
            queryset = queryset.filter(sucursal_origen_id=sucursal_id)
        
        # 3. RETURN DES-INDENTADO (FUERA DEL 'IF')
        # Esto asegura que la función SIEMPRE devuelva un queryset.
        return queryset.order_by('-fecha_solicitud')


class PedidoAdminDetailView(generics.RetrieveUpdateAPIView):
    """
    Endpoint para Admins:
    - GET: Ver detalle de un pedido
    - PUT/PATCH: Actualizar estado/costo/precio de un pedido
    """
    permission_classes = [IsSuperUser]
    queryset = Pedido.objects.all().select_related('cliente__user', 'camion_asignado')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PedidoAdminUpdateSerializer # Para actualizar
        return PedidoAdminSerializer # Para leer

# --- VISTAS PARA DROPDOWNS Y DATOS ---

class SucursalListView(generics.ListAPIView):
    """ Endpoint (GET) para listar sucursales (para dropdowns) """
    permission_classes = [IsAuthenticated]
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer

class SucursalDetailView(generics.RetrieveAPIView):
    """ Endpoint (GET) para ver los detalles de una sucursal por ID """
    permission_classes = [IsAuthenticated]
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer

class ConductorListView(generics.ListAPIView):
    """ Endpoint (GET) para listar empleados que son 'Conductores' """
    permission_classes = [IsAuthenticated]
    queryset = Empleado.objects.filter(cargo='CON')
    serializer_class = ConductorSerializer

class CamionDropdownListView(generics.ListAPIView):
    """
    Endpoint (GET) para listar camiones para un dropdown.
    Muestra "Matrícula (Conductor)".
    """
    permission_classes = [IsAuthenticated]
    queryset = Camion.objects.select_related('conductor_asignado__user').all()
    serializer_class = CamionDropdownSerializer