# Инструкция по развертыванию в продакшене

## 1. Подготовка к развертыванию

### Настройка appsettings.Production.json

Создайте файл `appsettings.Production.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=your-production-db-host;Database=student_tickets_system;Username=your-username;Password=your-secure-password;SSL Mode=Require;"
  },
  "JwtSettings": {
    "SecretKey": "YourVerySecureSecretKeyForProductionAtLeast64CharactersLong!",
    "Issuer": "StudentTicketsSystem",
    "Audience": "StudentTicketsSystemUsers",
    "ExpiryMinutes": 480
  },
  "AllowedHosts": "yourdomain.com,www.yourdomain.com"
}
```

### Настройка CORS для продакшена

В `Program.cs` замените CORS политику:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins("https://yourdomain.com", "https://www.yourdomain.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

## 2. Развертывание на Linux сервере

### Установка .NET 8.0

```bash
# Добавление репозитория Microsoft
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# Установка .NET 8.0
sudo apt-get update
sudo apt-get install -y dotnet-sdk-8.0
```

### Установка PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Настройка базы данных

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE student_tickets_system;
CREATE USER tickets_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE student_tickets_system TO tickets_user;
\q
```

### Создание пользователя для приложения

```bash
sudo adduser --system --group ticketsapp
sudo mkdir /var/www/ticketsapp
sudo chown ticketsapp:ticketsapp /var/www/ticketsapp
```

### Копирование файлов

```bash
# Копируйте файлы проекта в /var/www/ticketsapp
sudo cp -r /path/to/your/project/* /var/www/ticketsapp/
sudo chown -R ticketsapp:ticketsapp /var/www/ticketsapp
```

### Настройка systemd сервиса

Создайте файл `/etc/systemd/system/ticketsapp.service`:

```ini
[Unit]
Description=Student Tickets System API
After=network.target

[Service]
Type=notify
User=ticketsapp
Group=ticketsapp
WorkingDirectory=/var/www/ticketsapp
ExecStart=/usr/bin/dotnet /var/www/ticketsapp/ithubsec.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=ticketsapp
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:5000

[Install]
WantedBy=multi-user.target
```

### Запуск сервиса

```bash
sudo systemctl daemon-reload
sudo systemctl enable ticketsapp
sudo systemctl start ticketsapp
sudo systemctl status ticketsapp
```

## 3. Настройка Nginx (опционально)

### Установка Nginx

```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Настройка конфигурации

Создайте файл `/etc/nginx/sites-available/ticketsapp`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Активация конфигурации

```bash
sudo ln -s /etc/nginx/sites-available/ticketsapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 4. Настройка SSL с Let's Encrypt

### Установка Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### Получение SSL сертификата

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 5. Мониторинг и логи

### Просмотр логов приложения

```bash
sudo journalctl -u ticketsapp -f
```

### Настройка ротации логов

Создайте файл `/etc/logrotate.d/ticketsapp`:

```
/var/log/ticketsapp/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 ticketsapp ticketsapp
    postrotate
        systemctl reload ticketsapp
    endscript
}
```

## 6. Резервное копирование

### Скрипт резервного копирования базы данных

Создайте файл `/usr/local/bin/backup-tickets-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/ticketsapp"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="student_tickets_system"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U tickets_user $DB_NAME > $BACKUP_DIR/tickets_$DATE.sql

# Удаление старых резервных копий (старше 30 дней)
find $BACKUP_DIR -name "tickets_*.sql" -mtime +30 -delete
```

Сделайте скрипт исполняемым:

```bash
sudo chmod +x /usr/local/bin/backup-tickets-db.sh
```

### Настройка автоматического резервного копирования

Добавьте в crontab:

```bash
sudo crontab -e
```

Добавьте строку:

```
0 2 * * * /usr/local/bin/backup-tickets-db.sh
```

## 7. Обновление приложения

### Скрипт обновления

Создайте файл `/usr/local/bin/update-ticketsapp.sh`:

```bash
#!/bin/bash
APP_DIR="/var/www/ticketsapp"
BACKUP_DIR="/var/backups/ticketsapp"

# Создание резервной копии
sudo systemctl stop ticketsapp
cp -r $APP_DIR $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S)

# Обновление приложения
cd $APP_DIR
dotnet restore
dotnet build
dotnet ef database update

# Запуск приложения
sudo systemctl start ticketsapp
sudo systemctl status ticketsapp
```

## 8. Безопасность

### Настройка файрвола

```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Ограничение доступа к базе данных

В `/etc/postgresql/*/main/pg_hba.conf`:

```
# Ограничить доступ только для localhost
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

### Регулярные обновления

```bash
sudo apt update
sudo apt upgrade
```

## 9. Мониторинг производительности

### Установка htop

```bash
sudo apt install htop
```

### Мониторинг дискового пространства

```bash
df -h
du -sh /var/www/ticketsapp
```

### Мониторинг использования памяти

```bash
free -h
ps aux --sort=-%mem | head
```
