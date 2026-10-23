# TP3 Permisos móviles: respuestas de las Partes A a F

Alumno: Alfonso Zagaña Torancio.
Materia: Taller Complementario React Native II. Instituto Politécnico Formosa.
Proyecto: Expo SDK 58 con Expo Router. Las preguntas hablan de SDK 57. Donde el dato cambia entre las dos versiones, lo aclaro.

---

## Parte A. ¿Qué es un permiso y por qué existe?

### A1. Conceptos

a) Un permiso es la autorización para que una app use un recurso o un dato sensible. Por ejemplo, la cámara, la ubicación o los contactos. El sistema protege esos recursos por defecto.

- La app declara qué necesita y lo pide en el momento en que lo va a usar.
- El sistema operativo muestra el diálogo, guarda la respuesta y hace cumplir la decisión.
- La persona usuaria es la dueña de los datos. Concede, niega o revoca el permiso.

b) La caja de arena (sandbox) aísla a cada app. Una app no puede leer los archivos de otra app ni usar el hardware sin pasar por el sistema. Los permisos son la forma controlada de salir de esa caja. Sin ningún permiso, una app puede mostrar su interfaz, guardar datos en su propio almacenamiento y hacer cálculos. En Android también puede usar internet, porque INTERNET se concede solo al instalar.

c) Las cuatro razones son:

1. Privacidad. La ubicación y los contactos son datos personales. Ejemplo: una linterna no necesita saber dónde estás.
2. Seguridad. Se evita que una app maliciosa encienda la cámara o el micrófono sin aviso. Ejemplo: una app espía que graba audio.
3. Control de la persona. La persona decide qué comparte y puede cambiarlo después. Ejemplo: elegir "Solo esta vez" para la ubicación.
4. Cuidado de los recursos. Se evita el abuso de batería, datos o avisos. Ejemplo: desde Android 13 las notificaciones necesitan permiso.

d) La visita es la app. El portero es el sistema operativo. El dueño del departamento es la persona usuaria. "El portero se acuerda de la respuesta" significa que el sistema guarda la decisión. Si la persona dijo que no, la app no puede volver a preguntar cuando quiera. En iOS no puede preguntar nunca más. En Android 11 o superior no puede después de dos rechazos.

### A2. Declarar y solicitar

|                              | Declarar (al compilar)                                                                                                                           | Solicitar (al ejecutar)                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| ¿Qué se hace?              | Se anuncia qué permisos usa la app y, en iOS, para qué los usa.                                                                                | Se le pide a la persona que autorice, con el diálogo del sistema.                                                           |
| ¿Dónde / cómo en Android? | En `AndroidManifest.xml`, con `<uses-permission>`.                                                                                           | Con `requestPermissions` del sistema. Solo para permisos de tiempo de ejecución.                                          |
| ¿Dónde / cómo en iOS?     | En `Info.plist`, con la clave `NS...UsageDescription` y el texto de propósito.                                                              | Con la función del framework de cada recurso. El diálogo aparece una sola vez.                                             |
| ¿Dónde / cómo en Expo?    | En `app.json`: el plugin de cada módulo, `android.permissions`, `android.blockedPermissions` e `ios.infoPlist`. Se aplica con prebuild. | Con las funciones de cada módulo: `use...Permissions()`, `get...PermissionsAsync()` y `request...PermissionsAsync()`. |
| ¿Qué pasa si se omite?     | Android deniega el pedido sin mostrar diálogo. iOS cierra la app y la build puede ser rechazada.                                                | La función no anda. Sin pedir no hay permiso, salvo los de instalación.                                                    |

### A3. Verdadero o falso

- a) F. El diálogo lo dibuja el sistema operativo, no la app. Por eso no se puede cambiar su diseño.
- b) V.
- c) F. Un permiso nuevo cambia el código nativo (`Info.plist`). Eso exige una build nueva. Una actualización OTA solo cambia JavaScript y recursos.
- d) F. Si el permiso no está en el manifiesto, Android lo deniega sin mostrar el diálogo.
- e) F. `expo-permissions` es un paquete obsoleto. En SDK 57 cada módulo trae sus propias funciones de permiso.
- f) V.
- g) V.
- h) F. No es confiable. El resultado depende de la versión del sistema y de la forma de borrar la app. Lo confiable es resetear el permiso con `adb` o con `xcrun simctl` (ver D6 d).

### A4. Los estados de un permiso

a) Diagrama de estados:

