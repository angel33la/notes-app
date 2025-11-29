import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
    note: Note;
    onPress: () => void;
}

const NoteItem = ({ note, onPress }: Props) => (
    <TouchableOpacity onPress={onPress} style={styles.item}>
        <Text>{note.content}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
});

export default NoteItem;