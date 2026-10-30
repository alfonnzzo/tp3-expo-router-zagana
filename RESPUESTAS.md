# TP3 — Permisos móviles: respuestas (Partes A a F)

Alumno/a: Zagana · Taller Complementario – React Native II · Expo SDK 57

> Convenciones: **(verificado)** = lo comprobé en el código instalado de este repo o en la documentación oficial;
> **(a confirmar)** = dato que no pude comprobar en una fuente primaria y conviene revisar antes de la defensa.

---

## Parte A · ¿Qué es un permiso y por qué existe?

### A1. Conceptos

**a)** Un permiso es la autorización explícita para que una app use un recurso o dato sensible (cámara, ubicación, contactos…) que el sistema protege por defecto.
- **La app** declara qué necesita y lo pide cuando lo necesita.
- **El sistema operativo** es quien decide, dibuja el diálogo, guarda la respuesta y hace cumplir la decisión.
- **La persona usuaria** es la dueña de los datos: concede, niega o revoca.

**b)** La caja de arena (sandbox) aísla cada app: no puede leer archivos ni memoria de otras apps ni acceder al hardware o a datos del usuario sin pasar por el sistema. Los permisos son las "puertas" controladas de esa caja. Sin ningún permiso una app puede dibujar su interfaz, usar su propio almacenamiento privado, procesar datos y (en Android) conectarse a internet, porque `INTERNET` es un permiso normal que se concede al instalar.

**c)** Cuatro razones:
1. **Privacidad** — la ubicación o los contactos son datos personales (ej.: una linterna no necesita saber dónde estás).
2. **Seguridad** — evitar que una app maliciosa active la cámara o el micrófono sin que te enteres.
3. **Control del usuario / consentimiento** — la persona decide qué comparte y puede revocarlo (ej.: "Solo esta vez").
4. **Recursos y experiencia** — evitar abuso de batería, datos o avisos (ej.: notificaciones: `POST_NOTIFICATIONS` desde Android 13).

**d)** La visita es la **app**, el portero es el **sistema operativo** y el dueño del departamento es la **persona usuaria**. "El portero se acuerda de la respuesta" significa que el sistema guarda la decisión: si la persona dijo que no, la app no puede volver a preguntar libremente (en iOS nunca más; en Android 11+ tras dos rechazos).

### A2. Declarar y solicitar

|  | Declarar (al compilar) | Solicitar (al ejecutar) |
|---|---|---|
| ¿Qué se hace? | Se anuncia qué permisos / textos de propósito necesita la app. | Se le pide a la persona que autorice, mostrando el diálogo del sistema. |
| ¿Dónde / cómo en Android? | `AndroidManifest.xml` (`<uses-permission>`). | `requestPermissions` del sistema (solo para permisos de tiempo de ejecución). |
| ¿Dónde / cómo en iOS? | `Info.plist` con la clave `NS…UsageDescription` (texto de propósito). | La API del framework (p. ej. `AVCaptureDevice.requestAccess`) muestra el diálogo, una sola vez. |
| ¿Dónde / cómo en Expo? | `app.json`: `plugins` de cada módulo, `android.permissions`, `android.blockedPermissions`, `ios.infoPlist`; se aplica con prebuild. | Funciones del módulo: `use…Permissions()`, `get…Async()` / `request…Async()`. |
| ¿Qué pasa si se omite? | Android: el pedido se deniega solo, sin diálogo. iOS: la app se cierra (crash) y la build puede ser rechazada. | La función no funciona: sin pedir no hay permiso (salvo los de instalación). |

### A3. Verdadero o falso

