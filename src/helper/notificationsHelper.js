import { Alert } from 'react-native';

// Mantém os nomes usados no material MOBILE_009.
export const isExpoGo = true;

// Alert.alert funciona com o app aberto e não exige permissão de notificações.
export async function registerForLocalNotificationsAsync() {
  return true;
}

export async function triggerLocalNotification(title, body) {
  Alert.alert(`🔔 ${title}`, body, [{ text: 'OK' }], { cancelable: true });
}
