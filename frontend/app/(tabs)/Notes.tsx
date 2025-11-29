import React, { useEffect, useState, useCallback } from 'react';
import { Text, Button, FlatList, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { isAxiosError } from 'axios';
import NoteItem from '../../components/NoteItem';
import api from '@/services/api';
import authService from '@/services/auth.service';
import { useFocusEffect } from '@react-navigation/native';

type Note = {
  _id: string;
  content: string;
  createdAt?: Date;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const handleNotePress = (noteId: string) => {
    router.push({
      pathname: '/NoteDetail',
      params: { id: noteId }
    });
  };

  const handleAddNote = () => {
    router.push('/NoteDetail');
  };

  const fetchNotes = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        setError('Please login to see your notes');
        setNotes([]);
        return;
      }
      const res = await api.get('/notes');
      setNotes(res.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      // If unauthorized, log out and navigate to Login
      if (isAxiosError(err) && err.response?.status === 401) {
        authService.logout().catch(() => {});
        router.push('/User');
        setError('Please login to see your notes');
        setNotes([]);
        return;
      }
      setError('Failed to fetch notes');
    }
  }, [router]);

  useEffect(() => {
    fetchNotes(); 
  }, [fetchNotes])
  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [fetchNotes])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchNotes();
    } finally {
      setRefreshing(false);
    }
  }, [fetchNotes]);

  return (
    <ThemedView style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={notes}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <NoteItem
            note={item}
            onPress={() => handleNotePress(item._id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notes yet. Tap &quot;Add Note&quot; to create your first note!</Text>}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      <Button title="Add Note" onPress={handleAddNote} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1, padding: 80, marginTop: 80, justifyContent: 'center',
    gap: 8 },
  error: { color: 'red', marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 20, color: '#666' }
});

export default Notes;