# api/serializers.py

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Importa todos tus modelos
from .models import Sucursal, Cliente, Empleado, Camion, Pedido

# --- 1. SERIALIZER DE REGISTRO ---
class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para crear nuevos usuarios (Clientes).
    El nombre de empresa es opcional.
    """
    nombre_empresa = serializers.CharField(
        write_only=True, 
        required=False,
        allow_blank=True,
        allow_null=True
    )
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'nombre_empresa')
        extra_kwargs = { 'password': {'write_only': True} }

    def create(self, validated_data):
        nombre_empresa = validated_data.pop('nombre_empresa', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        Cliente.objects.create(user=user, nombre_empresa=nombre_empresa)
        return user

# --- 2. SERIALIZER DE TOKEN (LOGIN) ---
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        return token

# --- 3. SERIALIZERS DE CAMIONES ---
class CamionReadSerializer(serializers.ModelSerializer):
    sucursal_base = serializers.StringRelatedField()
    conductor_asignado = serializers.StringRelatedField()
    class Meta:
        model = Camion
        fields = [
            'id', 'matricula', 'capacidad', 'sucursal_base', 
            'conductor_asignado', 'get_capacidad_display',
        ]

class CamionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camion
        fields = [
            'matricula', 'capacidad', 'sucursal_base', 'conductor_asignado'
        ]

# --- 4. SERIALIZERS DE EMPLEADOS ---
class UserDisplaySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class EmpleadoReadSerializer(serializers.ModelSerializer):
    user = UserDisplaySerializer(read_only=True)
    sucursal = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Empleado
        fields = [
            'id', 'user', 'cargo', 'get_cargo_display', 'sucursal'
        ]

class EmpleadoCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    class Meta:
        model = Empleado
        fields = ('username', 'email', 'password', 'cargo', 'sucursal')
    
    def create(self, validated_data):
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        try:
            user = User.objects.create_user(
                username=username, email=email, password=password, is_staff=True
            )
        except Exception as e:
            raise serializers.ValidationError({'error': str(e)})
        empleado = Empleado.objects.create(user=user, **validated_data)
        return empleado

class EmpleadoUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = ('cargo', 'sucursal')

# --- 5. SERIALIZERS DE PEDIDOS ---
class PedidoClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = [
            'id', 'sucursal_origen', 'destino', 'tipo_carga', 
            'detalles_carga', 'fecha_deseada', 
            'estado', 'fecha_solicitud'
        ]
        read_only_fields = ('estado', 'fecha_solicitud')

# --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
class PedidoAdminSerializer(serializers.ModelSerializer):
    cliente_username = serializers.CharField(source='cliente.user.username', read_only=True)
    
    # CAMBIO 1: Usa un SerializerMethodField
    camion_asignado_display = serializers.SerializerMethodField()
    
    sucursal_origen_display = serializers.StringRelatedField(source='sucursal_origen')
    
    class Meta:
        model = Pedido
        fields = [
            'id', 'cliente_username', 'sucursal_origen_display', 'destino', 'tipo_carga', 
            'fecha_deseada', 'estado', 'fecha_solicitud',
            'costo_estimado', 'precio_cotizado',
            'camion_asignado_display' # Mantenlo en los campos
        ]
        read_only_fields = ('fecha_solicitud', 'cliente_username')

    # CAMBIO 2: Añade el método que maneja el 'None'
    def get_camion_asignado_display(self, obj):
        if obj.camion_asignado:
            return str(obj.camion_asignado) # Llama al __str__ del camión
        return None # Devuelve null si no hay camión

class PedidoAdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = [
            'estado',
            'precio_cotizado',
            'costo_estimado',
            'camion_asignado'
        ]
        extra_kwargs = {
            'estado': {'required': False},
            'precio_cotizado': {'required': False},
            'costo_estimado': {'required': False},
            'camion_asignado': {'required': False},
        }

# --- 6. SERIALIZERS DE DROPDOWNS ---
class SucursalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sucursal
        fields = ['id', 'nombre', 'ciudad']

class ConductorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Empleado
        fields = ['id', 'username']

class CamionDropdownSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    class Meta:
        model = Camion
        fields = ['id', 'display_name']
    def get_display_name(self, obj):
        conductor_nombre = "Sin Conductor"
        if obj.conductor_asignado:
            conductor_nombre = obj.conductor_asignado.user.username
        return f"{obj.matricula} ({conductor_nombre})"