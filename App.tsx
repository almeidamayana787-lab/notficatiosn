import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { loadLastSeconds, saveLastSeconds } from './src/storage';

const BG = '#050505';
const GOLD = '#FFD700';
const TEXT = '#FAFAFA';
const MUTED = '#9A9A9A';

const DEFAULT_SECONDS = 8;
const MIN_SECONDS = 1;
const MAX_SECONDS = 86400;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('timer-high', {
    name: 'Timer',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: GOLD,
    sound: 'default',
  });
}

function parseSeconds(text: string): number | null {
  if (!text.trim()) return null;
  const n = parseInt(text, 10);
  if (!Number.isFinite(n) || n < MIN_SECONDS || n > MAX_SECONDS) return null;
  return n;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [secondsText, setSecondsText] = useState(String(DEFAULT_SECONDS));
  const [hydrated, setHydrated] = useState(false);
  const [permission, setPermission] =
    useState<Notifications.PermissionStatus | null>(null);
  const [scheduledId, setScheduledId] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState('');

  const secondsValid = useMemo(
    () => parseSeconds(secondsText) !== null,
    [secondsText]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureAndroidChannel();
      const last = await loadLastSeconds();
      if (!cancelled && last !== null) {
        setSecondsText(String(last));
      }
      setHydrated(true);

      const { status: existing } = await Notifications.getPermissionsAsync();
      let next = existing;
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        next = status;
      }
      if (!cancelled) setPermission(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      setStatusLine('Notificação entregue.');
      setScheduledId(null);
    });
    return () => sub.remove();
  }, []);

  const onChangeSeconds = useCallback((t: string) => {
    const cleaned = t.replace(/[^0-9]/g, '');
    setSecondsText(cleaned);
  }, []);

  const activateTimer = useCallback(async () => {
    const sec = parseSeconds(secondsText);
    if (sec === null) {
      Alert.alert(
        'Valor inválido',
        `Informe um número entre ${MIN_SECONDS} e ${MAX_SECONDS} segundos.`
      );
      return;
    }
    if (permission !== 'granted') {
      Alert.alert(
        'Permissão de notificações',
        'Ative as notificações para o Nubank nas Configurações do sistema para usar o timer.'
      );
      return;
    }

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      /* optional on unsupported devices */
    }

    if (scheduledId) {
      await Notifications.cancelScheduledNotificationAsync(scheduledId);
      setScheduledId(null);
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Nubank',
        body: 'Timer concluído.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: sec,
        repeats: false,
        channelId: Platform.OS === 'android' ? 'timer-high' : undefined,
      },
    });

    await saveLastSeconds(sec);
    setScheduledId(id);
    setStatusLine(`Agendado: ${sec}s`);
  }, [permission, scheduledId, secondsText]);

  const cancelTimer = useCallback(async () => {
    if (!scheduledId) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      /* optional */
    }
    await Notifications.cancelScheduledNotificationAsync(scheduledId);
    setScheduledId(null);
    setStatusLine('Agendamento cancelado.');
  }, [scheduledId]);

  if (!fontsLoaded || !hydrated) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator color={GOLD} size="large" />
        <StatusBar style="light" />
      </View>
    );
  }

  const canActivate = secondsValid && permission === 'granted';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        <View style={styles.inner}>
          <Text style={styles.brand}>Nubank</Text>
          <Text style={styles.sub}>Notificação local em segundos</Text>

          <Text style={styles.label}>Segundos</Text>
          <TextInput
            style={styles.input}
            value={secondsText}
            onChangeText={onChangeSeconds}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="8"
            placeholderTextColor={MUTED}
            selectionColor={GOLD}
            editable={permission === 'granted'}
          />

          {permission && permission !== 'granted' ? (
            <Text style={styles.warn}>
              Permissão de notificações negada. Abra Ajustes e permita alertas
              para este app (Expo Go).
            </Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              !canActivate && styles.btnDisabled,
              pressed && canActivate && styles.btnPressed,
            ]}
            onPress={activateTimer}
            disabled={!canActivate}
          >
            <Text style={styles.primaryBtnText}>ATIVAR TIMER</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              !scheduledId && styles.btnDisabled,
              pressed && scheduledId && styles.secondaryPressed,
            ]}
            onPress={cancelTimer}
            disabled={!scheduledId}
          >
            <Text style={styles.secondaryBtnText}>CANCELAR</Text>
          </Pressable>

          {statusLine ? <Text style={styles.status}>{statusLine}</Text> : null}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  brand: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: GOLD,
    textAlign: 'center',
    letterSpacing: 1,
  },
  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: MUTED,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 36,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: TEXT,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 28,
    color: TEXT,
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    textAlign: 'center',
  },
  warn: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#FFB4B4',
    marginTop: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryBtn: {
    marginTop: 28,
    backgroundColor: GOLD,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnPressed: {
    opacity: 0.9,
  },
  primaryBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#0A0A0A',
    letterSpacing: 1.2,
  },
  secondaryBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: GOLD,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryPressed: {
    opacity: 0.85,
  },
  secondaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: GOLD,
    letterSpacing: 0.8,
  },
  status: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    marginTop: 22,
  },
});
