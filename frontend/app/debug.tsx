import React, { useEffect, useState, FC } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import authService from '@/services/auth.service';

const DebugScreen: FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadUser = async () => {
    setLoading(true);
    try {
      const u = await authService.getCurrentUser();
      setUser(u);
    } catch (e) {
      console.error('Failed to read stored user:', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearUser = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (e) {
      console.error('Failed to clear user:', e);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Dev: Stored User</Text>
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <View style={styles.box}>
              <Text selectable>{user ? JSON.stringify(user, null, 2) : 'No user stored'}</Text>
            </View>
          )}

          <View style={styles.buttons}>
            <Button title="Reload" onPress={loadUser} />
            <Button title="Clear Stored User" onPress={clearUser} />
          </View>

          <Text style={styles.note}>This screen is for development only. Remove it before production.</Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  box: { backgroundColor: '#f4f4f4', padding: 12, borderRadius: 6, marginBottom: 12 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  note: { color: '#888', fontSize: 12 },
});

export default DebugScreen;
