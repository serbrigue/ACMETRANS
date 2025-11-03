# acme_config/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

# 3. Importamos NUESTRA vista personalizada desde la app 'api'
from api.views import MyTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),

    # 4. Usamos NUESTRA vista para el endpoint de "obtener token"
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Mantenemos la original para "refrescar"
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/', include('api.urls')), 
]