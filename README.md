# Luzmila · Level Up

Plataforma personal del **Proyecto Luzmila**: un sistema vivo que junta el panel central, el mapa de 19 fases, Culta, Zorro, Voz, calendario, bitácora, Expediente, patrones y logros.

## Cómo funciona

- **Privacidad primero.** Este repositorio solo contiene el código y la estructura del proyecto. Los registros personales, el Expediente y las fotos viven en un archivo aparte (`luzmila-datos.json`) que se carga una vez desde la portada y queda guardado en el dispositivo. Nada se envía a ningún servidor.
- **Respaldo.** En *Datos* se descarga y se carga el respaldo `.json` (así se pasa el progreso entre celular y laptop).
- **Reglas del sistema.** Los puntos nunca se restan, la racha tolera un día en cero (regla de 48 h), retomar vale +3, y cada número explica de dónde sale.

## Desarrollo

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

Hecho con React, Vite, Three.js (react-three-fiber) y Motion.

## Agregar un módulo

1. Crear `src/pages/MiModulo.tsx`.
2. Registrarlo en `MUNDOS` y `ORDEN` (`src/data/estructura.ts`) y en `PAGINAS` (`src/App.tsx`).
3. Guardar sus datos con `agregar('miModulo.lista', item)` del store (`src/store.ts`).

## Publicación

El flujo `.github/workflows/deploy.yml` publica en GitHub Pages al hacer merge a `main` (requiere activar Pages con origen "GitHub Actions" en la configuración del repositorio).
