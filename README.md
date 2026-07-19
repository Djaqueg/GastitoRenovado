# GAStito — Finanzas del Hogar

Aplicación web de gestión financiera familiar construida con **Next.js**, **Tailwind CSS** y **Google Sheets** como base de datos, conectada mediante **Google Apps Script** como API REST.

## Características

- Autenticación por PIN de 4 dígitos
- Dashboard mensual con ingresos, gastos y balance
- Tabla de últimos 15 movimientos
- Formulario CRUD (crear, editar, eliminar) en modal
- Formato de moneda chilena (CLP)
- Diseño moderno con paleta verde

## Requisitos

- Node.js 18+ y npm
- Cuenta de Google
- Google Sheet para almacenar los datos

## Configuración

### 1. Google Sheet

1. Crea una nueva planilla en [Google Sheets](https://sheets.google.com)
2. Renombra la primera pestaña a **Movimientos**
3. Agrega estos encabezados en la fila 1:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| id | fecha | tipo | categoria | subcategoria | monto | medio_pago | detalle | fecha_registro |

4. Copia el **ID de la planilla** desde la URL:
   `https://docs.google.com/spreadsheets/d/1Mac_BaYC1U_3DEyjkcQaGoqbdh0XDpL1RUYHvPAaulo/edit`

### 2. Google Apps Script

1. En tu planilla, ve a **Extensiones → Apps Script**
2. Borra el contenido predeterminado y pega el código de [`gas/Code.gs`](gas/Code.gs)
3. Reemplaza `TU_SHEET_ID_AQUI` con el ID de tu planilla
4. Guarda el proyecto (Ctrl+S)
5. Haz clic en **Implementar → Nueva implementación**
6. Tipo: **Aplicación web**
7. Ejecutar como: **Yo**
8. Quién tiene acceso: **Cualquier persona**
9. Haz clic en **Implementar** y autoriza los permisos
10. Copia la **URL de la aplicación web** (termina en `/exec`)

### 3. Variables de entorno

1. Copia el archivo de ejemplo:

```bash
cp .env.local.example .env.local
```

2. Edita `.env.local`:

```env
AUTH_PIN=1234
NEXT_PUBLIC_GAS_API_URL=https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec
```

- `AUTH_PIN`: PIN de 4 dígitos para acceder a la app (solo servidor)
- `NEXT_PUBLIC_GAS_API_URL`: URL del Web App de Apps Script

### 4. Instalar y ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) e ingresa tu PIN.

## Estructura del proyecto

```
Gastito/
├── app/                    # Páginas y API routes (Next.js App Router)
├── components/             # Componentes React
├── lib/                    # Cliente GAS, tipos, formato, categorías
├── gas/                    # Código de Google Apps Script
└── .env.local.example      # Plantilla de variables de entorno
```

## API de Google Apps Script

| Método | Acción | Descripción |
|--------|--------|-------------|
| GET | `list` | Lista movimientos (`limit`, `month`, `year`) |
| GET | `summary` | Resumen mensual (`month`, `year`) |
| GET | `get` | Obtener un movimiento por `id` |
| POST | `create` | Crear movimiento |
| POST | `update` | Actualizar movimiento |
| POST | `delete` | Eliminar movimiento |

## Despliegue en producción

```bash
npm run build
npm start
```

Para Vercel u otro hosting, configura las variables de entorno `AUTH_PIN` y `NEXT_PUBLIC_GAS_API_URL` en el panel del proveedor.

## Seguridad

- El PIN se valida en el servidor (API route `/api/auth/verify`)
- La sesión se mantiene en `sessionStorage` del navegador
- No subas `.env.local` al repositorio

## Licencia

Uso privado — Finanzas del Hogar.
