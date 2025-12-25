<div align="center">

# 📡 MeshRadar

**Modern web interface for Meshtastic mesh network management**

[![English](https://img.shields.io/badge/lang-English-blue.svg)](README.md)
[![Русский](https://img.shields.io/badge/lang-Русский-red.svg)](README.ru.md)

![hero](assets/hero.jpg)

[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-GPLv3%20%2B%20Commons%20Clause-blue?style=for-the-badge)](LICENSE)

### 📥 Download Latest Release

[![Download MeshRadar](https://img.shields.io/badge/Download-MeshRadar.exe-brightgreen?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/curlysasha/meshtastic-web/releases/latest)

[Features](#-features) • [Quick Start](#-quick-start) • [API](#-api) •
[Technologies](#-technologies)

</div>

---

## 📸 Interface

![interface](assets/interface.jpg)

### Traceroute Visualization

![traceroute](assets/traceroute.jpg)

---

## ✨ Features

| Feature             | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| 🔌 **Connection**   | Serial (USB) and TCP (WiFi) to Meshtastic nodes                |
| 💬 **Chat**         | Channels and direct messages with delivery confirmation (✓ ✓✓) |
| 📊 **Node List**    | All mesh nodes with telemetry (battery, SNR, position)         |
| 🗺️ **Network Map**  | Interactive map visualization of all nodes                     |
| 🛤️ **Traceroute**   | Message route visualization between nodes                      |
| 💾 **History**      | Messages stored in SQLite database                             |
| ⚡ **Real-time**    | WebSocket for instant updates                                  |
| 🌍 **Multilingual** | Russian and English with switcher                              |

---

## 🚀 Quick Start

### Requirements

- Python 3.10+
- Node.js 18+
- Meshtastic node (optional for UI testing)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

> Backend will start at http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Frontend will start at http://localhost:5173

---

## 📦 Portable Version

To build a standalone `.exe` file:

```bash
# Run in project root
build.bat
```

Output file: `dist/MeshRadar.exe`

---

## 🐳 Docker-compose Version

```bash
cp .env.example .env
```

Change your meshtastic device in `.env`

Run with logs:

```bash
docker-compose up --build
```

Or run as a daemon:

```bash
docker-compose up --build -d
```

> App will be avaliable at [http://localhost:5173](http://localhost:5173)

---

## 🔌 API

### REST Endpoints

| Method | Endpoint               | Description        |
| ------ | ---------------------- | ------------------ |
| `POST` | `/api/connect`         | Connect to node    |
| `POST` | `/api/disconnect`      | Disconnect         |
| `GET`  | `/api/status`          | Connection status  |
| `GET`  | `/api/nodes`           | List of nodes      |
| `GET`  | `/api/node/{id}`       | Node information   |
| `GET`  | `/api/channels`        | List of channels   |
| `POST` | `/api/message`         | Send message       |
| `POST` | `/api/traceroute/{id}` | Traceroute to node |
| `GET`  | `/api/messages`        | Message history    |

### WebSocket Events

```typescript
// Connection
ws://localhost:8000/ws

// Events (server → client)
{ type: "connection_status", data: { connected: boolean, ... } }
{ type: "message", data: { sender, text, channel, ... } }
{ type: "ack", data: { packet_id, status: "ack"|"nak" } }
{ type: "node_update", data: { id, user, position, ... } }
{ type: "traceroute", data: { route: [...], snr_towards: [...] } }
```

<details>
<summary><b>📝 API Usage Examples</b></summary>

**TCP Connection:**

```bash
curl -X POST http://localhost:8000/api/connect \
  -H "Content-Type: application/json" \
  -d '{"type": "tcp", "address": "192.168.1.100:4403"}'
```

**Serial Connection:**

```bash
curl -X POST http://localhost:8000/api/connect \
  -H "Content-Type: application/json" \
  -d '{"type": "serial", "address": "/dev/ttyUSB0"}'
```

**Send Message:**

```bash
curl -X POST http://localhost:8000/api/message \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello mesh!", "channel_index": 0}'
```

</details>

---

## 🛠 Technologies

<table>
<tr>
<td width="50%">

### Backend

- **FastAPI** — async web framework
- **meshtastic** — Python library
- **aiosqlite** — async SQLite
- **websockets** — real-time

</td>
<td width="50%">

### Frontend

- **React 18** + TypeScript
- **Tailwind CSS** — styling
- **Zustand** — state management
- **Radix UI** — accessible components

</td>
</tr>
</table>

---

## 📁 Project Structure

```
meshradar/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── meshtastic_manager.py # Connection management
│   ├── websocket_manager.py  # WebSocket broadcast
│   ├── database.py          # SQLite operations
│   └── schemas.py           # Pydantic models
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # React hooks
│   │   ├── store/           # Zustand state
│   │   └── locales/         # i18n translations
│   └── package.json
│
└── assets/                  # README images
```

---

## 👨‍💻 Development

```bash
# Backend with hot-reload
cd backend && uvicorn main:app --reload

# Frontend with hot-reload
cd frontend && npm run dev

# Production build
cd frontend && npm run build
```

---

<div align="center">

## 📄 License

GPLv3 + Commons Clause © 2024

This project is licensed under GPLv3 with Commons Clause - see the
[LICENSE](LICENSE) file for details.

> **Note**: The Commons Clause means you can use, modify, and distribute this
> software freely, but you cannot sell it or offer it as a paid service.

---

## 💝 Support the Project

If you find MeshRadar useful, please consider supporting its development:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/meshradar)
[![Boosty](https://img.shields.io/badge/Boosty-Support-F15F2C?style=for-the-badge)](https://boosty.to/curlysasha)

**Crypto donations:**

- **USDT TRC20**: `TL2rEf6iNzhC9Mb2grm6S5iq5JrMxYDEZG`
- **USDT TON**: `UQDyYPHzm6tb4KbpLIMo-KEWC2PmPHnU2Zj4tndLg9O70-w8`

---

**Made with ❤️ for Meshtastic community**

</div>