- **a) F.** El diálogo lo dibuja el sistema operativo, no la app (por eso no se puede cambiar su diseño ni su texto en Android).
- **b) V.** La fuente de verdad es `app.json` / `app.config.ts`; el manifiesto se genera con `prebuild`.
- **c) F.** Un permiso nuevo cambia el código nativo (manifiesto / `Info.plist`): exige una **nueva build**. OTA solo actualiza JavaScript y assets.
- **d) F.** Si el permiso no está declarado en el manifiesto, Android lo deniega automáticamente **sin mostrar diálogo**.
- **e) F.** En SDK 57 cada módulo trae sus propias funciones (`expo-camera`, `expo-location`…); `expo-permissions` es un paquete obsoleto.
- **f) V.** Las notificaciones en iOS no llevan clave de texto de propósito en el `Info.plist` (el sistema muestra un diálogo propio).
- **g) V.** Con acceso limitado `status` es `'granted'` y el matiz está en `accessPrivileges: 'limited'` (en `expo-media-library`).
- **h) F.** No es confiable: en iOS el estado depende de la versión y de cómo se borre la app, y en Android reinstalar tampoco garantiza el reinicio en todos los casos. Lo confiable es resetear con herramientas (ver D6.d).

### A4. Los estados de un permiso

**a)**
- **Android:** `sin decidir → (diálogo) → concedido | denegado`. Un denegado se puede volver a pedir una vez; si se rechaza otra vez (Android 11+) pasa a **bloqueado**. Desde Ajustes se puede cambiar siempre.
- **iOS:** `sin decidir → (diálogo, una sola vez) → concedido | denegado`. Denegado ya es definitivo: solo se cambia desde Ajustes.

Diferencia central: Android da **dos oportunidades** para preguntar; iOS da **una sola**.

**b)**

| Estado | `status` | `canAskAgain` | ¿Puede aparecer el diálogo? |
|---|---|---|---|
| Sin decidir | `undetermined` | `true` | Sí |
| Concedido | `granted` | `true` | No hace falta |
| Denegado (se puede volver a pedir) | `denied` | `true` | Sí (Android, primer rechazo) |
| Bloqueado | `denied` | `false` | No: solo Ajustes |

---

## Parte B · Android: tipos de permisos y manifiesto

### B1. Clasificación

| Permiso | Tipo | ¿Cómo se obtiene? |
|---|---|---|
| `INTERNET` | Instalación (normal) | Se concede solo al instalar. |
| `CAMERA` | Tiempo de ejecución | Diálogo al pedirlo. |
| `VIBRATE` | Instalación (normal) | Al instalar. |
| `SYSTEM_ALERT_WINDOW` | Especial | La persona lo habilita en Ajustes ("Mostrar sobre otras apps"). |
| `POST_NOTIFICATIONS` | Tiempo de ejecución (Android 13+) | Diálogo; antes de Android 13 no existe. |
| `ACCESS_NETWORK_STATE` | Instalación (normal) | Al instalar. |
| `READ_CONTACTS` | Tiempo de ejecución | Diálogo. |
| `SCHEDULE_EXACT_ALARM` | Especial | Pantalla de Ajustes "Alarmas y recordatorios". |
| `RECORD_AUDIO` | Tiempo de ejecución | Diálogo. |
| `MANAGE_EXTERNAL_STORAGE` | Especial | Pantalla de Ajustes "Acceso a todos los archivos" (Google Play lo restringe mucho). |

### B2. Grupos y nombres

**a)** Un grupo de permisos reúne permisos relacionados (p. ej. ubicación). Si la app pide `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` juntos, la persona ve **un solo diálogo** (en Android 12+ con la opción "Precisa" / "Aproximada").
**b)** Lleva el prefijo `android.permission.`; el de cámara es `android.permission.CAMERA`.
**c)** Los permisos de firma (signature) solo se conceden a apps firmadas con el mismo certificado que quien define el permiso (o que el sistema). No se usan en apps comunes porque otra app no puede obtenerlos: no hay forma de que la persona los autorice.

### B3. Leé el manifiesto

**a)** Se concede solo al instalar: `INTERNET`. A pedir en ejecución: `CAMERA`, `ACCESS_COARSE_LOCATION`/`ACCESS_FINE_LOCATION`, `POST_NOTIFICATIONS` (Android 13+) y `READ_EXTERNAL_STORAGE` (solo en Android 12L o menor).
**b)** `maxSdkVersion="32"` significa que el permiso solo rige hasta Android 12L (API 32). Desde Android 13 lo reemplazan `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` y `READ_MEDIA_AUDIO` (y en Android 14 `READ_MEDIA_VISUAL_USER_SELECTED`).
**c)** `tools:node="remove"` le dice al *manifest merger* que quite ese permiso aunque una librería lo agregue. En `app.json`:

```json
"android": { "blockedPermissions": ["android.permission.RECORD_AUDIO"] }
```

**d)** En `expo.android.permissions` de `app.json`: `"permissions": ["android.permission.SCHEDULE_EXACT_ALARM"]`.
**e)** Porque la carpeta `android/` se regenera con `prebuild` (sobre todo con `--clean`) y se pierden los cambios manuales; la fuente de verdad es `app.json`. `blockedPermissions` **no** funciona en Expo Go: Expo Go es otra app con su propio manifiesto; hace falta una development build.

### B4. Así pregunta Android

**a)** No: el texto del diálogo lo fija el sistema. La explicación va **antes**, en una pantalla previa de la app.
**b)** "Mientras la app está en uso" dura mientras la app está visible/activa y se mantiene en futuras sesiones; "Solo esta vez" se revoca al salir de la app. Existe para permisos sensibles de ubicación, cámara y micrófono (Android 11+), para dar más control.
**c)** Pasa a bloqueado: el sistema ya no muestra el diálogo y `canAskAgain` vale `false`.
**d)** Sirve: "mostrar farmacias o clima de mi zona". No sirve: navegación giro a giro o registrar una carrera.
**e)** Android **finaliza el proceso** de la app; al volver, la app arranca de nuevo. Por eso el código debe comprobar el estado al iniciar y al volver a primer plano.

### B5. Android, versión por versión

| Cambio | Versión (API) | Qué implica para el código |
|---|---|---|
| Nacen los permisos en tiempo de ejecución | Android 6 (API 23) | No alcanza con declarar: hay que pedir en ejecución. |
| Ubicación en segundo plano aparte | Android 10 (API 29) | `ACCESS_BACKGROUND_LOCATION` es otro permiso; desde 11 se pide después del de primer plano. |
| Dos rechazos = no volver a preguntar | Android 11 (API 30) | Mirar `canAskAgain` y llevar a Ajustes. |
| Ubicación precisa o aproximada | Android 12 (API 31) | Declarar ambos y tolerar que llegue solo aproximada. |
| Notificaciones como permiso (`POST_NOTIFICATIONS`) | Android 13 (API 33) | Crear el canal y pedir el permiso. |
| Acceso parcial a fotos y videos | Android 14 (API 34) | `READ_MEDIA_VISUAL_USER_SELECTED`; preferible usar el selector del sistema. |
| Permiso de red local (`ACCESS_LOCAL_NETWORK`) | Android 17 (API 37), para apps que apuntan a 37 | Pedirlo en ejecución para hablar con dispositivos de la LAN. (verificado en la guía de Android; el enunciado no da versión) |

**`targetSdkVersion`:** indica para qué versión de Android probó la app; el sistema aplica los comportamientos nuevos de esa versión. Expo SDK 57 apunta a **API 36 (Android 16)** (verificado en `expo-modules-core/android/ExpoModulesCorePlugin.gradle`, valor por defecto 36). Google Play exige desde el **31 de agosto de 2026** que apps nuevas y actualizaciones apunten a API 36 o superior (verificado en la página oficial de requisitos de target SDK).

---

## Parte C · iOS: textos de propósito y acceso parcial

### C1. Claves del Info.plist

| Recurso | Clave en Info.plist |
|---|---|
| Cámara | `NSCameraUsageDescription` |
| Micrófono | `NSMicrophoneUsageDescription` |
| Ubicación en uso | `NSLocationWhenInUseUsageDescription` |
| Ubicación siempre | `NSLocationAlwaysAndWhenInUseUsageDescription` (y la histórica `NSLocationAlwaysUsageDescription`) |
| Fotos (leer) | `NSPhotoLibraryUsageDescription` |
| Fotos (solo guardar) | `NSPhotoLibraryAddUsageDescription` |
| Contactos | `NSContactsUsageDescription` |
| Face ID | `NSFaceIDUsageDescription` |
| Rastreo entre apps (ATT) | `NSUserTrackingUsageDescription` |
| Notificaciones | No lleva clave. |