- Android: sin decidir, luego diálogo, luego concedido o denegado. Un denegado se puede volver a pedir. Si la persona rechaza otra vez (Android 11 o superior), queda bloqueado. Desde Ajustes se puede cambiar siempre.
- iOS: sin decidir, luego diálogo (una sola vez), luego concedido o denegado. Denegado ya es definitivo. Solo se cambia desde Ajustes.

La diferencia central es esta: Android da dos oportunidades para preguntar y iOS da una sola.

b)

| Estado                             | status           | canAskAgain | ¿Puede aparecer el diálogo?                           |
| ---------------------------------- | ---------------- | ----------- | ------------------------------------------------------- |
| Sin decidir                        | `undetermined` | `true`    | Sí                                                     |
| Concedido                          | `granted`      | `true`    | No hace falta                                           |
| Denegado (se puede volver a pedir) | `denied`       | `true`    | Sí. Solo pasa en Android, después del primer rechazo. |
| Bloqueado                          | `denied`       | `false`   | No. Solo desde Ajustes.                                 |

---

## Parte B. Android: tipos de permisos y manifiesto

### B1. Clasificá los permisos

| Permiso                     | Tipo                                            | ¿Cómo se obtiene?                                                                                |
| --------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `INTERNET`                | De instalación                                 | Se concede solo al instalar.                                                                       |
| `CAMERA`                  | De tiempo de ejecución                         | Con el diálogo al pedirlo.                                                                        |
| `VIBRATE`                 | De instalación                                 | Al instalar.                                                                                       |
| `SYSTEM_ALERT_WINDOW`     | Especial                                        | La persona lo activa en Ajustes, en "Mostrar sobre otras apps".                                    |
| `POST_NOTIFICATIONS`      | De tiempo de ejecución (Android 13 o superior) | Con el diálogo. Antes de Android 13 no existe.                                                    |
| `ACCESS_NETWORK_STATE`    | De instalación                                 | Al instalar.                                                                                       |
| `READ_CONTACTS`           | De tiempo de ejecución                         | Con el diálogo.                                                                                   |
| `SCHEDULE_EXACT_ALARM`    | Especial                                        | La persona lo activa en Ajustes, en "Alarmas y recordatorios".                                     |
| `RECORD_AUDIO`            | De tiempo de ejecución                         | Con el diálogo.                                                                                   |
| `MANAGE_EXTERNAL_STORAGE` | Especial                                        | La persona lo activa en Ajustes, en "Acceso a todos los archivos". Google Play lo restringe mucho. |

### B2. Grupos y nombres

a) Un grupo de permisos junta permisos parecidos, por ejemplo los de ubicación. Si la app pide `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` juntos, la persona ve un solo diálogo. Desde Android 12 ese diálogo ofrece "Precisa" o "Aproximada".

b) El nombre completo lleva el prefijo `android.permission.`. El permiso de cámara es `android.permission.CAMERA`.

c) Los permisos de firma (signature) solo se conceden a apps firmadas con el mismo certificado que la app o el sistema que define el permiso. No se usan en apps comunes porque la persona no los puede autorizar. Una app de terceros no los puede obtener.

### B3. Leé el manifiesto

