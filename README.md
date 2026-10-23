# Mantenimiento IPF

App para que alumnos y docentes del Instituto Politécnico Formosa reporten desperfectos del edificio.
La app avisa cuando el reporte se resuelve.
Está hecha con Expo SDK 58, Expo Router y TypeScript.
La consigna pide SDK 57.
El proyecto se actualizó después a SDK 58, que es la versión actual de Expo.
SDK 58 mantiene los mismos valores que pide el TP: API 36 en Android e iOS 16.4 como mínimo.
Usa la cámara, la ubicación, las notificaciones y el micrófono.
Las fotos de la galería se eligen sin pedir permiso de galería.

Las respuestas de las Partes A a F están en [RESPUESTAS.md](./RESPUESTAS.md).

## Cómo correr la app

```
npm install
npx expo start
npx expo run:android
```

El primer comando instala las dependencias.
El segundo abre la app en Expo Go.
El tercero compila una development build en Android.
Los textos de propósito y los permisos propios solo se ven en la development build.

Los reportes y los avisos se guardan en memoria.
Al cerrar la app se pierden.

## Árbol de carpetas de src/app

```
src/app
├── _layout.tsx                  Stack principal
├── (tabs)
│   ├── _layout.tsx              pestañas Reportes, Avisos y Permisos
│   ├── index.tsx                /                     lista de reportes y botón "Nuevo reporte"
│   ├── avisos.tsx               /avisos               bandeja de avisos
│   └── permisos.tsx             /permisos             panel de permisos
├── reporte
│   ├── nuevo.tsx                /reporte/nuevo        formulario del reporte
│   ├── escanear.tsx             /reporte/escanear     lector del QR del aula
│   ├── foto.tsx                 /reporte/foto         sacar foto o elegir de la galería
│   ├── ubicacion.tsx            /reporte/ubicacion    ubicación actual o sector a mano
│   └── [id].tsx                 /reporte/[id]         detalle y "Simular resolución"
├── permisos
│   └── [recurso].tsx            /permisos/[recurso]   pantalla previa (modal)
└── ajustes-app.tsx              /ajustes-app          interruptor de avisos
```

La carpeta `(tabs)` es un grupo.
El grupo no suma una parte a la dirección.
Por eso `(tabs)/avisos.tsx` responde a `/avisos`.

El resto del código está ordenado así:

```
src/components   boton, campo-texto, estado-etiqueta, fila-permiso, nota-voz,
                 pantalla-previa, selector-opciones, selector-sector, tarjeta-reporte
src/hooks        usePermiso (hook unificado de permisos)
src/lib          permisos, ubicacion, notificaciones, reportes, tipos
```

## Bloque plugins de app.json

```json
"plugins": [
  "expo-router",
  [
    "expo-splash-screen",
    {
      "backgroundColor": "#208AEF",
      "image": "./assets/images/splash-icon.png",
      "imageWidth": 76
    }
  ],
  [
    "expo-audio",
    {
      "microphonePermission": "Usamos tu micrófono para grabar una nota de voz que describa el desperfecto.",
      "recordAudioAndroid": true,
      "enableBackgroundRecording": false,
      "enableBackgroundPlayback": false
    }
  ],
  [
    "expo-camera",
    {
      "cameraPermission": "Usamos tu cámara para leer el código QR del aula y sacar fotos del desperfecto.",
      "microphonePermission": false,
      "recordAudioAndroid": false
    }
  ],
  [
    "expo-location",
    {
      "locationWhenInUsePermission": "Usamos tu ubicación para marcar en qué parte del edificio está el desperfecto.",
      "locationAlwaysAndWhenInUsePermission": false,
      "locationAlwaysPermission": false,
      "locationFullAccuracyPermission": false,
      "motionUsagePermission": false
    }
  ],
  [
    "expo-image-picker",
    {
      "photosPermission": false,
      "cameraPermission": "Usamos tu cámara para leer el código QR del aula y sacar fotos del desperfecto.",
      "microphonePermission": "Usamos tu micrófono para grabar una nota de voz que describa el desperfecto."
    }
  ],
  "expo-notifications"
]
```