### C2. Sin texto, no hay permiso

**a)** Si falta el texto y la app usa la cámara, **la app se cierra (crash)** con el mensaje "attempted to access privacy-sensitive data without a usage description". Al subir la build a App Store Connect se rechaza con el error **ITMS-90683** (Missing Purpose String in Info.plist).
**b)** **Una sola vez.** Si la persona dice que no, a la app solo le queda ofrecer una alternativa y mandar a Ajustes.
**c)** El sistema arma el marco del diálogo y los botones; vos escribís únicamente el texto de propósito. En Expo se configura en `app.json`, en las opciones del plugin de cada módulo (p. ej. `cameraPermission`) o en `ios.infoPlist`.
**d)** Apple analiza estáticamente el binario: si encuentra referencias a una API protegida, exige el texto aunque la app nunca la llame. Se resuelve agregando el texto (en el plugin) o quitando la librería / bloqueando esa función.

### C3. Probador de textos de propósito

| Texto propuesto | ¿Aprobado? | Versión mejorada |
|---|---|---|
| "Necesitamos tu ubicación." | No: no dice para qué. | "Usamos tu ubicación para mostrarte lo que tenés cerca." |
| "Para mejorar tu experiencia." | No: vago, sin dato ni beneficio. | "Usamos tu ubicación para ordenar los resultados por cercanía." |
| "Usamos tu ubicación para mostrarte las farmacias de turno más cercanas." | **Sí**: dato + beneficio concreto. | — |
| "La app no funciona sin ubicación." | No: es una presión, no un beneficio. | "Usamos tu ubicación para mostrarte las sucursales más cercanas." |
| "Ubicación requerida por el sistema." | No: falso (la app lo pide) y no explica nada. | "Usamos tu ubicación para marcar dónde está el problema que reportás." |

### C4. Acceso parcial y gradual

| Caso | iOS | En Expo |
|---|---|---|
| Fotos limitadas ("Seleccionar fotos") | iOS 14 | `expo-media-library`: `status: 'granted'` con `accessPrivileges: 'limited'`. |
| Ubicación aproximada (interruptor "Precisa") | iOS 14 | `expo-location`: `ios.accuracy: 'reduced'` en la respuesta (verificado en `Location.types.d.ts`). |
| "Permitir una vez" (ubicación) | iOS 13 | No hay un campo propio (a confirmar): la sesión queda como concedida y en el próximo inicio vuelve a `undetermined`. |
| Ubicación escalonada: de "al usar la app" a "Siempre" | iOS 13 | Primero `requestForegroundPermissionsAsync()` y después `requestBackgroundPermissionsAsync()`. |
| Notificaciones provisionales | iOS 12 | `requestPermissionsAsync({ ios: { allowProvisional: true } })`; se detecta con `ios.status === IosAuthorizationStatus.PROVISIONAL`. |
| Rastreo entre apps (App Tracking Transparency) | iOS 14.5 | `expo-tracking-transparency`: `requestTrackingPermissionsAsync()`. |

**Versión mínima de iOS en SDK 57:** **16.4** (verificado en los `.podspec` de `expo-modules-core` y `expo-camera`). Consecuencia: todos los casos de la tabla existen en cualquier iPhone compatible; no hace falta código por versión de iOS.

### C5. Android vs iOS, lado a lado

