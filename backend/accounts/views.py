from rest_framework.generics import CreateAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserRegisterSerializer, CustomTokenSerializer

class UserRegisterView(CreateAPIView):
    queryset=User.objects.all()
    serializer_class=UserRegisterSerializer

class UserLoginView(TokenObtainPairView):
    serializer_class=CustomTokenSerializer

