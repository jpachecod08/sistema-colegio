import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = 'admin'
email = 'admin@colegio.com'
password = 'admin123'

if not User.objects.filter(username=username).exists():
    user = User.objects.create_superuser(username, email, password)
    user.role = 'admin'  # Forzar rol admin
    user.save()
    print(f'Superuser {username} created successfully with admin role')
else:
    user = User.objects.get(username=username)
    if user.role != 'admin':
        user.role = 'admin'
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print(f'User {username} updated to admin role')
    else:
        print(f'Superuser {username} already exists with admin role')
