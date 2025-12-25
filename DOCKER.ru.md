# Руководство по развёртыванию в Docker

## Быстрый старт

### TCP подключение (по умолчанию, USB не требуется)
```bash
docker-compose up -d
```

Затем откройте http://localhost:5173 и подключитесь к вашему устройству Meshtastic через TCP в интерфейсе приложения.

### USB/Serial подключение
Если вы хотите использовать USB/Serial подключение прямо в Docker:

1. Найдите путь вашего USB устройства:
   ```bash
   ls -la /dev/ttyUSB*    # Linux
   ```

2. Раскомментируйте и обновите `docker-compose.yml`:
   ```yaml
   devices:
     - /dev/ttyUSB0:/dev/ttyUSB0
   privileged: true
   ```

3. Запустите контейнер:
   ```bash
   docker-compose up -d
   ```

### BLE (Bluetooth) подключение
Для подключения по BLE вы можете использовать функцию "Сканирование BLE" в веб-интерфейсе без специальной конфигурации Docker на большинстве систем. Однако, для улучшенной поддержки BLE на Linux:

1. Убедитесь, что служба Bluetooth запущена на хосте:
   ```bash
   sudo systemctl start bluetooth
   ```

2. **На Linux**: Убедитесь, что вы находитесь в группе `bluetooth` или используйте `sudo`:
   ```bash
   # Добавить текущего пользователя в группу bluetooth (требуется выход и вход)
   sudo usermod -a -G bluetooth $USER

   # Или запустить Docker с sudo
   sudo docker-compose up -d
   ```

3. Для расширенной поддержки BLE, опционально добавьте в `docker-compose.yml`:
   ```yaml
   privileged: true
   volumes:
     - /var/run/dbus:/var/run/dbus
     - /run/bluetooth:/run/bluetooth
   ```

4. Запустите контейнер:
   ```bash
   docker-compose up -d
   ```

**Примечание**: BLE работает лучше через TCP подключение. Используйте функцию "Сканирование BLE" в интерфейсе для поиска устройства, затем подключитесь через TCP если BLE подключение нестабильно.

## Переменные окружения

Создайте файл `.env` в корне проекта:

```bash
# Маппинг портов (опционально, по умолчанию: 5173)
# COMPOSE_PORT_PREFIX=8000

# Путь к базе данных (опционально)
DATABASE_PATH=/app/backend/data/meshradar.db
```

## Управление контейнерами

### Запуск контейнера

**Фоновый режим (рекомендуется):**
```bash
docker-compose up -d
```
- Запускает в фоне (флаг `-d`)
- Терминал свободен для других команд
- Посмотреть логи: `docker-compose logs -f meshradar`

**Foreground режим (для отладки):**
```bash
docker-compose up
```
- Показывает логи в реальном времени
- Нажмите `Ctrl+C` для остановки
- Полезно при решении проблем

### Пересборка образа

Запустите если изменили код в backend/frontend или Dockerfile:
```bash
docker-compose up -d --build
```
- Флаг `--build` пересобирает Docker образ перед запуском
- Занимает больше времени, но гарантирует наличие ваших изменений

### Другие команды

```bash
# Остановить и удалить контейнеры
docker-compose down

# Просмотреть логи в реальном времени
docker-compose logs -f meshradar

# Просмотреть последние 50 строк логов
docker-compose logs --tail=50 meshradar

# Выполнить команду в работающем контейнере
docker-compose exec meshradar bash
```

## Сохранение данных

Все данные (база данных, конфигурация) хранятся в Docker volume `meshradar_data`. Это означает, что ваши данные сохранятся даже если вы остановите или удалите контейнер.

Чтобы очистить volumes:
```bash
docker-compose down -v
```

## Решение проблем

**Порт уже используется:**
Измените порт в `docker-compose.yml`:
```yaml
ports:
  - "8000:80"  # Используйте 8000 вместо 5173
```

**USB устройство не найдено:**
- На Linux: Проверьте права доступа с помощью `ls -la /dev/ttyUSB*`
- Может потребоваться: `sudo usermod -a -G dialout $USER`
- На Windows WSL: Пути вроде `COM3` могут сработать

**Ошибки базы данных:**
- Убедитесь, что volume имеет права на запись
- Проверьте с помощью: `docker-compose exec meshradar ls -la /app/backend/data`
