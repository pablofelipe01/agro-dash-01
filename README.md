# Agro Sirius Dashboard

Dashboard web para visualizar y gestionar registros de siembra agricola con mapa interactivo y estadisticas en tiempo real.

## Caracteristicas

- **Mapa Interactivo**: Visualizacion de puntos GPS de siembras con Leaflet
- **Dibujo de Poligonos**: Define lotes y sectores directamente en el mapa
- **Integracion Google Sheets**: Sincronizacion de datos con hojas de calculo
- **Graficos Estadisticos**: Distribucion por cultivo, hectareas por lote, timeline
- **Filtros Dinamicos**: Filtra por cultivo o nodo de registro
- **Diseño Responsive**: Funciona en desktop, tablet y movil

## Cultivos Soportados

| Cultivo | Emoji | Color |
|---------|-------|-------|
| Cafe | ☕ | #8B4513 |
| Cacao | 🍫 | #6F4E37 |
| Citricos | 🍊 | #FF8C00 |

## Tecnologias

- **Frontend**: Next.js 14, React, TypeScript
- **Mapas**: Leaflet, React-Leaflet, Leaflet-Draw
- **Graficos**: Recharts
- **Estado**: Zustand
- **Estilos**: Tailwind CSS
- **Backend**: Google Sheets API

## Instalacion

```bash
# Clonar repositorio
git clone https://github.com/pablofelipe01/agro-dash-01.git
cd agro-dash-01

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tu GOOGLE_SPREADSHEET_ID

# Agregar credentials.json de Google Cloud en la raiz

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de Entorno

```env
GOOGLE_SPREADSHEET_ID=tu_spreadsheet_id
GOOGLE_SHEET_REGISTROS=Sheet1
GOOGLE_SHEET_LOTES=Lotes Definidos
```

## Estructura del Proyecto

```
app/
├── api/sheets/          # API routes para Google Sheets
├── components/
│   ├── Map/             # Componentes del mapa
│   ├── Stats/           # Graficos y estadisticas
│   ├── Forms/           # Formularios
│   └── UI/              # Componentes UI reutilizables
├── lib/                 # Utilidades, tipos, constantes
└── store/               # Estado global con Zustand
```

## Deployment en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno:
   - `GOOGLE_SPREADSHEET_ID`
   - `GOOGLE_CREDENTIALS_JSON` (contenido de credentials.json como string)
3. Deploy

## Licencia

MIT
