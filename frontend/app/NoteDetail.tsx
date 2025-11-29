import React, { useState, useEffect, FC } from 'react';
import { TextInput, Button, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/services/api';
import { useRouter, useLocalSearchParams } from 'expo-router';

const NoteDetail: FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      // Editing existing note
      const fetchNote = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/notes/${id}`);
          setContent(res.data.content);
        } catch {
          Alert.alert('Error', 'Failed to load note');
          router.back();
        } finally {
          setLoading(false);
        }
      };
      fetchNote();
    }
  }, [id, router]);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (id) {
        // Update existing note
        await api.put(`/notes/${id}`, { content });
      } else {
        // Create new note
        await api.post('/notes', { content });
      }
      router.back();
    } catch {
      Alert.alert('Error', `Failed to ${id ? 'update' : 'save'} note`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/notes/${id}`);
              router.back();
            } catch {
              Alert.alert('Error', 'Failed to delete note');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>{id ? 'Edit Note' : 'New Note'}</ThemedText>
      <TextInput
        nativeID="note-content"
        placeholder="Note content"
        value={content}
        onChangeText={setContent}
        style={styles.input}
        multiline
        editable={!loading}
      />
      <Button title={id ? 'Update' : 'Save'} onPress={handleSave} disabled={loading} />
      {id && <Button title="Delete" onPress={handleDelete} disabled={loading} />}
    </ThemedView>
  );
};

export default NoteDetail;
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center',
    gap: 8 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8, borderRadius: 4, minHeight: 80 },
});