# Base de datos (Supabase)

Esquema **versionado y reproducible** de GymPulse. Antes esto vivía como ~25 `.sql`
sueltos en la raíz (y estaban en `.gitignore`, así que la base no se podía recrear).
Ahora está ordenado acá.

## Estructura

```
supabase/
├── migrations/    # Schema canónico. Ejecutar en orden alfabético de filename.
├── seeds/         # Datos iniciales (catálogo de ejercicios, alimentos).
├── diagnostics/   # Scripts de inspección/verificación. NO son parte del schema.
└── archive/       # Iteraciones viejas que quedaron superseded. Solo referencia.
```

## Cómo levantar la base desde cero

En el **SQL Editor** de Supabase, ejecutar en orden:

1. Todos los archivos de `migrations/` en orden alfabético de nombre
   (`0001` → `0005` → `0005b` → `0006` → … → `0014`).
2. Luego los seeds: `seeds/exercises.sql` y `seeds/nutrition_foods.sql`.

> `0005b` reconstruye la tabla `follows` y columnas de `users` que existían en
> producción pero nunca se habían guardado en un archivo. Va antes de `0006`
> porque `0008`/`0009` dependen de esos objetos.

> Con Supabase CLI: `supabase db push` tomando `migrations/` como fuente.

## Notas importantes

- **Rutinas:** el modelo actual es `routines` → `routine_days` → `routine_exercises`
  (creado en `0006_routines_schema.sql`). Las tablas viejas `routine_templates` /
  `template_exercises` del schema inicial quedaron **obsoletas** y son dropeadas por
  la migración 0006. Ver `archive/supabase-routines-update.sql` y
  `archive/supabase-routines-fixed.sql` para el historial de esa migración.
- **`archive/`** contiene versiones alternativas de seeds de ejercicios y de la
  creación de tablas de workout que fueron reemplazadas. No ejecutarlas.
- **`diagnostics/`** son consultas de solo lectura para debug; nunca en producción.

## Tablas que usa la app

`users`, `exercises`, `workouts`, `workout_entries`, `gym_checkins`, `measures`,
`routines`, `routine_days`, `routine_exercises`, `posts`, `post_likes`,
`post_comments`, `follows`, `conversations`, `messages`, `notifications`.
Storage bucket: `avatars`.

Nutrición (`0014`) ya tiene schema + seed pero la UI está en construcción.