JSON no acepta comentarios.
Por eso cada opción se explica en esta tabla.

| Plugin | Opción | Qué hace |
|---|---|---|
| expo-audio | `microphonePermission` | Escribe el texto de propósito del micrófono en iOS. |
| expo-audio | `recordAudioAndroid: true` | Declara `RECORD_AUDIO` en Android. Lo necesita la nota de voz. |
| expo-audio | `enableBackgroundRecording: false` y `enableBackgroundPlayback: false` | No graba ni reproduce en segundo plano. Así no se agregan permisos de servicio en primer plano. |
| expo-camera | `cameraPermission` | Texto de propósito de la cámara en iOS. |
| expo-camera | `microphonePermission: false` | La cámara no graba video. No pide micrófono por su cuenta. |
| expo-camera | `recordAudioAndroid: false` | La cámara no agrega `RECORD_AUDIO` en Android. |
| expo-location | `locationWhenInUsePermission` | Texto de propósito de la ubicación en uso. |
| expo-location | `locationAlwaysAndWhenInUsePermission: false` y `locationAlwaysPermission: false` | No se declara la ubicación "Siempre". La app usa solo primer plano. |
| expo-location | `locationFullAccuracyPermission: false` | La app no pide pasar de ubicación aproximada a precisa. Así iOS no agrega ese texto extra. |
| expo-location | `motionUsagePermission: false` | La app no usa sensores de movimiento. |
| expo-image-picker | `photosPermission: false` | No se declara acceso a la galería. El selector del sistema no lo necesita. |
| expo-image-picker | `cameraPermission` | Mismo texto que en expo-camera. Los dos plugins escriben la misma clave. |
| expo-image-picker | `microphonePermission` | Mismo texto que en expo-audio. Si valiera `false`, este plugin bloquearía `RECORD_AUDIO` y la nota de voz no andaría en Android. |
| expo-notifications | sin opciones | En iOS las notificaciones no llevan texto de propósito. En Android 13 o superior agrega `POST_NOTIFICATIONS`. |

El plugin de expo-audio va antes que el de expo-camera.
Con el orden inverso, `microphonePermission: false` de expo-camera borra el texto del micrófono en iOS.
Lo comprobé con `npx expo config --type introspect`.

## Permisos bloqueados (android.blockedPermissions)

| Permiso | Por qué se bloquea |
|---|---|
| `SYSTEM_ALERT_WINDOW` | La app no dibuja sobre otras apps. |
| `ACCESS_BACKGROUND_LOCATION` | La ubicación se usa solo con la app abierta. |
| `READ_MEDIA_IMAGES` | Las fotos se eligen con el selector del sistema. No hace falta leer toda la galería. |
| `READ_MEDIA_VIDEO` | La app no usa videos de la galería. |
| `READ_EXTERNAL_STORAGE` | Las versiones viejas de Android tampoco necesitan leer el almacenamiento. El selector entrega la foto. |
| `WRITE_EXTERNAL_STORAGE` | La app no guarda archivos fuera de su propia carpeta. |

`RECORD_AUDIO` no está bloqueado.
La nota de voz lo necesita.
Igual se pide solo cuando la persona toca "Grabar nota de voz".

## Tabla de permisos

| Recurso | Módulo | Cuándo se pide | Alternativa si se deniega |
|---|---|---|---|
| Cámara para el QR | expo-camera | Al entrar a `/reporte/escanear` y tocar "Continuar". | Escribir el código del aula a mano. |
| Cámara para la foto | expo-camera y expo-image-picker | En `/reporte/foto`, al tocar "Sacar foto" y después "Continuar". | Elegir la foto de la galería. |
| Galería | expo-image-picker (`launchImageLibraryAsync`) | Nunca. El selector del sistema no pide permiso. | No hace falta. |
| Ubicación en primer plano | expo-location | En `/reporte/ubicacion`, al tocar "Usar mi ubicación actual" y después "Continuar". | Elegir el sector a mano (patio, estacionamiento o pasillo). |
| Notificaciones | expo-notifications | En `/ajustes-app`, solo al activar el interruptor. En Android se crea antes el canal "reportes". | El aviso aparece en la pestaña Avisos. |
| Micrófono | expo-audio | En `/reporte/nuevo`, al tocar "Grabar nota de voz" y después "Continuar". | Escribir la descripción a mano. |

