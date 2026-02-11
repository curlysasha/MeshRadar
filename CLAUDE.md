# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MeshRadar — a modern web interface for Meshtastic mesh network management. Full-stack app with React frontend and FastAPI backend communicating via WebSocket and REST API. Supports Serial (USB), TCP (WiFi), and BLE (Bluetooth) connections to Meshtastic nodes.

## Development Commands

### Backend (Python 3.10+)
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py                  # Starts at http://localhost:8000

# Hot-reload mode
uvicorn main:app --reload
```

### Frontend (Node.js 18+)
```bash
cd frontend
npm install
npm run dev      # Dev server at http://localhost:5173 (proxies /api and /ws to backend)
npm run build    # TypeScript check + Vite production build → dist/
npm run preview  # Preview production build
```

### Docker
```bash
docker-compose up -d   # Full stack at http://localhost:5173
```

### Portable Windows EXE
```bash
build.bat   # PyInstaller bundle → dist/MeshRadar.exe
```

## Architecture

### Two-Process Stack
- **Frontend** (`frontend/`): React 18 + TypeScript SPA built with Vite
- **Backend** (`backend/`): FastAPI async server with Meshtastic Python library

### Data Flow
1. User connects via UI → `POST /api/connect` → `meshtastic_manager.py` establishes device connection
2. Device events → callbacks in `meshtastic_manager.py` → saved to SQLite via `database.py` → broadcast via `websocket_manager.py`
3. Frontend `useWebSocket.ts` hook receives events → updates Zustand store (`store/index.ts`) → React re-renders
4. Sending messages: React form → `useApi.ts` → `POST /api/message` → Meshtastic library → device

### Frontend Key Patterns
- **State**: Zustand store (`store/index.ts`) with localStorage persistence for tabs
- **Real-time**: `useWebSocket.ts` hook with exponential backoff reconnection (1s → 30s max)
- **API calls**: `useApi.ts` hook wrapping fetch to `/api/*` endpoints
- **Styling**: Tailwind CSS with CSS custom properties for theming (light/dark/retro)
- **Components**: Radix UI primitives in `components/ui/`, app components at `components/` root
- **i18n**: i18next with `locales/en.json` and `locales/ru.json`
- **Path alias**: `@/*` maps to `frontend/src/*`
- **TypeScript**: Strict mode with `noUnusedLocals` and `noUnusedParameters` enabled

### Backend Key Patterns
- **Async-first**: aiosqlite for non-blocking DB, async WebSocket broadcasting
- **Connection manager**: `meshtastic_manager.py` handles all device protocol logic
- **Database**: SQLite (`meshtastic.db`) with indexed `messages` and `settings` tables
- **Auto-reconnect**: Last connection type/address stored in `settings` table, restored on startup

### Vite Dev Proxy
During development, Vite proxies `/api` → `http://localhost:8000` and `/ws` → `ws://localhost:8000`, so both servers must be running.

## WebSocket Events (server → client)
- `connection_status` — device connect/disconnect
- `message` — incoming/outgoing chat message
- `ack` — message delivery confirmation
- `node_update` — node telemetry changes
- `traceroute` — route trace results
- `position` / `telemetry` — location and device metrics

## Internationalization
All user-facing strings go through i18next. Add keys to both `frontend/src/locales/en.json` and `frontend/src/locales/ru.json`. Use `useTranslation()` hook in components.

## License
GPLv3 + Commons Clause (free use/modify/distribute, no selling as paid service).