a) Se concede solo al instalar: `INTERNET`. Hay que pedir en tiempo de ejecución: `CAMERA`, `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, `POST_NOTIFICATIONS` (Android 13 o superior) y `READ_EXTERNAL_STORAGE` (solo hasta Android 12L). `RECORD_AUDIO` no queda en el manifiesto final.

b) `android:maxSdkVersion="32"` significa que el permiso solo se declara hasta Android 12L (API 32). Desde Android 13 lo reemplazan `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` y `READ_MEDIA_AUDIO`. En Android 14 se suma `READ_MEDIA_VISUAL_USER_SELECTED` para el acceso parcial.

c) `tools:node="remove"` le indica al combinador de manifiestos que quite ese permiso, aunque una librería lo agregue. Lo genera este fragmento de `app.json`:

```json
{
  "expo": {
    "android": {
      "blockedPermissions": ["android.permission.RECORD_AUDIO"]
    }
  }
}
```

d) Va en `expo.android.permissions`:

```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.SCHEDULE_EXACT_ALARM"]
    }
  }
}
```

e) No conviene editarlo a mano porque la carpeta `android` se vuelve a generar con prebuild. Con `--clean` se pierden los cambios manuales. La fuente de verdad es `app.json`. `blockedPermissions` no funciona en Expo Go, porque Expo Go es otra app con su propio manifiesto. Hace falta una development build.

### B4. Así pregunta Android

a) No. El texto del diálogo lo pone el sistema. La explicación va antes, en una pantalla previa de la app.

b) "Mientras la app está en uso" vale cada vez que la app está abierta y se mantiene en las próximas sesiones. "Solo esta vez" se revoca poco después de salir de la app. Existe desde Android 11 para la ubicación, la cámara y el micrófono.

c) El permiso queda bloqueado. El sistema ya no muestra el diálogo y `canAskAgain` vale `false`.

d) Anda bien: mostrar el clima o las farmacias de la zona. No anda bien: la navegación calle por calle o registrar el recorrido de una carrera.

e) Android cierra el proceso de la app. Al volver, la app arranca de nuevo. Por eso el código debe consultar el permiso al iniciar y al volver a primer plano.

### B5. Android, versión por versión

| Cambio                                                             | Versión (API)      | Qué implica para el código                                                                           |
| ------------------------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------ |
| Nacen los permisos en tiempo de ejecución                         | Android 6 (API 23)  | No alcanza con declarar. Hay que pedir el permiso mientras la app corre.                               |
| La ubicación en segundo plano pasa a ser un permiso aparte        | Android 10 (API 29) | `ACCESS_BACKGROUND_LOCATION` es otro permiso. Desde Android 11 se pide después del de primer plano. |
| Dos rechazos equivalen a "no volver a preguntar"                   | Android 11 (API 30) | Hay que mirar `canAskAgain` y llevar a Ajustes cuando vale `false`.                                |
| Ubicación precisa o aproximada                                    | Android 12 (API 31) | Hay que declarar los dos permisos y aceptar que llegue solo la aproximada.                             |
| Las notificaciones pasan a ser un permiso (`POST_NOTIFICATIONS`) | Android 13 (API 33) | Hay que crear el canal y después pedir el permiso.                                                    |
| Acceso parcial a fotos y videos ("Seleccionar fotos")              | Android 14 (API 34) | Aparece `READ_MEDIA_VISUAL_USER_SELECTED`. Conviene usar el selector del sistema.                    |
| Permiso de red local (`ACCESS_LOCAL_NETWORK`)                    | Android 17 (API 37) | Las apps que apuntan a API 37 deben declararlo y pedirlo para hablar con equipos de la red local.      |

`targetSdkVersion` indica para qué versión de Android se preparó la app. El sistema le aplica las reglas nuevas de esa versión. Expo SDK 57 apunta a API 36 (Android 16). SDK 58, que usa este proyecto, también apunta a API 36. Google Play exige desde el 31 de agosto de 2026 que las apps nuevas y las actualizaciones apunten a API 36 o superior.

---

## Parte C. iOS: textos de propósito y acceso parcial

### C1. Claves del Info.plist

| Recurso                  | Clave en Info.plist                              |
| ------------------------ | ------------------------------------------------ |
| Cámara                  | `NSCameraUsageDescription`                     |
| Micrófono               | `NSMicrophoneUsageDescription`                 |
| Ubicación en uso        | `NSLocationWhenInUseUsageDescription`          |
| Ubicación siempre       | `NSLocationAlwaysAndWhenInUseUsageDescription` |
| Fotos (leer)             | `NSPhotoLibraryUsageDescription`               |
| Fotos (solo guardar)     | `NSPhotoLibraryAddUsageDescription`            |
| Contactos                | `NSContactsUsageDescription`                   |
| Face ID                  | `NSFaceIDUsageDescription`                     |
| Rastreo entre apps (ATT) | `NSUserTrackingUsageDescription`               |
| Notificaciones           | No lleva clave.                                  |

### C2. Sin texto, no hay permiso

a) Si falta el texto y la app usa la cámara, iOS cierra la app. Al subir la build a App Store Connect, Apple la rechaza con el error ITMS-90683 (falta el texto de propósito en el `Info.plist`).

b) iOS muestra el diálogo una sola vez. Si la persona dice que no, a la app le queda ofrecer una alternativa y un botón para ir a Ajustes.

c) El sistema arma el título y los botones del diálogo. La app escribe solo el texto de propósito. En Expo se configura en `app.json`, en las opciones del plugin de cada módulo (por ejemplo `cameraPermission`) o en `ios.infoPlist`.

d) Apple revisa el binario y encuentra el uso de la API protegida dentro de la librería, aunque la app nunca la llame. Por eso exige el texto. Se resuelve agregando el texto de propósito o quitando la librería que usa esa API.

### C3. Probador de textos de propósito

| Texto propuesto                                                             | ¿Aprobado?                                             | Versión mejorada                                                          |
| --------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------- |
| "Necesitamos tu ubicación."                                                | No. No dice para qué.                                  | "Usamos tu ubicación para mostrarte los comercios que tenés cerca."      |
| "Para mejorar tu experiencia."                                              | No. No dice qué dato ni qué beneficio.                | "Usamos tu ubicación para ordenar los resultados por cercanía."          |
| "Usamos tu ubicación para mostrarte las farmacias de turno más cercanas." | Sí. Tiene el dato y un beneficio concreto.             | No hace falta cambiarlo.                                                   |
| "La app no funciona sin ubicación."                                        | No. Presiona a la persona y no explica el beneficio.    | "Usamos tu ubicación para mostrarte las sucursales más cercanas."        |
| "Ubicación requerida por el sistema."                                      | No. Es falso, porque la pide la app, y no explica nada. | "Usamos tu ubicación para marcar dónde está el problema que reportás." |

### C4. Acceso parcial y gradual

| Caso                                                   | iOS      | En Expo                                                                                                                                               |
| ------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fotos limitadas ("Seleccionar fotos")                  | iOS 14   | `expo-media-library`: `status: 'granted'` con `accessPrivileges: 'limited'`.                                                                    |
| Ubicación aproximada (interruptor "Precisa")          | iOS 14   | `expo-location`: `ios.accuracy: 'reduced'` en la respuesta del permiso.                                                                           |
| "Permitir una vez" (ubicación)                        | iOS 13   | No hay un campo propio. Durante la sesión llega `granted`. Al volver a abrir la app el estado vuelve a `undetermined`.                           |
| Ubicación escalonada: de "al usar la app" a "Siempre" | iOS 13   | Primero `requestForegroundPermissionsAsync()` y después `requestBackgroundPermissionsAsync()`.                                                   |
| Notificaciones provisionales                           | iOS 12   | Se piden con `requestPermissionsAsync({ ios: { allowProvisional: true } })`. Se detectan con `ios.status === IosAuthorizationStatus.PROVISIONAL`. |
| Rastreo entre apps (App Tracking Transparency)         | iOS 14.5 | `expo-tracking-transparency`: `requestTrackingPermissionsAsync()`.                                                                                |

Expo SDK 57 requiere iOS 16.4 como mínimo. SDK 58 mantiene el mismo mínimo. La consecuencia práctica es que todos los casos de la tabla existen en cualquier iPhone compatible. No hace falta código distinto por versión de iOS.

### C5. Android vs iOS, lado a lado

|                                      | Android                                                                        | iOS                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| ¿Dónde se declara?                 | `AndroidManifest.xml`, con `uses-permission`.                              | `Info.plist`, con `NS...UsageDescription`.                              |
| Texto en el diálogo                 | Lo pone el sistema. No se puede cambiar.                                       | La app escribe el texto de propósito.                                      |
| Oportunidades para preguntar         | Dos (Android 11 o superior).                                                   | Una.                                                                        |
| "Solo esta vez" / "Permitir una vez" | "Solo esta vez" desde Android 11, para ubicación, cámara y micrófono.       | "Permitir una vez" desde iOS 13, para ubicación.                           |
| Notificaciones                       | Permiso `POST_NOTIFICATIONS` desde Android 13. Antes hay que crear un canal. | Diálogo sin texto de propósito. Existen las notificaciones provisionales. |
| Ubicación en segundo plano          | Permiso aparte desde Android 10. Se pide después del de primer plano.         | Escalonada. "Siempre" se ofrece después de "al usar la app".               |
| Si falta la declaración             | El pedido se deniega sin diálogo.                                             | La app se cierra y la build se rechaza.                                     |

---

## Parte D. Expo: una API, dos plataformas

### D1. Módulos y funciones

| Necesidad                                    | Módulo                        | Hook / función de permiso                                                  |
| -------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| Escanear un QR con la cámara                | `expo-camera`                | `useCameraPermissions()`                                                  |
| Grabar video con sonido                      | `expo-camera`                | `useCameraPermissions()` y `useMicrophonePermissions()`                 |
| Mostrar farmacias cercanas                   | `expo-location`              | `useForegroundPermissions()`                                              |
| Seguir un envío con la app en segundo plano | `expo-location`              | `useForegroundPermissions()` y después `useBackgroundPermissions()`    |
| Mostrar un recordatorio                      | `expo-notifications`         | `getPermissionsAsync()` y `requestPermissionsAsync()`                   |
| Grabar una nota de voz                       | `expo-audio`                 | `getRecordingPermissionsAsync()` y `requestRecordingPermissionsAsync()` |
| Galería propia dentro de la app             | `expo-media-library`         | `usePermissions()`                                                        |
| Publicidad personalizada entre apps (iOS)    | `expo-tracking-transparency` | `useTrackingPermissions()`                                                |

Si un tutorial usa `import * as Permissions from 'expo-permissions'`, el tutorial está desactualizado. Ese paquete quedó obsoleto y hoy cada módulo pide sus propios permisos.

### D2. Consultar, pedir y el hook

a) `get...PermissionsAsync()` solo lee el estado y nunca muestra el diálogo. `request...PermissionsAsync()` pide el permiso y es la única que puede mostrar el diálogo.

b) El hook devuelve tres elementos. `permiso` es el estado actual. `pedirPermiso` muestra el diálogo si se puede. `consultarPermiso` vuelve a leer el estado sin diálogo. En el primer render `permiso` vale `null`. Mientras tanto, la pantalla debe mostrar un indicador de carga.

c) Si `canAskAgain` es `false`, `request...()` devuelve `denied` enseguida y no muestra el diálogo. Si se la llama en un bucle, por ejemplo en cada render, la pantalla queda en "Pidiendo permiso..." para siempre y no se logra nada.

### D3. Leé la respuesta

| Respuesta                                                  | Qué hace la app                                                                                          |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `null`                                                   | Todavía no se sabe el estado. Muestra un indicador de carga.                                             |
| `{ status: 'granted', granted: true }`                   | Usa la función.                                                                                          |
| `{ status: 'undetermined', canAskAgain: true }`          | Muestra la pantalla previa. Al tocar "Continuar", pide el permiso.                                        |
| `{ status: 'denied', canAskAgain: true }`                | Muestra la alternativa. Vuelve a ofrecer la pantalla previa solo si la persona toca otra vez la función. |
| `{ status: 'denied', canAskAgain: false }`               | Está bloqueado. Muestra cómo activarlo, el botón "Abrir Ajustes" y la alternativa.                     |
| `{ status: 'granted', accessPrivileges: 'limited' }`     | Funciona con las fotos elegidas. Avisa que el acceso es parcial y ofrece cambiar la selección.           |
| `{ status: 'granted', android: { accuracy: 'coarse' } }` | Funciona con ubicación aproximada. No muestra coordenadas exactas.                                       |

Los dos campos que deciden casi todo son `granted` y `canAskAgain`. `granted` responde "¿puedo usar la función ahora?". `canAskAgain` responde "¿puedo volver a mostrar el diálogo?".

### D4. Simulación del ciclo completo

| # | Acción                                                                                     | status                                                  | canAskAgain            | ¿Diálogo?               |
| - | ------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------- | ------------------------- |
| 1 | `getForegroundPermissionsAsync()`                                                         | `undetermined`                                        | `true`               | No                        |
| 2 | `requestForegroundPermissionsAsync()` y "No permitir"                                     | `denied`                                              | `true`               | Sí                       |
| 3 | `requestForegroundPermissionsAsync()` y "No permitir"                                     | `denied`                                              | `false`              | Sí                       |
| 4 | `requestForegroundPermissionsAsync()`                                                     | `denied`                                              | `false`              | No. Responde al instante. |
| 5 | `Linking.openSettings()`, activa "Mientras la app está en uso", vuelve y la app consulta | `granted`                                             | `true`               | No                        |
| 6 | Igual que el 5, pero la app no vuelve a consultar                                           | Sigue mostrando el estado viejo: `denied` y bloqueado | `false` (dato viejo) | No                        |

En iOS el resultado cambia en el paso 2. Con "No permitir" el permiso queda `denied` con `canAskAgain: false`, porque iOS pregunta una sola vez. En los pasos 3 y 4 no aparece ningún diálogo. Si la persona elige "Permitir una vez" y después cierra y abre la app, el permiso vuelve a `undetermined` y la app puede preguntar de nuevo.

### D5. Configurar app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Usamos tu cámara para leer el código QR del punto de reciclaje.",
          "microphonePermission": false,
          "recordAudioAndroid": false
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Usamos tu ubicación para mostrarte los puntos de reciclaje cercanos.",
          "locationAlwaysAndWhenInUsePermission": false,
          "locationAlwaysPermission": false
        }
      ]
    ],
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.ACCESS_BACKGROUND_LOCATION"
      ]
    }
  }
}
```

