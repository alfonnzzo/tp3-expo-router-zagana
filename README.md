# Mantenimiento IPF — TP3 Permisos móviles

App hecha con **Expo SDK 57**, **Expo Router** y TypeScript para que alumnos y docentes del Instituto Politécnico Formosa reporten desperfectos del edificio. Usa **cámara**, **ubicación** y **notificaciones**, y elige fotos **sin permiso de galería**.

- Respuestas de las Partes A a F: [`RESPUESTAS.md`](./RESPUESTAS.md)
- Consignas: `TP3 — Permisos móviles: Android, iOS y Expo` (Instituto Politécnico Formosa)

## Cómo correrla

```bash
npm install
npx expo start              # Expo Go: sirve para cámara, ubicación en primer plano y notificaciones locales
npx expo run:android        # development build (necesaria para ver los textos de propósito y los permisos reales)
npx expo run:ios            # idem en iOS (requiere macOS)
```

> Los datos (reportes, avisos, interruptor de avisos) viven **en memoria**: se pierden al cerrar la app. El TP no pide persistencia.

## Árbol de carpetas (`src/app`)

```
src/app
├── _layout.tsx               Stack raíz (el modal de permisos usa presentation: "modal")
├── (tabs)                    grupo de pestañas: no suma segmento a la URL
│   ├── _layout.tsx           pestañas Reportes / Avisos / Permisos
│   ├── index.tsx             /            Reportes (lista + "Nuevo reporte")
│   ├── avisos.tsx            /avisos      bandeja de avisos (alternativa a las notificaciones)
│   └── permisos.tsx          /permisos    panel con el estado de cada permiso
├── reporte
│   ├── nuevo.tsx             /reporte/nuevo       formulario (no pide ningún permiso al abrir)
│   ├── escanear.tsx          /reporte/escanear    QR del aula (cámara, cuatro estados)
│   ├── foto.tsx              /reporte/foto        sacar foto o elegir de la galería
│   ├── ubicacion.tsx         /reporte/ubicacion   ubicación actual o sector a mano
│   └── [id].tsx              /reporte/[id]        detalle + "Simular resolución"
├── permisos
│   └── [recurso].tsx         /permisos/[recurso]  pantalla previa (modal)
└── ajustes-app.tsx           /ajustes-app         interruptor "Avisarme cuando se resuelva mi reporte"
```

Otras carpetas:

```
src/components   Pantalla, Boton, Campo, Insignia, Explicacion (pantalla previa), AvisoBloqueado
src/hooks        usePermiso (hook unificado), useRevisarAlVolver (AppState), useAlmacen
src/lib          permisos.ts (consultar/pedir/traducir), ubicacion.ts, notificaciones.ts, almacen.ts, catalogo.ts
```

## `app.json`: bloque `plugins` comentado

JSON no admite comentarios; cada línea se explica abajo.

```jsonc
"plugins": [
  "expo-router",
  ["expo-splash-screen", { /* …sin cambios… */ }],
  ["expo-camera", {
    // NSCameraUsageDescription: texto propio con el molde "Usamos tu [dato] para [beneficio]"
    "cameraPermission": "Usamos tu cámara para leer el QR de la puerta del aula y sacar la foto del desperfecto.",
    "microphonePermission": false,   // iOS: no se agrega NSMicrophoneUsageDescription (la app no graba video)
    "recordAudioAndroid": false      // Android: no se agrega RECORD_AUDIO
  }],
  ["expo-location", {
    "locationWhenInUsePermission": "Usamos tu ubicación para marcar dónde está el desperfecto dentro del instituto.",
    "locationAlwaysAndWhenInUsePermission": false,  // solo primer plano: sin claves "Siempre"
    "locationAlwaysPermission": false,
    "motionUsagePermission": false                   // no usamos actividad de movimiento
  }],
  ["expo-image-picker", {
    "photosPermission": "Usamos el selector de fotos del sistema para que adjuntes la foto del desperfecto a tu reporte.",
    "cameraPermission": "Usamos tu cámara para leer el QR de la puerta del aula y sacar la foto del desperfecto.", // mismo texto que expo-camera (ambos escriben la misma clave)
    "microphonePermission": false
  }],
  "expo-notifications"   // iOS: las notificaciones no llevan texto de propósito; Android 13+: POST_NOTIFICATIONS
]
```

### Mínimo privilegio: `android.blockedPermissions`

| Permiso bloqueado | Por qué se bloquea |
|---|---|
| `SYSTEM_ALERT_WINDOW` | La app no dibuja sobre otras apps. |
| `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` | Las fotos se eligen con el selector del sistema y se guardan en el caché propio. |
| `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` | **No se declara acceso a la galería**: el selector del sistema no lo necesita. |
| `RECORD_AUDIO` | La app no graba audio ni video. |
| `ACCESS_BACKGROUND_LOCATION` | La ubicación se usa solo en primer plano. |

## Tabla de permisos

| Recurso | Módulo | Dónde / cuándo se pide | Alternativa si lo deniegan |
|---|---|---|---|
| Cámara (QR) | `expo-camera` (`CameraView`) | Al entrar a `/reporte/escanear`, tras tocar "Escanear QR" y "Continuar". | Escribir el código del aula a mano. |
| Cámara (foto) | `expo-camera` | En `/reporte/foto`, al tocar "Sacar foto" y "Continuar". | "Elegir de la galería" con el selector del sistema. |
| Galería | `expo-image-picker` (`launchImageLibraryAsync`) | **No se pide permiso.** | — |
| Ubicación (primer plano) | `expo-location` | En `/reporte/ubicacion`, al tocar "Usar mi ubicación actual" y "Continuar". | Elegir el sector a mano. Si es aproximada se muestra "Ubicación aproximada", sin coordenadas. |
| Notificaciones | `expo-notifications` | En `/ajustes-app`, **solo** al activar el interruptor (en Android se crea antes el canal `reportes`). | El aviso llega a `/avisos`. |