## Cómo se cumple cada requisito

1. Hook unificado. `src/hooks/usePermiso.ts` devuelve `estado` ('cargando', 'concedido', 'preguntable' o 'bloqueado'), `parcial`, `detalle`, `pedir()` y `abrirAjustes()`. Escucha `AppState` y vuelve a consultar cuando la app regresa de Ajustes.
2. Escáner con cuatro estados. Muestra el indicador de carga, la cámara, la pantalla previa con "Continuar" o el aviso de bloqueado con "Abrir Ajustes". En todos los casos sin cámara se puede escribir el código a mano.
3. Foto sin permiso de galería. "Elegir de la galería" usa `launchImageLibraryAsync`. La app bloquea `READ_MEDIA_IMAGES`.
4. Ubicación respetuosa. Se pide solo primer plano. Si es aproximada, la pantalla muestra "Ubicación aproximada" y no las coordenadas.
5. Notificaciones en contexto. El permiso se pide solo desde el interruptor. "Simular resolución" programa una notificación local a los 10 segundos. El aviso siempre queda en la pestaña Avisos.
6. Pantallas previas. `src/components/pantalla-previa.tsx` tiene un solo botón "Continuar". Si el permiso está bloqueado, muestra el camino en Ajustes de Android y de iOS y el botón "Abrir Ajustes".
7. La app nunca se bloquea. Para guardar un reporte solo hace falta el título.
8. No insistir. La pantalla previa aparece solo cuando la persona toca una función.
9. Panel de permisos. `/permisos` muestra el estado de cada recurso, la plataforma (`Platform.OS`) y el matiz cuando corresponde (ubicación aproximada o notificaciones provisionales). La galería figura como "No requiere permiso".

Desafío opcional hecho: nota de voz con expo-audio. El micrófono se pide solo para esa función.

## Capturas

Las capturas van en la carpeta `docs/capturas`.

| Captura | Archivo |
|---|---|
| Escáner cargando | pendiente |
| Escáner con la cámara abierta | pendiente |
| Escáner con la pantalla previa ("Continuar") | pendiente |
| Escáner bloqueado ("Abrir Ajustes") | pendiente |
| Ubicación concedida | pendiente |
| Ubicación denegada con el sector a mano | pendiente |
| Foto elegida desde el selector | pendiente |
| Notificación recibida | pendiente |
| Panel de permisos antes de ir a Ajustes | pendiente |
| Panel de permisos después de volver de Ajustes | pendiente |
| Diálogo del sistema con el texto de propósito (development build) | pendiente |

## Guía para la defensa oral

1. "Continuar" o "Abrir Ajustes". Lo decide `calcularEstado` en `src/lib/permisos.ts`. El campo `canAskAgain` separa 'preguntable' de 'bloqueado'. Las pantallas eligen el botón según ese estado.
2. Revocar la cámara con la app abierta. Android cierra el proceso de la app. Si la app sigue viva, `usePermiso` escucha `AppState` y vuelve a consultar al pasar a 'active'.
3. Foto sin permiso y cámara con permiso. El selector del sistema entrega solo la foto elegida. La cámara, en cambio, usa el sensor del teléfono.
4. Ubicación aproximada o denegada. Si es aproximada, se guarda la marca `aproximada` y se muestra "Ubicación aproximada". Si se deniega, se elige el sector a mano.
5. Textos de propósito en Expo Go. Expo Go tiene su propio `Info.plist` y su propio manifiesto. Los textos propios solo existen en una build de la app.
6. Nota de voz y actualización OTA. No alcanza con una OTA. El micrófono agrega `RECORD_AUDIO` y `NSMicrophoneUsageDescription`, que son cambios nativos. Hace falta una build nueva.