`expo-camera` agrega `RECORD_AUDIO` en Android porque la cámara también puede grabar video con sonido. Por defecto `recordAudioAndroid` vale `true`. Por eso hay que apagarlo a mano.

### D6. Expo Go no es tu app

a) En Expo Go se usan el `Info.plist` y el manifiesto de Expo Go, no los de mi app. Mis textos de propósito solo existen dentro de una build propia.

b) En Expo Go se pueden probar la cámara, la ubicación en primer plano y las notificaciones locales. Hace falta una development build para las notificaciones push en Android, para la ubicación en segundo plano y para ver los textos y permisos propios (plugins y `blockedPermissions`).

c) Comandos:

```
npx expo prebuild --clean
npx expo run:android
```

El primero genera las carpetas `android` e `ios` para ver los archivos nativos. El segundo compila e instala la development build en Android. También se puede compilar con `eas build --profile development --platform android`.

d) Para volver a "sin decidir" sin reinstalar:

- Android: `adb shell pm reset-permissions` resetea los permisos de todas las apps. `adb shell pm clear ar.edu.ipf.mantenimiento` resetea solo esta app, pero también borra sus datos.
- Simulador de iOS: `xcrun simctl privacy booted reset all ar.edu.ipf.mantenimiento`.

---

## Parte E. Recetas: leer y corregir código