## Cómo está resuelto cada requisito

1. **`usePermiso(recurso)`** (`src/hooks/usePermiso.ts`) devuelve `estado` (`'cargando' | 'concedido' | 'preguntable' | 'bloqueado'`), `parcial`, `detalle`, `pedir()` y `abrirAjustes()`. El estado se comparte entre pantallas y se vuelve a leer al volver de Ajustes con `AppState` (`useRevisarAlVolver`).
2. **Escáner con cuatro estados**: cargando → cámara → pantalla previa con "Continuar" → aviso de bloqueado con "Abrir Ajustes" y código a mano.
3. **Foto sin permiso de galería**: `launchImageLibraryAsync`; no se declara `READ_MEDIA_IMAGES`.
4. **Ubicación respetuosa**: solo primer plano; si es aproximada no se guardan ni muestran coordenadas.
5. **Notificaciones en contexto**: canal `reportes` en Android antes de pedir; "Simular resolución" programa una notificación local a los 10 s (si hay permiso e interruptor activo) y siempre deja el aviso en `/avisos`.
6. **Pantallas previas**: `Explicacion` tiene un único botón "Continuar", sin "Ahora no" ni "Cerrar". En `/reporte/escanear`, `/reporte/foto` y `/reporte/ubicacion` se muestra embebida; en el panel `/permisos` y en `/ajustes-app` se abre como modal `/permisos/[recurso]` (`presentation: "modal"`). Si el permiso está bloqueado, `AvisoBloqueado` explica el camino en Ajustes de Android y de iOS.
7. **La app nunca se bloquea**: crear un reporte solo exige título y aula.
8. **No insistir**: después de un "no", la pantalla previa vuelve a aparecer solo cuando la persona vuelve a tocar la función.
9. **Panel `/permisos`**: estado, `Platform.OS` y matiz (`accuracy`, `accessPrivileges`) de cada recurso.

## Auditoría del manifiesto (desafío G4)

Resultado de `npx expo prebuild --platform android --no-install --clean` (en una corrida real sobre este repo):

| Permiso en `AndroidManifest.xml` | Quién lo agrega | ¿Se quita? |
|---|---|---|
| `INTERNET` | Plantilla base de Expo | No |
| `CAMERA` | `expo-camera` | No |
| `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION` | `expo-location` | No |
| `VIBRATE` | Plantilla base de Expo / notificaciones | No |
| `SYSTEM_ALERT_WINDOW` | Plantilla base de Expo | **Sí** (`blockedPermissions`) |
| `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` | Plantilla base de Expo | **Sí** |
| `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` | Bloqueados preventivamente | **Sí** |
| `RECORD_AUDIO` | `expo-camera` / `expo-image-picker` | **Sí** (y `recordAudioAndroid: false`) |
| `ACCESS_BACKGROUND_LOCATION` | Bloqueado preventivamente | **Sí** |

`POST_NOTIFICATIONS` no figura en el manifiesto de `prebuild`: lo aporta el manifiesto de `expo-notifications` al compilar (no lo comprobé en una build).

## Estado de los entregables

| Entregable | Estado |
|---|---|
| Proyecto funcionando | Hecho: compila (`npx expo export --platform android`) y pasa `tsc` salvo dos errores que ya traía la plantilla (`*.css`). |
| `RESPUESTAS.md` (A–F) | Hecho. Los datos marcados "(a confirmar)" conviene revisarlos. |
| `README.md` | Hecho, **salvo las capturas**. |
| Capturas / video (escáner en cuatro estados, ubicación concedida y denegada, foto desde el selector, notificación recibida, panel antes y después de Ajustes) | **Pendiente**: hay que tomarlas en un dispositivo. Carpeta sugerida: `docs/capturas/`. |
| Captura del diálogo del sistema en una development build con tu texto | **Pendiente**: requiere dispositivo. |
| Prueba en Expo Go y en development build | **Pendiente**: no se pudo probar en un dispositivo desde este entorno. |
| Desafíos G4 | Hecha la auditoría del manifiesto. Falta nota de voz, notificaciones provisionales y pantalla de bloqueo por plataforma completa (el aviso de bloqueo ya muestra el camino de Android y de iOS). |

## Preguntas para la defensa (G6): dónde mirar

1. **"Continuar" vs "Abrir Ajustes"**: `src/app/reporte/escanear.tsx` (según `estado`), que sale de `canAskAgain` y `granted` en `src/lib/permisos.ts` → `traducir()`.
2. **Revocar la cámara con la app abierta**: Android finaliza el proceso; al volver, la app se reabre. Si no se cierra, `AppState` (`useRevisarAlVolver`) dispara `consultarPermiso()`.
3. **Foto: elegir sin permiso, sacar con permiso**: el selector del sistema entrega solo la foto elegida; la cámara accede al sensor.
4. **Ubicación aproximada**: `src/lib/ubicacion.ts` marca `aproximada` (`android.accuracy === 'coarse'`, `ios.accuracy === 'reduced'` o radio > 1 km) y la UI muestra "Ubicación aproximada". Si se deniega: sector a mano.
5. **Textos de propósito en Expo Go**: Expo Go tiene su propio `Info.plist`/manifiesto.
6. **Nota de voz y OTA**: no alcanza; agrega `RECORD_AUDIO` / `NSMicrophoneUsageDescription`, que son cambios nativos y piden una build nueva.
