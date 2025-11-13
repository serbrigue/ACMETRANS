# api/serializers.py

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Importa todos tus modelos
from .models import Sucursal, Cliente, Empleado, Camion, Pedido
# api/serializers.py


# --- VISTAS DE AUTENTICACIÓN Y REGISTRO ---

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_superuser'] = user.is_superuser
        return token

class UserSerializer(serializers.ModelSerializer):
    """ Serializer para crear Clientes (no superusuarios) """
    password = serializers.CharField(write_only=True)
    
    # Campos del perfil de Cliente (opcionales)
    # Hacemos 'first_name' y 'last_name' opcionales en el serializer
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    nombre_empresa = serializers.CharField(write_only=True, required=False, allow_blank=True)
    rut_empresa = serializers.CharField(write_only=True, required=False, allow_blank=True)
    telefono = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 
                  'nombre_empresa', 'rut_empresa', 'telefono')
        # Aseguramos que email sea requerido (el modelo User lo requiere)
        extra_kwargs = {
            'email': {'required': True}
        }

    def create(self, validated_data):
        # Extraemos los datos del perfil de cliente
        nombre_empresa = validated_data.pop('nombre_empresa', None)
        rut_empresa = validated_data.pop('rut_empresa', None)
        telefono = validated_data.pop('telefono', None)
        
        # --- ¡CORRECCIÓN APLICADA AQUÍ! ---
        # Usamos .get() con un string vacío como valor por defecto
        # para first_name y last_name, ya que ahora son opcionales.
        first_name_data = validated_data.get('first_name', '')
        last_name_data = validated_data.get('last_name', '')
        
        # Creamos el User
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name_data,
            last_name=last_name_data,
            is_superuser=False,
            is_staff=False
        )
        
        # Creamos el perfil de Cliente asociado
        Cliente.objects.create(
            user=user,
            nombre_empresa=nombre_empresa,
            rut_empresa=rut_empresa,
            telefono=telefono
        )
        return user

class UserReadSerializer(serializers.ModelSerializer):
    """ Serializer para LEER info de User (usado en Empleado) """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


# --- SERIALIZERS PARA DROPDOWNS Y DATOS ---

class SucursalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sucursal
        fields = '__all__'

class ConductorSerializer(serializers.ModelSerializer):
    """ Para dropdowns de 'conductor_asignado' en Camion """
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = Empleado
        fields = ('id', 'nombre_completo')
    
    def get_nombre_completo(self, obj):
        # Lógica mejorada: si no hay nombre/apellido, usa el username
        full_name = f"{obj.user.first_name or ''} {obj.user.last_name or ''}".strip()
        return full_name or obj.user.username

class CamionDropdownSerializer(serializers.ModelSerializer):
    """ Para dropdowns de 'camion_asignado' en Pedido """
    display_text = serializers.SerializerMethodField()

    class Meta:
        model = Camion
        fields = ('id', 'display_text')

    def get_display_text(self, obj):
        conductor = obj.conductor_asignado
        if conductor:
            return f"{obj.matricula} ({conductor.user.first_name} {conductor.user.last_name})"
        return f"{obj.matricula} (Sin conductor)"


# --- SERIALIZERS DE ADMIN: CAMIONES ---
class CamionReadSerializer(serializers.ModelSerializer):
    """ Para LEER (GET) lista de camiones """
    sucursal_base = SucursalSerializer(read_only=True)
    # Mantenemos esto para que el modal de edición reciba el objeto
    conductor_asignado = ConductorSerializer(read_only=True, required=False)
    
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    capacidad_display = serializers.CharField(source='get_capacidad_display', read_only=True)
    
    # --- ¡ESTA ES LA SEGUNDA CORRECCIÓN CLAVE! ---
    # Reemplazamos el 'source' por un 'SerializerMethodField' que es más seguro.
    conductor_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Camion
        fields = ('id', 'matricula', 'capacidad', 'capacidad_display', 
                  'sucursal_base', 'conductor_asignado', 'conductor_nombre',
                  'estado', 'estado_display')
    
    # --- ¡NUEVA FUNCIÓN! ---
    def get_conductor_nombre(self, obj):
        """
        Devuelve el nombre completo del conductor o None si no está asignado.
        Gracias al 'select_related' en la vista, esto no genera más consultas DB.
        """
        if obj.conductor_asignado:
            user = obj.conductor_asignado.user
            full_name = f"{user.first_name or ''} {user.last_name or ''}".strip()
            return full_name or user.username
        # Devolvemos None. El frontend (React) lo convertirá en "No asignado".
        return None

class CamionWriteSerializer(serializers.ModelSerializer):
    """ Para CREAR (POST) y ACTUALIZAR (PUT/PATCH) camiones """
    class Meta:
        model = Camion
        # --- ¡NUEVO! Añadimos 'estado' ---
        fields = ('matricula', 'capacidad', 'estado', 'sucursal_base', 'conductor_asignado')


# --- SERIALIZERS DE ADMIN: EMPLEADOS ---