### E1. Encontrá los errores (cámara)

Errores:

1. En el primer render `permiso` vale `null`. `permiso.status` rompe la app. Falta el estado de carga.
2. No existe el estado bloqueado. Si `canAskAgain` es `false`, el botón no hace nada y la persona queda trabada.
3. El botón dice "Permitir". Debe decir "Continuar", porque después viene el diálogo del sistema.
4. `Explicacion` se usa pero no está importado.
5. `CameraView` no tiene `barcodeScannerSettings` ni `onBarcodeScanned`. No lee ningún QR.

Versión corregida:

```tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator, Button, Linking, Text, View } from 'react-native';

export default function Escanear() {
  const [permiso, pedirPermiso] = useCameraPermissions();

  function alLeer(resultado: { data: string }) {
    console.log(resultado.data);
  }

  if (!permiso) {
    return <ActivityIndicator />;
  }

  if (permiso.granted) {
    return (
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={alLeer}
      />
    );
  }

  if (permiso.canAskAgain) {
    return (
      <View>
        <Text>Usamos la cámara para leer el QR del aula.</Text>
        <Button title="Continuar" onPress={pedirPermiso} />
      </View>
    );
  }

  return (
    <View>
      <Text>La cámara está bloqueada. Podés activarla en Ajustes.</Text>
      <Button title="Abrir Ajustes" onPress={() => Linking.openSettings()} />
    </View>
  );
}
```

