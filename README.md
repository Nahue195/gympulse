# GymPulse 💪

Una aplicación moderna y responsive para tracking de entrenamientos en el gimnasio, con feed de comunidad y seguimiento de progreso personal.

## Características principales

- ✅ **Sistema de autenticación** completo (registro, login, logout)
- 🏋️ **Registro de entrenamientos** con ejercicios, sets, reps y pesos
- 📊 **Feed de comunidad** para compartir entrenamientos
- 📏 **Seguimiento de medidas corporales** (peso, medidas, % grasa)
- 👤 **Perfil personal** con progreso y estadísticas
- 📅 **Plantillas de rutinas** (5 días configurables Lun-Vie)
- 📱 **Mobile-first** con navegación adaptativa (bottom tabs en mobile, sidebar en desktop)
- 🎨 **Design system** moderno con tema oscuro

## Stack tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Estilos**: CSS custom con variables CSS
- **Routing**: React Router v6
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **Fechas**: date-fns

## Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables (Button, Card, Input)
├── contexts/         # React contexts (AuthContext)
├── layouts/          # Layouts principales (MainLayout)
├── lib/              # Configuración de librerías (supabase)
├── pages/            # Páginas/vistas (Training, Statistics, Measures, Profile, Auth)
├── styles/           # Estilos globales
├── types/            # Tipos TypeScript
└── utils/            # Utilidades
```

## Instalación y configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve al **SQL Editor** en tu proyecto de Supabase
3. Copia y pega el contenido del archivo `supabase-schema.sql`
4. Ejecuta el script para crear todas las tablas, políticas RLS y datos iniciales

### 3. Configurar variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto (hay un `.env.example` como referencia):

```bash
cp .env.example .env
```

2. Edita `.env` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=tu_url_de_supabase_project
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

Puedes encontrar estas credenciales en:
- Settings → API → Project URL
- Settings → API → Project API keys → anon public

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Build para producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

## Uso de la aplicación

### Primera vez

1. Abre la aplicación y regístrate con tu email
2. Completa tu perfil con nombre de usuario único
3. Automáticamente se crearán 5 plantillas de rutinas (Lun-Vie) vacías

### Registro de entrenamientos

1. Ve a la pestaña **Entrenamiento**
2. Haz clic en **"Comenzar rutina"**
3. Elige una plantilla o empieza en blanco
4. Agrega ejercicios y registra sets/reps/pesos
5. Finaliza el entrenamiento

### Plantillas de rutinas

1. En **Entrenamiento**, selecciona **"Plantillas (Lun-Vie)"**
2. Edita cada día con tus ejercicios preferidos
3. Configura sets, reps y pesos por defecto
4. Al entrenar, solo modifica los pesos reales del día

### Feed de comunidad

- Ve a **Estadísticas** para ver quién fue al gym hoy
- Comparte tus entrenamientos públicos (o márcalos como privados)
- Ver check-ins y entrenamientos de otros usuarios

### Medidas corporales

1. Ve a **Medidas**
2. **"Agregar medidas"**
3. Registra peso, medidas corporales y % de grasa
4. Visualiza gráficos de progreso

## Design System

### Colores

```css
--color-bg: #0B0F14           /* Fondo principal */
--color-surface: #121A24      /* Tarjetas/superficies */
--color-primary: #4F8CFF      /* Acento principal */
--color-success: #34D399      /* Verde de éxito */
--color-warning: #FBBF24      /* Amarillo advertencia */
--color-error: #EF4444        /* Rojo error */
--color-text: #E5E7EB         /* Texto principal */
--color-text-muted: #9CA3AF   /* Texto secundario */
```

### Tipografía

- Fuente: Inter (Google Fonts)
- Tamaños: 12px - 28px (responsive)

## Base de datos

### Tablas principales

- **users**: Perfiles de usuario
- **exercises**: Catálogo de ejercicios (seed incluido)
- **workouts**: Sesiones de entrenamiento
- **workout_entries**: Ejercicios dentro de cada workout
- **measures**: Medidas corporales
- **gym_checkins**: Asistencia diaria al gym
- **routine_templates**: Plantillas de rutinas por día
- **template_exercises**: Ejercicios dentro de plantillas

### Seguridad (RLS)

Todas las tablas tienen políticas de Row Level Security configuradas:
- Los usuarios solo pueden ver/editar sus propios datos
- Los entrenamientos públicos son visibles para todos
- Los checkins son públicos (para el feed de comunidad)

## Próximas funcionalidades

El proyecto está estructurado y listo para expandir con:

- [ ] Implementación completa del flujo de Training (workout builder)
- [ ] Feed de comunidad interactivo
- [ ] Gráficos de progreso personal
- [ ] Sistema de PRs (personal records)
- [ ] Cálculo de volumen de entrenamiento
- [ ] Exportar datos a CSV
- [ ] Notificaciones
- [ ] Modo offline

## Scripts disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Lint con ESLint
```

## Contribuir

El proyecto sigue una arquitectura modular y escalable. Para agregar nuevas funcionalidades:

1. Crea componentes reutilizables en `src/components/`
2. Define tipos en `src/types/`
3. Usa el contexto de Auth para acceder al usuario
4. Sigue el design system establecido
5. Mantén la responsividad mobile-first

## Licencia

MIT

---

**Creado con ❤️ para la comunidad fitness**
