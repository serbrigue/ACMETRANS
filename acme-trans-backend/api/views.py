# api/views.py

from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

# --- ¡IMPORTACIONES CORREGIDAS! ---
# Añadimos APIView, Response, Count y Q
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q
# --- FIN DE IMPORTACIONES CORREGIDAS ---

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
        # Optimizamos la consulta para incluir conductor y su usuario
        queryset = Camion.objects.select_related(
            'sucursal_base', 
            'conductor_asignado__user' 
        ).order_by('sucursal_base')
        
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
    
    # Optimizamos la consulta
    queryset = Camion.objects.select_related(
        'sucursal_base', 
        'conductor_asignado__user'
    )

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
        # Optimizamos la consulta
        return Pedido.objects.filter(cliente=self.request.user.cliente_profile).select_related('sucursal_origen').order_by('-fecha_solicitud')

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
        queryset = Pedido.objects.all().select_related('cliente__user', 'camion_asignado', 'sucursal_origen')
        
        sucursal_id = self.request.query_params.get('sucursal_id')
        
        if sucursal_id:
            queryset = queryset.filter(sucursal_origen_id=sucursal_id)
        
        return queryset.order_by('-fecha_solicitud')


class PedidoAdminDetailView(generics.RetrieveUpdateAPIView):
    """
    Endpoint para Admins:
    - GET: Ver detalle de un pedido
    - PUT/PATCH: Actualizar estado/costo/precio de un pedido
    """
    permission_classes = [IsSuperUser]
    # Optimizamos la consulta (incluyendo sucursal_origen)
    queryset = Pedido.objects.all().select_related('cliente__user', 'camion_asignado', 'sucursal_origen')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PedidoAdminUpdateSerializer
        return PedidoAdminSerializer 

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
    # Filtramos por conductores 'Disponibles'
    queryset = Empleado.objects.filter(cargo='CON', estado='DIS')
    serializer_class = ConductorSerializer

class CamionDropdownListView(generics.ListAPIView):
    """
    Endpoint (GET) para listar camiones para un dropdown.
    """
    permission_classes = [IsAuthenticated]
    queryset = Camion.objects.select_related('conductor_asignado__user').all()
    serializer_class = CamionDropdownSerializer
    

# --- ¡NUEVA VISTA DEL DASHBOARD! ---

# Funciones helper para formatear
def format_estado_pedido(estado_key):
    """ Convierte 'EN_RUTA' a 'En ruta' """
    return estado_key.replace('_', ' ').capitalize()

def format_estado_camion(estado_key):
    """ Convierte 'DIS' a 'Disponible' """
    estados = {'DIS': 'Disponible', 'RUT': 'En Ruta', 'MAN': 'En Mantención', 'REP': 'En Reparación'}
    return estados.get(estado_key, estado_key)

class SucursalDashboardDataView(APIView):
    """
    Entrega un JSON consolidado con todas las métricas
    necesarias para el dashboard de una sucursal específica.
    """
    permission_classes = [IsSuperUser]

    def get(self, request, pk, format=None):
        try:
            # 1. Obtener la sucursal
            sucursal = Sucursal.objects.get(pk=pk)
            
            # --- 2. Métricas de Pedidos ---
            pedidos_data = Pedido.objects.filter(sucursal_origen_id=pk) \
                                         .values('estado') \
                                         .annotate(count=Count('estado'))
            
            pedidos_counts = {p['estado']: p['count'] for p in pedidos_data}
            grafico_pedidos = [
                {"name": format_estado_pedido(key), "value": val} 
                for key, val in pedidos_counts.items()
            ]

            # --- 3. Métricas de Camiones ---
            camiones_data = Camion.objects.filter(sucursal_base_id=pk) \
                                          .values('estado') \
                                          .annotate(count=Count('estado'))
            
            camiones_counts = {c['estado']: c['count'] for c in camiones_data}
            
            grafico_camiones = [{
                "name": "Flota",
                "Disponible": camiones_counts.get('DIS', 0),
                "En Ruta": camiones_counts.get('RUT', 0),
                "En Mantención": camiones_counts.get('MAN', 0),
                "En Reparación": camiones_counts.get('REP', 0),
            }]

            # --- 4. Métricas de Empleados (Conductores) ---
            conductores_data = Empleado.objects.filter(sucursal_id=pk, cargo='CON') \
                                             .values('estado') \
                                             .annotate(count=Count('estado'))
            
            conductores_counts = {e['estado']: e['count'] for e in conductores_data}

            # --- 5. Consolidar el JSON de respuesta ---
            data = {
                "sucursal_nombre": sucursal.nombre,
                
                "kpis": {
                    "camiones_disponibles": camiones_counts.get('DIS', 0),
                    "conductores_disponibles": conductores_counts.get('DIS', 0),
                    "pedidos_en_ruta": pedidos_counts.get('EN_RUTA', 0),
                    "pedidos_nuevos": pedidos_counts.get('SOLICITADO', 0),
                    "total_camiones": sum(camiones_counts.values()),
                    "total_conductores": sum(conductores_counts.values()),
                },
                
                "grafico_pedidos": grafico_pedidos,
                "grafico_camiones": grafico_camiones
            }
            
            return Response(data)

        except Sucursal.DoesNotExist:
            return Response({"error": "Sucursal no encontrada."}, status=404)
        except Exception as e:
            print(f"Error en SucursalDashboardDataView: {e}") 
            return Response({"error": "Ocurrió un error al procesar los datos."}, status=500)