### E2. El orden importa (ubicación)

a) La función pide primero el permiso de segundo plano. En iOS "Siempre" es un paso posterior a "al usar la app". Si se pide primero, la persona no ve la opción correcta. En Android 11 o superior el sistema no muestra el diálogo de segundo plano si antes no se concedió el de primer plano. Además, si se deniega "siempre", la función devuelve `false` aunque el primer plano esté concedido.

b)

```ts
import * as Location from 'expo-location';

export async function activarSeguimiento() {
  const enUso = await Location.requestForegroundPermissionsAsync();
  if (!enUso.granted) {
    return false;
  }
  const siempre = await Location.requestBackgroundPermissionsAsync();
  return siempre.granted;
}
```

c)

```ts
import * as Location from 'expo-location';

export async function obtenerUbicacion() {
  try {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (!permiso.granted) {
      return null;
    }
    const posicion = await Location.getCurrentPositionAsync({});
    const aproximadaAndroid = permiso.android?.accuracy === 'coarse';
    const aproximadaIos = permiso.ios?.accuracy === 'reduced';
    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      aproximada: aproximadaAndroid || aproximadaIos,
    };
  } catch {
    return null;
  }
}
```

d) No hace falta segundo plano para "farmacias cercanas". Alcanza con primer plano. Si se pide segundo plano, Google Play exige una declaración en Play Console. Además, la ubicación en segundo plano debe ser necesaria para la función principal de la app.