|  | Android | iOS |
|---|---|---|
| ¿Dónde se declara? | `AndroidManifest.xml` (`uses-permission`). | `Info.plist` (`NS…UsageDescription`). |
| Texto en el diálogo | Lo pone el sistema; no se personaliza. | Una parte la escribe la app (texto de propósito). |
| Oportunidades para preguntar | Dos (Android 11+). | Una. |
| "Solo esta vez" / "Permitir una vez" | "Solo esta vez" (Android 11+, ubicación, cámara, micrófono). | "Permitir una vez" (iOS 13+, ubicación). |
| Notificaciones | Permiso `POST_NOTIFICATIONS` desde Android 13, con canal previo. | Se pide con diálogo; sin texto de propósito; existen las provisionales. |
| Ubicación en segundo plano | Permiso aparte (API 29+), se pide después. | Escalonada: "Siempre" se ofrece después de "al usar la app". |
| Si falta la declaración | El pedido se deniega solo, sin diálogo. | La app se cierra y la build se rechaza. |

---

## Parte D · Expo: una API, dos plataformas

### D1. Módulos y funciones

| Necesidad | Módulo | Hook / función de permiso |
|---|---|---|
| Escanear un QR con la cámara | `expo-camera` | `useCameraPermissions()` |
| Grabar video con sonido | `expo-camera` | `useCameraPermissions()` + `useMicrophonePermissions()` |
| Mostrar farmacias cercanas | `expo-location` | `useForegroundPermissions()` |
| Seguir un envío con la app en segundo plano | `expo-location` | `useForegroundPermissions()` y luego `useBackgroundPermissions()` |
| Mostrar un recordatorio | `expo-notifications` | `getPermissionsAsync()` / `requestPermissionsAsync()` |
| Grabar una nota de voz | `expo-audio` | `requestRecordingPermissionsAsync()` |
| Galería propia dentro de la app | `expo-media-library` | `usePermissions()` |
| Publicidad personalizada entre apps (iOS) | `expo-tracking-transparency` | `useTrackingPermissions()` |

**Tutorial con `import * as Permissions from 'expo-permissions'`:** el tutorial está desactualizado; ese paquete quedó obsoleto y hoy cada módulo pide sus propios permisos.

### D2. Consultar, pedir y el hook

**a)** `get…PermissionsAsync()` solo lee el estado y **nunca** muestra el diálogo. `request…PermissionsAsync()` es la que puede mostrarlo (si el permiso se puede preguntar).
**b)** `[permiso, pedirPermiso, consultarPermiso]`: el estado actual, la función que pide y la que vuelve a consultar sin diálogo. En el primer render `permiso` vale `null`: la pantalla debe mostrar un indicador de carga.
**c)** Si `canAskAgain` es `false`, `request…()` devuelve enseguida `denied` **sin diálogo**. Llamarla en un bucle (por ejemplo en cada render) deja la pantalla en "Pidiendo permiso…" para siempre y no logra nada.

### D3. Leé la respuesta

| Respuesta | Qué hace la app |
|---|---|
| `null` | Todavía no se sabe: mostrar indicador de carga. |
| `{ status: 'granted', granted: true }` | Usar la función. |
| `{ status: 'undetermined', canAskAgain: true }` | Mostrar la pantalla previa y, al "Continuar", pedir el permiso. |
| `{ status: 'denied', canAskAgain: true }` | Se puede volver a pedir: explicar y ofrecerlo solo cuando la persona toque la función; mientras tanto, la alternativa. |
| `{ status: 'denied', canAskAgain: false }` | Bloqueado: botón "Abrir Ajustes" y la alternativa. |
| `{ status: 'granted', accessPrivileges: 'limited' }` | Funciona con acceso limitado: avisar y ofrecer cambiar la selección. |
| `{ status: 'granted', android: { accuracy: 'coarse' } }` | Funciona con ubicación aproximada: no mostrar coordenadas exactas. |

**Los dos campos que deciden casi todo:** `granted` responde "¿puedo usar la función ya?"; `canAskAgain` responde "¿puedo volver a mostrar el diálogo?".

### D4. Simulación del ciclo completo (Android 14, `expo-location`)

