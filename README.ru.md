<div align="center">

# 📡 MeshRadar

**Современный веб-интерфейс для управления Meshtastic mesh-сетью**

[![English](https://img.shields.io/badge/lang-English-blue.svg)](README.md)
[![Русский](https://img.shields.io/badge/lang-Русский-red.svg)](README.ru.md)

![hero](assets/hero.jpg)

[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-GPLv3%20%2B%20Commons%20Clause-blue?style=for-the-badge)](LICENSE)

### 📥 Скачать последнюю версию

[![Скачать MeshRadar](https://img.shields.io/badge/Скачать-MeshRadar.exe-brightgreen?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/curlysasha/meshtastic-web/releases/latest)

[Возможности](#-возможности) • [Быстрый старт](#-быстрый-старт) • [API](#-api) •
[Технологии](#-технологии)

</div>

---

## 📸 Интерфейс

![interface](assets/interface.jpg)

### Визуализация трассировки

![traceroute](assets/traceroute.jpg)

---

## ✨ Возможности

| Функция                | Описание                                                   |
| ---------------------- | ---------------------------------------------------------- |
| 🔌 **Подключение**     | Serial (USB), TCP (WiFi) и BLE (Bluetooth) к Meshtastic нодам |
| 💬 **Чат**             | Каналы и личные сообщения с подтверждением доставки (✓ ✓✓) |
| 📊 **Список нод**      | Все ноды в mesh с телеметрией (батарея, SNR, позиция)      |
| 🗺️ **Карта сети**      | Визуализация всех нод на интерактивной карте               |
| 🛤️ **Traceroute**      | Визуализация маршрута сообщений между нодами               |
| 💾 **История**         | Сообщения сохраняются в SQLite                             |
| ⚡ **Real-time**       | WebSocket для мгновенных обновлений                        |
| 🌍 **Мультиязычность** | Русский и English с переключателем                         |

---

## 🚀 Быстрый старт

### Требования

- Python 3.10+
- Node.js 18+
- Meshtastic нода (опционально для тестирования UI)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

> Backend запустится на http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Frontend запустится на http://localhost:5173

---

## 📦 Портативная версия

Для сборки автономного `.exe` файла:

```bash
# Запустите в корне проекта
build.bat
```

Готовый файл: `dist/MeshRadar.exe`

---

## 🐳 Docker развёртывание

Полное руководство по настройке Docker см. в [DOCKER.ru.md](DOCKER.ru.md)

**Быстрый старт:**

```bash
docker-compose up -d
```

Затем откройте http://localhost:5173 и подключитесь к вашему устройству Meshtastic через интерфейс приложения.

> **Примечание**: USB подключение опционально. По умолчанию Docker запускается без маппинга USB устройств.
> Для включения USB раскомментируйте секцию `devices` в `docker-compose.yml`.

---

## 🔌 API

### REST Endpoints

| Method | Endpoint               | Описание            |
| ------ | ---------------------- | ------------------- |
| `POST` | `/api/connect`         | Подключение к ноде  |
| `POST` | `/api/disconnect`      | Отключение          |
| `GET`  | `/api/status`          | Статус подключения  |
| `GET`  | `/api/ble-scan`        | Сканирование BLE    |
| `GET`  | `/api/nodes`           | Список нод          |
| `GET`  | `/api/node/{id}`       | Информация о ноде   |
| `GET`  | `/api/channels`        | Список каналов      |
| `POST` | `/api/message`         | Отправить сообщение |
| `POST` | `/api/traceroute/{id}` | Traceroute до ноды  |
| `GET`  | `/api/messages`        | История сообщений   |

### WebSocket Events

```typescript
// Подключение
ws://localhost:8000/ws

// События (server → client)
{ type: "connection_status", data: { connected: boolean, ... } }
{ type: "message", data: { sender, text, channel, ... } }
{ type: "ack", data: { packet_id, status: "ack"|"nak" } }
{ type: "node_update", data: { id, user, position, ... } }
{ type: "traceroute", data: { route: [...], snr_towards: [...] } }
```

<details>
<summary><b>📝 Примеры использования API</b></summary>

**Подключение по TCP:**

```bash
curl -X POST http://localhost:8000/api/connect \
  -H "Content-Type: application/json" \
  -d '{"type": "tcp", "address": "192.168.1.100:4403"}'
```

**Подключение по Serial:**

```bash
curl -X POST http://localhost:8000/api/connect \
  -H "Content-Type: application/json" \
  -d '{"type": "serial", "address": "/dev/ttyUSB0"}'
```

**Подключение по BLE (сначала сканируем):**

```bash
# Сканирование доступных BLE устройств
curl http://localhost:8000/api/ble-scan

# Подключение к BLE устройству
curl -X POST http://localhost:8000/api/connect \
  -H "Content-Type: application/json" \
  -d '{"type": "ble", "address": "F4:12:FA:D0:45:AB"}'
```

> **Примечание**: Сканирование BLE может не работать на всех версиях прошивки. Проверенные рабочие версии: до v2.7.14 включительно. Если у вас возникают проблемы со сканированием BLE на прошивке v2.7.15 или новее, рекомендуется понизить версию прошивки до v2.7.14.

**Отправка сообщения:**

```bash
curl -X POST http://localhost:8000/api/message \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello mesh!", "channel_index": 0}'
```

</details>

---

## 🛠 Технологии

<table>
<tr>
<td width="50%">

### Backend

- **FastAPI** — async web framework
- **meshtastic** — Python библиотека
- **aiosqlite** — async SQLite
- **websockets** — real-time

</td>
<td width="50%">

### Frontend

- **React 18** + TypeScript
- **Tailwind CSS** — стилизация
- **Zustand** — state management
- **Radix UI** — accessible компоненты

</td>
</tr>
</table>

---

## 📁 Структура проекта

```
meshradar/
├── backend/
│   ├── main.py              # FastAPI приложение
│   ├── meshtastic_manager.py # Управление подключением
│   ├── websocket_manager.py  # WebSocket broadcast
│   ├── database.py          # SQLite операции
│   └── schemas.py           # Pydantic модели
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   ├── hooks/           # React hooks
│   │   ├── store/           # Zustand state
│   │   └── locales/         # i18n переводы
│   └── package.json
│
└── assets/                  # Изображения для README
```

---

## 👨‍💻 Разработка

```bash
# Backend с hot-reload
cd backend && uvicorn main:app --reload

# Frontend с hot-reload
cd frontend && npm run dev

# Build для production
cd frontend && npm run build
```

---

<div align="center">

## 📄 Лицензия

GPLv3 + Commons Clause © 2024

Проект распространяется под лицензией GPLv3 с Commons Clause - подробности в
файле [LICENSE](LICENSE).

> **Примечание**: Commons Clause означает, что вы можете свободно использовать,
> изменять и распространять это ПО, но не можете продавать его или предлагать
> как платную услугу.

---

## 💝 Поддержать проект

Если MeshRadar оказался полезным, вы можете поддержать его развитие:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Поддержать-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/meshradar)
[![Boosty](https://img.shields.io/badge/Boosty-Поддержать-F15F2C?style=for-the-badge)](https://boosty.to/curlysasha)

**Криптовалюта:**

- **USDT TRC20**: `TL2rEf6iNzhC9Mb2grm6S5iq5JrMxYDEZG`
- **USDT TON**: `UQDyYPHzm6tb4KbpLIMo-KEWC2PmPHnU2Zj4tndLg9O70-w8` License ©
  2024

---

**Made with ❤️ for Meshtastic community**

</div>