### E3. Notificaciones mudas

a) La causa más probable es que no se creó un canal de notificaciones antes de pedir el permiso. En Android 13 o superior el diálogo no aparece hasta que existe al menos un canal. Hay que llamar a `setNotificationChannelAsync` antes de `requestPermissionsAsync()`.

b) En Android 12 o anterior el permiso `POST_NOTIFICATIONS` no existe. Las notificaciones están permitidas por defecto y no hay diálogo.

c) Las notificaciones provisionales. Se piden con `allowProvisional: true` y llegan en silencio, sin diálogo. En código se detectan con `ios.status === IosAuthorizationStatus.PROVISIONAL`.

d) Conviene pedirlo cuando la persona entiende el beneficio. Buen momento: al activar el interruptor "Avisarme cuando se resuelva mi reporte". Mal momento: apenas se abre la app por primera vez.

### E4. Fotos sin pedir permiso

| Necesidad                           | Herramienta                                                    | Permiso              |
| ----------------------------------- | -------------------------------------------------------------- | -------------------- |
| Elegir una foto de perfil           | `ImagePicker.launchImageLibraryAsync` (selector del sistema) | Ninguno              |
| Sacar una foto en el momento        | `ImagePicker.launchCameraAsync` o `expo-camera`            | Cámara              |
| Editor que muestra toda la galería | `expo-media-library`                                         | Acceso a la galería |
| Adjuntar la foto de un comprobante  | `ImagePicker.launchImageLibraryAsync` (selector del sistema) | Ninguno              |

Google Play restringe `READ_MEDIA_IMAGES` y `READ_MEDIA_VIDEO` porque dan acceso a toda la galería. Solo los permite si la función principal de la app necesita ese acceso amplio. Para un uso puntual exige el selector del sistema. Google anunció la política en 2023. El plazo para cumplirla fue el 22 de enero de 2025, con prórroga posible hasta el 28 de mayo de 2025. "El mejor permiso" es el que no hace falta pedir. El selector del sistema entrega solo la foto elegida y no necesita ningún permiso.

### E5. Volver de Ajustes

```ts
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = anterior.current === 'background' || anterior.current === 'inactive';
      if (estabaAfuera && nuevo === 'active') revisar();
      anterior.current = nuevo;
    });
    return () => sub.remove();
  }, [revisar]);
}
```

En el proyecto esta misma lógica está dentro de `src/hooks/usePermiso.ts`.

a) Los hooks de Expo leen el permiso cuando se montan. El sistema no le avisa a la app que el permiso cambió en Ajustes. Mientras tanto la app estaba en segundo plano o incluso cerrada.

b) La tercera función del hook: `getPermission` de `useCameraPermissions()`, que en el enunciado se llama `consultarPermiso`. Consulta el estado sin mostrar el diálogo.

c) La persona puede cambiar el permiso en Ajustes cuando quiera. La fuente de verdad es el sistema. Una copia guardada "para siempre" queda vieja y la app muestra un estado falso.

---

## Parte F. Buenas prácticas y tiendas

### F1. Pedir en contexto

| App y permiso                        | ¿Cuándo pedirlo?                                                   | Alternativa si lo deniegan                           |
| ------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------- |
| Delivery · ubicación               | Al tocar "Usar mi ubicación" para la dirección de entrega.         | Escribir la dirección a mano.                       |
| Billetera virtual · cámara         | Al tocar "Escanear QR" para pagar.                                   | Escribir el código o el alias a mano.               |
| Red social · contactos              | Al tocar "Buscar amigos".                                            | Buscar por nombre o enviar un enlace de invitación. |
| Mensajería · micrófono            | Al mantener presionado el botón para grabar un audio.               | Escribir el mensaje.                                 |
| Turnos médicos · notificaciones    | Al confirmar un turno, con la pregunta "¿Querés un recordatorio?". | Ver los turnos y los avisos dentro de la app.        |
| Editor de fotos · galería completa | Al tocar "Abrir mi galería".                                        | Elegir fotos sueltas con el selector del sistema.    |

Pedir cuatro permisos apenas se abre la app "entrena el No permitir automático". La persona todavía no sabe para qué sirve cada permiso. Entonces rechaza todo por costumbre. En iOS ese rechazo es definitivo.

### F2. La pantalla previa

a) Una buena pantalla previa tiene tres elementos: el beneficio en una frase, un único botón "Continuar" y la aclaración de que se puede cambiar después en Ajustes.

