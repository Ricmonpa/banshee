# Banshee - "Que tu voz haga un libro"

Una aplicación web que convierte grabaciones de voz en libros estructurados usando IA.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14+ (App Router + TypeScript)
- **Estilos**: Tailwind CSS
- **Backend/DB**: Supabase (Auth, Postgres, Storage)
- **Transcripción**: Deepgram API
- **IA**: Google Gemini API
- **Estado**: Zustand
- **Audio**: react-mic

## 📋 Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y completa las variables:

```bash
cp .env.local.example .env.local
```

Necesitarás:
- **Supabase**: URL y Anon Key de tu proyecto
- **Deepgram**: API Key para transcripción
- **Gemini**: API Key de Google AI

### 3. Configurar Supabase

#### Crear las tablas en Supabase:

```sql
-- Tabla de proyectos (libros)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  generated_summary TEXT,
  generated_tone TEXT,
  generated_structure JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de viñetas (fragmentos de voz)
CREATE TABLE vignettes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  order_num INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  transcribed_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_vignettes_project_id ON vignettes(project_id);
CREATE INDEX idx_vignettes_order ON vignettes(project_id, order_num);
```

#### Configurar Storage:

1. Ve a Storage en tu dashboard de Supabase
2. Crea un bucket llamado `audio-recordings`
3. Configura las políticas de acceso según tus necesidades

#### Configurar RLS (Row Level Security):

```sql
-- Habilitar RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE vignettes ENABLE ROW LEVEL SECURITY;

-- Políticas para projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para vignettes
CREATE POLICY "Users can view own vignettes" ON vignettes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = vignettes.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own vignettes" ON vignettes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = vignettes.project_id 
      AND projects.user_id = auth.uid()
    )
  );
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

## 🎯 Flujo de Usuario

### 1. Landing Page (`/`)
- Diseño minimalista con logo y tagline
- Botón principal "Empezar a grabar"
- No requiere registro inicial

### 2. Grabación de Voz
- Modal con instrucciones claras
- Visualizador de ondas de audio
- Timer de grabación
- Subida automática a Supabase Storage

### 3. Preview Mágico (`/preview`)
- Transcripción automática con Deepgram
- Análisis con Gemini AI para generar:
  - Título provisional
  - Mensaje central
  - Tono de voz
  - Estructura en 3 partes
- Persistencia en localStorage
- CTA para crear cuenta

### 4. Registro (`/auth/register`)
- Formulario simple
- Sincronización automática de datos del preview
- Creación del primer proyecto

### 5. Dashboard del Proyecto (`/dashboard/project/[id]`)
- Vista de dos columnas:
  - Izquierda: Manuscrito con viñetas
  - Derecha: Coach IA para guiar la escritura

## 🔧 Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── upload-audio/route.ts
│   │   └── generate-preview/route.ts
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   └── project/[id]/page.tsx
│   ├── preview/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── VoiceRecorder.tsx
├── lib/
│   └── supabase.ts
└── store/
    └── useStore.ts
```

## 🎨 Filosofía de Diseño

**"Simple e Increíble"**
- Priorizar valor inmediato sobre registro
- El usuario experimenta la magia antes de crear cuenta
- Flujo conversacional: el usuario habla, no llena formularios

## 🚧 Próximos Pasos

1. **Dashboard completo** con lista de proyectos
2. **Coach IA avanzado** con preguntas del brief BANSHEEMINDTM
3. **Editor de viñetas** con drag & drop
4. **Exportación** a diferentes formatos
5. **Colaboración** y compartir proyectos

## 📝 Notas de Desarrollo

- Usar localStorage para persistencia temporal del preview
- API Routes de Next.js para simplicidad inicial
- Migrar operaciones pesadas a Edge Functions si es necesario
- Priorizar compatibilidad de audio en navegadores
- Implementar manejo de errores robusto para APIs externas