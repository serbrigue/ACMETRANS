# api/admin.py

from django.contrib import admin
# 1. IMPORTA EL MODELO 'Pedido'
from .models import Sucursal, Cliente, Empleado, Camion, Pedido

# --- 1. Admin para Sucursal (Corregido) ---
@admin.register(Sucursal)
class SucursalAdmin(admin.ModelAdmin):
    # 2. AÑADIMOS 'id'
    list_display = ('id', 'nombre', 'ciudad', 'direccion')
    search_fields = ('nombre', 'ciudad')

# --- 2. Admin para Camion (Corregido) ---
@admin.register(Camion)
class CamionAdmin(admin.ModelAdmin):
    # Añadimos 'id'
    list_display = ('id', 'matricula', 'get_capacidad_display', 'sucursal_base', 'conductor_asignado')
    list_filter = ('capacidad', 'sucursal_base')
    search_fields = ('matricula', 'conductor_asignado__user__username')
    autocomplete_fields = ['conductor_asignado', 'sucursal_base']

# --- 3. Admin para Empleado (Corregido) ---
@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    # Añadimos 'id'
    list_display = ('id', 'user', 'get_cargo_display', 'sucursal')
    list_filter = ('cargo', 'sucursal')
    search_fields = ('user__username', 'user__first_name', 'user__last_name')
    autocomplete_fields = ['user', 'sucursal']

# --- 4. Admin para Cliente (Corregido) ---
@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    # Añadimos 'id'
    list_display = ('id', 'user', 'nombre_empresa', 'telefono')
    search_fields = ('user__username', 'nombre_empresa')
    autocomplete_fields = ['user']

# --- 5. Admin para Pedido (¡AÑADIDO!) ---
@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'sucursal_origen', 'destino', 'estado', 'fecha_solicitud')
    list_filter = ('estado', 'sucursal_origen')
    search_fields = ('id', 'cliente__user__username', 'destino')
    # Añadimos autocompletar para que sea más fácil de usar
    autocomplete_fields = ['cliente', 'sucursal_origen', 'camion_asignado']