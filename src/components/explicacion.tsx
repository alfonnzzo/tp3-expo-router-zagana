import { StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { TEXTOS, type Recurso } from '@/lib/permisos';

type Props = {
  recurso: Recurso;
  onContinuar: () => void;
  cargando?: boolean;
};

/**
 * Pantalla previa al diálogo del sistema: el beneficio en una frase y un único
 * botón "Continuar" (sin "Ahora no" ni "Cerrar", pauta 5.1.1(iv) de Apple).
 */
export function Explicacion({ recurso, onContinuar, cargando }: Props) {
  const textos = TEXTOS[recurso];

  return (
    <ThemedView style={styles.contenedor}>
      <ThemedText type="subtitle" style={styles.centro}>
        {textos.titulo}
      </ThemedText>
      <ThemedText style={styles.centro}>{textos.beneficio}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centro}>
        Después te va a preguntar el sistema. Podés cambiar tu decisión cuando quieras desde Ajustes.
      </ThemedText>
      <Boton titulo="Continuar" onPress={onContinuar} cargando={cargando} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: Spacing.three, alignSelf: 'stretch', padding: Spacing.three },
  centro: { textAlign: 'center' },
});
