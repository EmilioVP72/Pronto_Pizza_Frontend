# Pronto Pizza

Este es el sistema completo de **Pronto Pizza**, compuesto por un Frontend moderno y un Backend robusto.

**Desarrollado por: EmilioVP72**

## Estructura del Proyecto

- `Pronto_Pizza_Frontend/`: Aplicación frontend desarrollada con React y Vite.
- `Pronto_Pizza_Backend/`: API backend desarrollada con Python y FastAPI.

## Requisitos Previos

- **Node.js** (versión 18 o superior recomendada para el frontend)
- **Python** (versión 3.10 o superior para el backend)
- **PostgreSQL** (configurado para el backend)

## Instalación y Configuración

### 1. Backend

1. Ve al directorio del backend:
   ```bash
   cd Pronto_Pizza_Backend
   ```
2. Crea un entorno virtual y actívalo:
   - **Windows:**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Configura las variables de entorno creando un archivo `.env` a partir de `.env.example`.

### 2. Frontend

1. Ve al directorio del frontend:
   ```bash
   cd Pronto_Pizza_Frontend
   ```
2. Instala las dependencias de Node:
   ```bash
   npm install
   ```

## Cómo Levantar el Sistema

Para ejecutar todo el sistema de manera local en desarrollo, necesitas levantar tanto el backend como el frontend.

### Levantar el Backend

Abre una terminal, activa tu entorno virtual dentro de `Pronto_Pizza_Backend` y ejecuta:

```bash
uvicorn app.main:app --reload
```
El backend estará disponible en `http://127.0.0.1:8000`.

### Levantar el Frontend

Abre otra terminal, ve al directorio `Pronto_Pizza_Frontend` y ejecuta:

```bash
npm run dev
```
El frontend se levantará normalmente en el puerto configurado por Vite (generalmente `http://localhost:5173`).