| # | Acción | status | canAskAgain | ¿Diálogo? |
|---|---|---|---|---|
| 1 | `getForegroundPermissionsAsync()` | `undetermined` | `true` | No |
| 2 | `request…` → "No permitir" | `denied` | `true` | Sí |
| 3 | `request…` → "No permitir" | `denied` | `false` | Sí |
| 4 | `request…` | `denied` | `false` | No (vuelve al instante) |
| 5 | Ajustes → "Mientras la app está en uso" → vuelve y consulta | `granted` | `true` | No |
| 6 | Igual que 5 pero la app no vuelve a consultar | Sigue mostrando el estado viejo (`denied` / bloqueado) | — | No |

**En iOS (pasos 1–4):** el paso 1 da `undetermined`. En el paso 2 el diálogo aparece y, con "No permitir", ya queda `denied` con `canAskAgain: false`: **cambia en el paso 2** (Android tiene un segundo intento). En los pasos 3 y 4 no hay diálogo. Si la persona elige "Permitir una vez" y cierra y reabre la app, el permiso vuelve a `undetermined` y la app puede volver a preguntar.

### D5. Configurar app.json

```json
{
  "expo": {
    "plugins": [
      ["expo-camera", {
        "cameraPermission": "Usamos tu cámara para leer el QR de la puerta del aula.",
        "microphonePermission": false,
        "recordAudioAndroid": false
      }],
      ["expo-location", {
        "locationWhenInUsePermission": "Usamos tu ubicación para mostrarte los puntos de reciclaje cercanos.",
        "locationAlwaysAndWhenInUsePermission": false,
        "locationAlwaysPermission": false
      }]
    ],
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW"
      ]
    }
  }
}
```

`expo-camera` agrega `RECORD_AUDIO` en Android porque la cámara también puede grabar video con sonido y el plugin lo declara por defecto (`recordAudioAndroid` vale `true`; verificado en `withCamera.js`). Hay que apagarlo explícitamente.

### D6. Expo Go no es tu app

**a)** Porque en Expo Go el `Info.plist` y el manifiesto son los de Expo Go, no los de tu app; tus textos de propósito solo existen dentro de una build propia.
**b)** En Expo Go se prueban cámara, ubicación en primer plano y notificaciones locales. Hace falta una development build para notificaciones push remotas en Android, ubicación en segundo plano, y para ver tus textos y permisos (plugins, `blockedPermissions`).
**c)** Ver archivos nativos: `npx expo prebuild` (con `--clean` para regenerar). Compilar la development build en Android: `npx expo run:android` (o `eas build --profile development --platform android`).
**d)** Android: `adb shell pm reset-permissions` o `adb shell pm revoke <paquete> android.permission.CAMERA` (a confirmar el efecto exacto según la versión). iOS (simulador): `xcrun simctl privacy booted reset all <bundle-id>`.

---

## Parte E · Recetas: leer y corregir código

### E1. Encontrá los errores (cámara)

Errores:
1. `permiso` es `null` en el primer render y `permiso.status` revienta: falta el estado **cargando**.
2. No existe el estado **bloqueado**: si `canAskAgain` es `false`, el botón "Permitir" no hace nada.
3. El botón dice "Permitir" y no "Continuar"; y `Explicacion` no está importado.
4. `CameraView` no tiene `barcodeScannerSettings` ni `onBarcodeScanned`: no escanea ningún QR.

```tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator, Button, Linking } from 'react-native';

import { Explicacion } from '@/components/explicacion';

export default function Escanear() {
  const [permiso, pedirPermiso] = useCameraPermissions();

  if (!permiso) return <ActivityIndicator />;                      // cargando

  if (permiso.granted) {                                           // concedido
    return (
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => console.log(data)}
      />
    );
  }

  if (permiso.canAskAgain) {                                       // preguntable
    return (
      <Explicacion texto="Usamos la cámara para leer el QR del aula.">
        <Button title="Continuar" onPress={pedirPermiso} />
      </Explicacion>
    );
  }

  return (                                                         // bloqueado
    <Explicacion texto="La cámara está bloqueada. Habilitala en Ajustes.">
      <Button title="Abrir Ajustes" onPress={() => Linking.openSettings()} />
    </Explicacion>
  );
}
```

### E2. El orden importa (ubicación)