class EmpleadoReadSerializer(serializers.ModelSerializer):
    """ Para LEER (GET) lista de empleados """
    user = UserReadSerializer()
    sucursal = SucursalSerializer()
    
    # --- ¡NUEVO! Campo de estado legible ---
    cargo_display = serializers.CharField(source='get_cargo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Empleado
        # --- ¡NUEVO! Añadimos 'estado' y 'estado_display' ---
        fields = ('id', 'user', 'cargo', 'cargo_display', 'sucursal', 
                  'estado', 'estado_display')

class EmpleadoCreateSerializer(serializers.ModelSerializer):
    """ Para CREAR (POST) un empleado (y su User asociado) """
    user = UserSerializer(write_only=True) # Acepta datos de User anidados

    class Meta:
        model = Empleado
        # --- ¡NUEVO! Añadimos 'estado' ---
        fields = ('user', 'cargo', 'estado', 'sucursal')

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        
        # 1. Crear el User
        user = User.objects.create_user(
            username=user_data['username'],
            password=user_data['password'],
            email=user_data.get('email', ''),
            first_name=user_data.get('first_name', ''),
            last_name=user_data.get('last_name', ''),
            is_superuser=False,
            is_staff=True # Los empleados son staff para (potencialmente) entrar al admin
        )
        
        # 2. Crear el Empleado
        empleado = Empleado.objects.create(
            user=user,
            **validated_data # Pasa 'cargo', 'estado' y 'sucursal'
        )
        return empleado

class EmpleadoUpdateSerializer(serializers.ModelSerializer):
    """ Para ACTUALIZAR (PUT/PATCH) un empleado """
    # Hacemos el 'user' un serializer anidado para poder actualizarlo
    user = UserReadSerializer(read_only=True) # Leemos el user
    
    # Campos de User que permitimos actualizar (opcionales)
    username = serializers.CharField(write_only=True, required=False, source='user.username')
    email = serializers.EmailField(write_only=True, required=False, source='user.email')
    first_name = serializers.CharField(write_only=True, required=False, source='user.first_name')
    last_name = serializers.CharField(write_only=True, required=False, source='user.last_name')
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Empleado
        # --- ¡NUEVO! Añadimos 'estado' ---
        fields = ('id', 'user', 'cargo', 'estado', 'sucursal', 
                  'username', 'email', 'first_name', 'last_name', 'password')
        read_only_fields = ('sucursal',) # No permitimos cambiar la sucursal

    def update(self, instance, validated_data):
        user = instance.user
        
        # Actualizar campos de User si vienen en 'validated_data'
        user.username = validated_data.get('user.username', user.username)
        user.email = validated_data.get('user.email', user.email)
        user.first_name = validated_data.get('user.first_name', user.first_name)
        user.last_name = validated_data.get('user.last_name', user.last_name)
        
        # Actualizar contraseña si se proporcionó
        if 'password' in validated_data:
            user.set_password(validated_data['password'])
        
        user.save()

        # Actualizar campos de Empleado
        instance.cargo = validated_data.get('cargo', instance.cargo)
        instance.estado = validated_data.get('estado', instance.estado)
        instance.save()
        
        return instance


# --- SERIALIZERS DE PEDIDOS ---

class PedidoClienteSerializer(serializers.ModelSerializer):
    """ Serializer para Clientes (crear y ver MIS pedidos) """
    
    sucursal_origen_nombre = serializers.CharField(source='sucursal_origen.nombre', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Pedido
        # --- ¡CAMPOS AÑADIDOS A LA LISTA! ---
        fields = ('id', 'cliente', 'sucursal_origen', 'sucursal_origen_nombre', 'destino', 
                  'tipo_carga', 
                  'peso_kg', 'volumen_m3',
                  'detalles_carga', 'fecha_deseada', 'fecha_solicitud', 
                  'estado', 'estado_display', 'precio_cotizado', 'camion_asignado')
        
        read_only_fields = ('cliente', 'estado', 'precio_cotizado', 'camion_asignado')

class PedidoAdminSerializer(serializers.ModelSerializer):
    """ Serializer para Admins (LEER todos los pedidos) """
    
    # (Tus otros campos anidados como sucursal_origen, cliente_nombre, etc.)
    sucursal_origen = SucursalSerializer(read_only=True)
    camion_asignado = CamionDropdownSerializer(read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.user.username', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Pedido
        
        # Si aquí tienes una lista de campos, AÑADE 'peso_kg' y 'volumen_m3'
        fields = [
            'id', 
            'cliente_nombre', 
            'sucursal_origen', 
            'destino', 
            'tipo_carga',
            'peso_kg',      
            'volumen_m3',   
            'detalles_carga', 
            'fecha_deseada', 
            'fecha_solicitud',
            'estado', 
            'estado_display', 
            'costo_estimado', 
            'precio_cotizado', 
            'camion_asignado'
        ]
    
    class Meta:
        model = Pedido
        fields = '__all__' # Mostramos todo
        
class PedidoAdminUpdateSerializer(serializers.ModelSerializer):
    """ Serializer para Admins (ACTUALIZAR un pedido) """
    
    # Solo permitimos actualizar estos campos
    class Meta:
        model = Pedido
        fields = ('estado', 'costo_estimado', 'precio_cotizado', 'camion_asignado')