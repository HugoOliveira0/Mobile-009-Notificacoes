import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  registerForLocalNotificationsAsync,
  triggerLocalNotification,
} from './src/helper/notificationsHelper';
import { supabase } from './src/services/supabase';

export default function App() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const sending = useRef(false);
  const [status, setStatus] = useState(
    supabase ? '🟡 Conectando...' : '🟠 Configure o Supabase no arquivo .env',
  );

  useEffect(() => {
    // Alertas dentro do aplicativo não precisam de permissão do sistema.
    void registerForLocalNotificationsAsync();

    if (!supabase) {
      return;
    }

    let active = true;
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        ({ new: data }) => {
          if (active && data?.title && data?.body) {
            void triggerLocalNotification(data.title, data.body);
          }
        },
      )
      .subscribe((state) => {
        if (!active) {
          return;
        }
        if (state === 'SUBSCRIBED') {
          setStatus('🟢 Conectado e escutando avisos');
        } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') {
          setStatus('🔴 Falha na conexão. Verifique a internet e o Supabase.');
        } else if (state === 'CLOSED') {
          setStatus('🟠 Conexão encerrada');
        }
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  async function sendNotification() {
    const cleanTitle = title.trim();
    const cleanMessage = message.trim();

    if (!cleanTitle || !cleanMessage) {
      Alert.alert('Atenção', 'Preencha o título e a mensagem.');
      return;
    }
    if (!supabase) {
      Alert.alert(
        'Configuração necessária',
        'Preencha a URL e a chave pública do Supabase no arquivo .env e reinicie o Expo.',
      );
      return;
    }
    if (sending.current) {
      return;
    }

    sending.current = true;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{ title: cleanTitle, body: cleanMessage }]);
      if (error) {
        throw error;
      }
      setTitle('');
      setMessage('');
      Alert.alert('Sucesso', 'Aviso salvo! Os aplicativos conectados receberão o alerta.');
    } catch (error) {
      Alert.alert(
        'Erro ao enviar',
        error instanceof Error || (error && typeof error.message === 'string')
          ? error.message
          : 'Não foi possível enviar o aviso. Tente novamente.',
      );
    } finally {
      sending.current = false;
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>📡 EngComp Alert (Realtime)</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.label}>Status do sistema:</Text>
          <Text style={styles.statusText} accessibilityLiveRegion="polite">
            {status}
          </Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.subHeader}>Área do Coordenador</Text>
        <TextInput
          accessibilityLabel="Título do aviso"
          style={styles.input}
          placeholder="Título (ex.: Prova liberada)"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
          maxLength={120}
          editable={!loading}
        />
        <TextInput
          accessibilityLabel="Mensagem do aviso"
          style={[styles.input, styles.textArea]}
          placeholder="Mensagem (ex.: Confira no sistema acadêmico)"
          placeholderTextColor="#888"
          value={message}
          onChangeText={setMessage}
          maxLength={2000}
          editable={!loading}
          multiline
        />
        {loading ? (
          <ActivityIndicator
            accessibilityLabel="Enviando aviso"
            size="large"
            color="#007AFF"
          />
        ) : (
          <Button title="DISPARAR ALERTA" onPress={sendNotification} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? 40 : 60,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
});
