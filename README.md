# Primo AI Studio — Demo v1.0

> Plataforma multi-tenant para generación de thumbnails/flyers con IA.
> **Primer cliente:** Torque Performance.
> **Demo mode:** 100% funcional sin pagar APIs (mocks pre-cargados).

---

## 🚀 Quick Start (5 minutos)

### 1. Instalar dependencias

```bash
cd primo-ai-studio
npm install
```

### 2. Configurar variables de entorno

Copia el ejemplo y rellena con tus keys de Clerk:

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_TU_KEY_DE_CLERK
CLERK_SECRET_KEY=sk_test_TU_SECRET_DE_CLERK

# Resto déjalo como está
DEMO_MODE=true
```

Las keys de Clerk las sacas de https://dashboard.clerk.com → tu app → API Keys.

### 3. Correr en local

```bash
npm run dev
```

Abre http://localhost:3000

### 4. Deploy a Vercel (URL en vivo para tu socio)

```bash
# Instalar Vercel CLI si no la tienes
npm i -g vercel

# Deploy
vercel deploy

# Cuando te pregunte, agrega las mismas env vars que tienes en .env.local
```

¡Listo! Tendrás una URL tipo `primo-ai-studio.vercel.app` para enseñarle a tu socio.

---

## 📁 Estructura del proyecto

```
primo-ai-studio/
├── app/
│   ├── layout.tsx                    Root layout + Clerk provider
│   ├── page.tsx                      Landing page
│   ├── globals.css
│   ├── sign-in/[[...sign-in]]/       Clerk sign-in
│   ├── sign-up/[[...sign-up]]/       Clerk sign-up
│   ├── [workspace]/                  ← Workspace dinámico (torque, etc.)
│   │   ├── layout.tsx                Co-branded layout
│   │   ├── page.tsx                  Dashboard
│   │   ├── crear/page.tsx            Generar thumbnail
│   │   ├── historial/page.tsx        Lista de generaciones
│   │   └── referencias/page.tsx      Referencias visuales
│   └── api/
│       ├── generate-prompts/         Claude (mocked)
│       └── generate-image/           Higgsfield (mocked)
├── components/
│   ├── CoBrandedHeader.tsx           Primo + workspace logo
│   ├── WorkspaceSidebar.tsx
│   └── CreateForm.tsx                ⭐ Core del producto
├── lib/
│   ├── data/
│   │   ├── workspaces.ts             ← Seed data (Torque pre-cargado)
│   │   └── generations-store.ts      ← localStorage para creaciones
│   ├── mocks/
│   │   ├── claude.ts                 Mock de Claude API
│   │   └── higgsfield.ts             Mock de Nano Banana
│   └── utils.ts
├── types/
│   └── index.ts
└── middleware.ts                     Clerk auth
```

---

## 🎬 Flujo de la demo

1. **Landing** (`/`) → muestra producto + CTA "Ver demo de Torque"
2. **Click "Ver demo de Torque"** → Clerk te pide login (si no estás logueado)
3. **Dashboard de Torque** (`/torque`) → Co-branded header (Primo izquierda, Torque derecha)
4. **Click "Crear"** (`/torque/crear`) → Form completo
5. **Sube imagen + título + selecciona estilos → "Generar prompts"**
6. **Loading 1-2s** → aparecen los 2 prompts (Estilo 2 + Estilo 3) en español
7. **Click "Generar imagen"** en cada uno → loading 3-5s → aparece la imagen
8. **"Guardar en historial"** → va a `/torque/historial`
9. **Historial** muestra todas las generaciones, incluyendo 2 pre-cargadas como ejemplo

---

## 🎨 Cómo se ve el co-branding

- **Top bar izquierda:** `PRIMO AI STUDIO` (siempre)
- **Top bar derecha:** Logo + nombre + industry del workspace activo
- **Acentos de color** del workspace en botones, sidebar activo, etc.
- **Tipografía display** (Bebas Neue) consistente

Esto comunica al cliente: "es mi plataforma, pero hecha por Primo".

---

## 🔄 Cuando paguen las APIs reales

1. Edita `.env.local`:
   ```bash
   DEMO_MODE=false
   ANTHROPIC_API_KEY=sk-ant-...
   HIGGSFIELD_API_KEY=...
   ```

2. Abre los 2 archivos de API y completa la sección "REAL MODE":
   - `app/api/generate-prompts/route.ts`
   - `app/api/generate-image/route.ts`

3. (Cuando esté listo Supabase) Reemplaza `lib/data/workspaces.ts` y `lib/data/generations-store.ts` con queries a Supabase. La interfaz no cambia, solo la implementación.

---

## 🆕 Agregar otro workspace (ej. El Rooster)

Edita `lib/data/workspaces.ts` y agrega al array `WORKSPACES`:

```typescript
{
  id: "ws_rooster",
  slug: "rooster",
  name: "El Rooster Bar",
  logo_url: null,
  brand_colors: {
    primary: "#1a0a0a",
    accent: "#d4af37",
    bg: "#0d0808",
    text: "#FFFFFF",
  },
  industry: "Restaurant-Bar",
  monthly_credit_limit: 300,
},
```

Y al array `WORKSPACE_STYLES` agrega sus estilos signature.

Accede en `/rooster` y listo.

---

## 🐛 Troubleshooting

**"Cannot find module '@clerk/nextjs'"**
→ Falta `npm install`. Corre `npm install` desde la raíz.

**Página en blanco después de login**
→ Verifica que `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/torque` esté en `.env.local`.

**Las imágenes no cargan**
→ Las URLs de Unsplash a veces tardan. Recarga.

**"Workspace not found"**
→ Asegúrate de usar `/torque` (no `/Torque` ni `/torque/`).

---

## 💡 Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Clerk (auth)
- Lucide React (iconos)
- localStorage (persistencia demo)
- Mocks de Claude + Higgsfield

---

## 📞 Siguiente paso

1. Corre la demo local: `npm run dev`
2. Verifica que todo funciona en `http://localhost:3000`
3. Deploy a Vercel: `vercel deploy`
4. Comparte la URL con tu socio
5. ¡Cierra el trato! 💰
