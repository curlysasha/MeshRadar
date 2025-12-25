# Docker Deployment Guide

## Quick Start

### TCP Connection (default, no USB needed)
```bash
docker-compose up -d
```

Then open http://localhost:5173 and connect to your Meshtastic device via TCP in the application UI.

### USB/Serial Connection
If you want to use USB/Serial connection directly in Docker:

1. Find your USB device path:
   ```bash
   ls -la /dev/ttyUSB*    # Linux
   ```

2. Uncomment and update `docker-compose.yml`:
   ```yaml
   devices:
     - /dev/ttyUSB0:/dev/ttyUSB0
   privileged: true
   ```

3. Start the container:
   ```bash
   docker-compose up -d
   ```

### BLE (Bluetooth) Connection
For BLE connections, you can use the "Scan BLE Devices" feature in the web UI without special Docker configuration on most systems. However, for better BLE support on Linux with Docker:

1. Ensure Bluetooth service is running on host:
   ```bash
   sudo systemctl start bluetooth
   ```

2. **On Linux**: Make sure you're in the `bluetooth` group or use `sudo`:
   ```bash
   # Add current user to bluetooth group (requires logout/login)
   sudo usermod -a -G bluetooth $USER

   # Or run Docker with sudo
   sudo docker-compose up -d
   ```

3. For advanced BLE support, optionally add to `docker-compose.yml`:
   ```yaml
   privileged: true
   volumes:
     - /var/run/dbus:/var/run/dbus
     - /run/bluetooth:/run/bluetooth
   ```

4. Start the container:
   ```bash
   docker-compose up -d
   ```

**Note**: BLE typically works better over TCP connection. Use "Scan BLE Devices" feature in the UI to find your device and then connect via TCP if BLE connection is unstable.

## Environment Variables

Create a `.env` file in the project root:

```bash
# Port mapping (optional, default: 5173)
# COMPOSE_PORT_PREFIX=8000

# Database path (optional)
DATABASE_PATH=/app/backend/data/meshradar.db
```

## Managing Containers

### Start Container

**Background mode (recommended):**
```bash
docker-compose up -d
```
- Runs in background (`-d` flag)
- Terminal is free to use
- View logs with: `docker-compose logs -f meshradar`

**Foreground mode (for debugging):**
```bash
docker-compose up
```
- Shows logs in real-time
- Press `Ctrl+C` to stop
- Useful when troubleshooting issues

### Rebuild Image

Run this if you modified code in backend/frontend or Dockerfile:
```bash
docker-compose up -d --build
```
- `--build` flag rebuilds the Docker image before starting
- Takes longer but ensures your changes are included

### Other Commands

```bash
# Stop and remove containers
docker-compose down

# View logs in real-time
docker-compose logs -f meshradar

# View last 50 lines of logs
docker-compose logs --tail=50 meshradar

# Execute command in running container
docker-compose exec meshradar bash
```

## Data Persistence

All data (database, configuration) is stored in a Docker volume `meshradar_data`. This means your data persists even if you stop/remove the container.

To clean up volumes:
```bash
docker-compose down -v
```

## Troubleshooting

**Port already in use:**
Change the port in `docker-compose.yml`:
```yaml
ports:
  - "8000:80"  # Use 8000 instead of 5173
```

**USB device not found:**
- On Linux: Check permissions with `ls -la /dev/ttyUSB*`
- May need: `sudo usermod -a -G dialout $USER`
- On Windows WSL: Device paths like `COM3` might work

**Database errors:**
- Ensure volume has write permissions
- Check with: `docker-compose exec meshradar ls -la /app/backend/data`