**a)** Pide primero el permiso de segundo plano. En **iOS** la ubicación "Siempre" es una escalada: se ofrece después de "al usar la app", así que no sirve como primer pedido. En **Android 11+** el permiso de segundo plano no se puede pedir juntos ni antes del de primer plano: el sistema lo rechaza. Además, si se deniega "siempre", la función devuelve `false` aunque el primer plano esté concedido.

**b)**
```ts
export async function activarSeguimiento() {
  const enUso = await Location.requestForegroundPermissionsAsync();
  if (!enUso.granted) return false;

  const siempre = await Location.requestBackgroundPermissionsAsync();
  return siempre.granted;
}
```

**c)**
```ts
export async function obtenerUbicacion() {
  try {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (!permiso.granted) return null;

    const pos = await Location.getCurrentPositionAsync({});
    const aproximada =
      permiso.android?.accuracy === 'coarse' ||                 // Android
      permiso.ios?.accuracy === 'reduced' ||                    // iOS
      (pos.coords.accuracy ?? 0) > 1000;                        // radio grande: aproximada
    return { latitud: pos.coords.latitude, longitud: pos.coords.longitude, aproximada };
  } catch {
    return null;
  }
}
```

**d)** **No** hace falta segundo plano para "farmacias cercanas": alcanza con primer plano. Si lo pedís, Google Play exige una declaración en Play Console y que la ubicación en segundo plano sea esencial para la función principal.

### E3. Notificaciones mudas

**a)** Causa más probable: en Android 13+ no se creó antes un **canal** de notificaciones y el diálogo no aparece. Hay que crearlo (`setNotificationChannelAsync`) antes de pedir el permiso.
**b)** En Android 12 o anterior `POST_NOTIFICATIONS` no existe: las notificaciones están permitidas por defecto y no hay diálogo.
**c)** Las **provisionales** (`allowProvisional: true`): llegan en silencio sin diálogo. Se detectan con `ios.status === IosAuthorizationStatus.PROVISIONAL`.
**d)** Conviene pedirlo en el momento en que la persona entiende el beneficio. Buen momento: al activar el interruptor "Avisarme cuando se resuelva mi reporte". Mal momento: al abrir la app por primera vez.

### E4. Fotos sin pedir permiso

| Necesidad | Herramienta | Permiso |
|---|---|---|
| Elegir una foto de perfil | `ImagePicker.launchImageLibraryAsync` (selector del sistema) | Ninguno |
| Sacar una foto en el momento | `expo-camera` o `ImagePicker.launchCameraAsync` | Cámara |
| Editor que muestra toda la galería | `expo-media-library` | Permiso de fotos (acceso a la galería) |
| Adjuntar la foto de un comprobante | Selector del sistema (`ImagePicker`) | Ninguno |

Google Play restringe `READ_MEDIA_IMAGES` y `READ_MEDIA_VIDEO` porque dan acceso a toda la galería; permite usarlos solo si la función principal los necesita y pide, si no, usar el selector del sistema (a confirmar: fecha exacta de entrada en vigor). **"El mejor permiso" es el que no hace falta pedir:** el selector del sistema da la foto elegida sin ningún permiso.

### E5. Volver de Ajustes

```ts
const estabaAfuera = /inactive|background/.test(anterior.current);
if (estabaAfuera && nuevo === 'active') revisar();
return () => sub.remove();
```

**a)** Porque los hooks leen el permiso al montarse; el sistema no avisa a la app cuando cambia en Ajustes (la app está en segundo plano o hasta se reinicia).
**b)** La tercera: `consultarPermiso` (el `get…`), que consulta sin mostrar diálogo.
**c)** Porque la persona puede cambiarlo cuando quiera desde Ajustes: la fuente de verdad es el sistema, y una copia guardada se queda vieja.

---

## Parte F · Buenas prácticas y tiendas

### F1. Pedir en contexto

