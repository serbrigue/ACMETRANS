# api/urls.py

from django.urls import path
from .views import (
    RegisterView,
    MyTokenObtainPairView,
    CamionListCreateView,
    CamionDetailView,
    EmpleadoListCreateView,
    EmpleadoDetailView,
    MyPedidoListView,
    PedidoAdminListView,
    PedidoAdminDetailView,
    SucursalListView,
    SucursalDetailView, # Nueva
    ConductorListView,
    CamionDropdownListView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # --- AUTENTICACIÓN Y REGISTRO ---
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # --- RUTAS DE CLIENTE ---
    path('mis-pedidos/', MyPedidoListView.as_view(), name='mis-pedidos'),

    # --- RUTAS DE ADMIN (CRUD) ---
    path('admin/camiones/', CamionListCreateView.as_view(), name='admin-camiones-list'),
    path('admin/camiones/<int:pk>/', CamionDetailView.as_view(), name='admin-camion-detail'),
    
    path('admin/empleados/', EmpleadoListCreateView.as_view(), name='admin-empleados-list'),
    path('admin/empleados/<int:pk>/', EmpleadoDetailView.as_view(), name='admin-empleado-detail'),
    
    path('admin/pedidos/', PedidoAdminListView.as_view(), name='admin-pedidos-list'),
    path('admin/pedidos/<int:pk>/', PedidoAdminDetailView.as_view(), name='admin-pedido-detail'),

    # --- RUTAS PARA DROPDOWNS Y DATOS ---
    path('data/sucursales/', SucursalListView.as_view(), name='data-sucursales'),
    path('data/sucursales/<int:pk>/', SucursalDetailView.as_view(), name='data-sucursal-detail'), # Nueva
    path('data/conductores/', ConductorListView.as_view(), name='data-conductores'),
    path('data/camiones/', CamionDropdownListView.as_view(), name='data-camiones'),
]