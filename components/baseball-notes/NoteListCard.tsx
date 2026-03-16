import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import type { BaseballNoteListItem } from "../../types/baseballNote";

interface NoteListCardProps {
  note: BaseballNoteListItem;
  onPress: (id: number) => void;
}

export const NoteListCard: React.FC<NoteListCardProps> = ({
  note,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(note.id)}
      activeOpacity={0.7}
    >
      <Text style={styles.title} numberOfLines={1}>
        {note.title}
      </Text>
      <Text style={styles.date}>{note.date}</Text>
      <Text style={styles.memo} numberOfLines={2}>
        {note.memo}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  date: {
    color: "#A1A1AA",
    fontSize: 12,
    marginBottom: 6,
  },
  memo: {
    color: "#D4D4D8",
    fontSize: 13,
    lineHeight: 18,
  },
});