b) "Permitir" hace creer que la persona ya concedió el permiso. Todavía falta el diálogo del sistema. "Continuar" muestra que sigue otro paso.

c) La pauta 5.1.1(iv) dice que la app no debe manipular ni presionar a la persona para que acepte. Según la guía de interfaz de Apple, la pantalla previa debe tener una sola acción, y esa acción debe llevar al diálogo del sistema. Apple rechazó apps con botones como "Ahora no" en esa pantalla. Por eso no se agregan "Ahora no" ni "Cerrar".

d) Si el permiso ya está bloqueado, el sistema no va a preguntar. La pantalla explica el camino exacto en Ajustes. El botón pasa a ser "Abrir Ajustes". También se muestra la alternativa.

### F3. Mínimo privilegio

a) Aproximada. Para encontrar puntos de reciclaje del barrio alcanza con conocer la zona.

b) "Siempre". Con el celular en el bolsillo la app queda en segundo plano y necesita seguir registrando la ubicación.

c) Selector del sistema. Para subir una sola foto no hace falta acceso a toda la galería.

d) `expo-camera` sin micrófono. Para leer un QR no se necesita audio.

### F4. Tiendas

a) Google Play:

- Apuntar al nivel de API exigido. Desde el 31 de agosto de 2026 es API 36.
- Completar la sección de seguridad de los datos y justificar los permisos sensibles con una declaración (ubicación en segundo plano, fotos y videos, contactos).

App Store:

- Incluir un texto de propósito claro para cada permiso en el `Info.plist`.
- Declarar la privacidad de la app en App Store Connect y en el manifiesto de privacidad.

b) `PrivacyInfo.xcprivacy` es el manifiesto de privacidad de Apple. Declara qué datos recolecta la app y qué API de "motivo requerido" usa, con el motivo. En Expo se configura en `app.json`, en `expo.ios.privacyManifests`.

c) Android 17 suma el selector de contactos (Contact Picker). La persona puede compartir solo algunos contactos, sin dar acceso a toda la libreta. Según la consigna, desde el 27/01/2027 Google Play exige que las apps que piden `READ_CONTACTS` presenten una declaración. Esa declaración debe explicar por qué el selector no alcanza para la función principal. En la ayuda de Play Console la fecha publicada para las apps que apuntan a Android 17 es el 28/10/2026.

### F5. Errores comunes

a) Causa: falta el texto de propósito, por ejemplo `NSCameraUsageDescription`. Solución: agregarlo con la opción `cameraPermission` del plugin de `expo-camera` o en `ios.infoPlist`, y hacer una build nueva.

b) Causa: Expo Go usa sus propios permisos declarados. En la build propia el permiso no está en el manifiesto, por ejemplo porque `blockedPermissions` lo bloquea o porque falta el plugin. También puede ser que el permiso haya quedado bloqueado en una prueba anterior. Solución: declarar el permiso en `app.json`, compilar de nuevo y resetear el permiso (ver D6 d).

c) Causa: la app no vuelve a consultar el permiso al regresar de Ajustes. Solución: escuchar `AppState` y llamar a `get...PermissionsAsync()` cuando la app vuelve a `active`.

d) Causa: `request...()` se llama en el cuerpo del componente, en cada render. Solución: llamarlo solo desde un evento, como el toque en "Continuar". Además, no volver a pedir si `canAskAgain` es `false`.

e) Causa: la app trata el permiso de notificaciones como obligatorio. Solución: dejar entrar siempre. Si se deniegan, mostrar los avisos dentro de la app en una bandeja y explicar cómo activarlas en Ajustes.

---

## Fuentes consultadas

- Presentación de clase "Permisos móviles".
- Guía de Expo sobre permisos: https://docs.expo.dev/guides/permissions
- Requisitos de nivel de API de Google Play: https://developer.android.com/google/play/requirements/target-sdk
- Permiso de red local de Android: https://developer.android.com/privacy-and-security/local-network-permission
- Política de fotos y videos de Google Play: https://support.google.com/googleplay/android-developer/answer/14115180
- Permisos restringidos y selector de contactos: https://support.google.com/googleplay/android-developer/answer/16935362
- Valores de SDK 57 y SDK 58 tomados del código instalado de cada versión: `expo-modules-core/android/ExpoModulesCorePlugin.gradle` (targetSdkVersion 36) y `expo-modules-core/ExpoModulesCore.podspec` (iOS 16.4).
