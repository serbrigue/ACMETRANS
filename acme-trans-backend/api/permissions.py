from rest_framework.permissions import BasePermission

class IsSuperUser(BasePermission):
    """
    Permiso personalizado para permitir solo a superusuarios.
    """
    def has_permission(self, request, view):
        # request.user es el usuario decodificado del token JWT
        return request.user and request.user.is_superuser

class IsCliente(BasePermission):
    """
    Permiso personalizado para permitir solo a usuarios
    autenticados que tengan un perfil de 'Cliente' asociado.
    """
    def has_permission(self, request, view):
        # 1. ¿Está logueado?
        # 2. ¿Tiene el atributo 'cliente_profile'? (Lo creamos en models.py)
        return request.user and request.user.is_authenticated and hasattr(request.user, 'cliente_profile')