| App y permiso | ¿Cuándo pedirlo? | Alternativa si lo deniegan |
|---|---|---|
| Delivery · ubicación | Al tocar "Usar mi ubicación" para la dirección de entrega. | Escribir la dirección a mano. |
| Billetera virtual · cámara | Al tocar "Escanear QR" para pagar. | Ingresar el código o alias a mano. |
| Red social · contactos | Al tocar "Buscar amigos". | Buscar por nombre o enviar un link de invitación. |
| Mensajería · micrófono | Al mantener presionado para grabar un audio. | Escribir el mensaje. |
| Turnos médicos · notificaciones | Al confirmar un turno ("¿Querés un recordatorio?"). | Ver los turnos y avisos dentro de la app. |
| Editor de fotos · galería completa | Al tocar "Abrir mi galería". | Usar el selector del sistema para elegir una foto. |

Pedir cuatro permisos al abrir la app "entrena el No permitir automático": la persona todavía no entiende el beneficio, rechaza por reflejo y, en iOS, ese "no" es definitivo.

### F2. La pantalla previa

**a)** Beneficio concreto en una frase, qué dato se usa, y la aclaración de que se puede cambiar después en Ajustes.
**b)** Porque el botón "Permitir" hace creer que la persona ya concedió, y todavía falta el diálogo del sistema; "Continuar" refleja que sigue otro paso.
**c)** Que los botones de esa pantalla no deben ofrecer una salida que evite el diálogo del sistema (no manipular a la persona): por eso no hay "Ahora no" ni "Cerrar", solo "Continuar" (según el enunciado del TP; a confirmar el texto exacto de la pauta).
**d)** Cuando el permiso ya está bloqueado, el sistema no pregunta: la pantalla explica el camino en Ajustes y el botón pasa a ser "Abrir Ajustes", junto con la alternativa.

### F3. Mínimo privilegio

**a)** **Aproximada**: para barrios alcanza una zona.
**b)** **"Siempre"**: registrar una carrera con el celular en el bolsillo exige segundo plano.
**c)** **Selector del sistema**: no hace falta ningún permiso para elegir una foto.
**d)** `expo-camera` **sin micrófono**: un QR no necesita audio.

### F4. Tiendas

**a)** Google Play: apuntar al API exigido (36 desde agosto de 2026) y completar la declaración de seguridad de datos / justificar permisos sensibles. App Store: textos de propósito en el `Info.plist` y declarar la privacidad (App Privacy + manifiesto de privacidad).
**b)** `PrivacyInfo.xcprivacy` es el manifiesto de privacidad de Apple: declara qué datos se recolectan y qué API de "razón requerida" usa la app. En Expo se configura en `app.json` → `expo.ios.privacyManifests`.
**c)** Android 17 suma el **selector de contactos** (Contact Picker): permite compartir solo algunos contactos sin dar acceso a toda la libreta. Google Play va a exigir, desde el **27/01/2027** (fecha de fuentes secundarias, a confirmar), que las apps que apuntan a Android 17 y piden `READ_CONTACTS` completen una declaración que justifique por qué no les alcanza el selector.

### F5. Errores comunes

- **a)** Falta el texto de propósito (p. ej. `NSCameraUsageDescription`): agregarlo con `cameraPermission` del plugin de `expo-camera` (o `ios.infoPlist`) y hacer una build nueva.
- **b)** En Expo Go la cámara funciona con lo que declara Expo Go; en la build propia, si falta `CAMERA` en el manifiesto Android la deniega sin diálogo, o el permiso ya quedó bloqueado en una prueba anterior. Solución: declarar el permiso en `app.json`, reconstruir y resetear permisos (D6.d).
- **c)** La app no vuelve a consultar al regresar de Ajustes: usar `AppState` (hook `useRevisarAlVolver`) y llamar a `get…` al volver a `active`.
- **d)** Se llama a `request…()` en cada render: moverlo a un evento (tap en "Continuar") o a un `useEffect` con dependencias estables, y no insistir si `canAskAgain` es `false`.
- **e)** No bloquear la app: cada función tiene alternativa (bandeja de avisos dentro de la app, entrada a mano), y se explica cómo habilitar el permiso sin impedir el uso.
