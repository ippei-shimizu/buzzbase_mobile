import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface GamePaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export function GamePagination({
  currentPage,
  totalPages,
  totalCount,
  perPage,
  onPageChange,
}: GamePaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalCount);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <View style={styles.container}>
      <Text style={styles.countText}>
        {totalCount}件中 {startItem}-{endItem}件
      </Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, !hasPrev && styles.buttonDisabled]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
        >
          <Text
            style={[styles.buttonText, !hasPrev && styles.buttonTextDisabled]}
          >
            前へ
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageText}>
          {currentPage} / {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.button, !hasNext && styles.buttonDisabled]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
        >
          <Text
            style={[styles.buttonText, !hasNext && styles.buttonTextDisabled]}
          >
            次へ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 8,
  },
  countText: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#71717b",
  },
  buttonDisabled: {
    borderColor: "#3f3f46",
  },
  buttonText: {
    color: "#d4d4d8",
    fontSize: 13,
  },
  buttonTextDisabled: {
    color: "#52525b",
  },
  pageText: {
    color: "#d4d4d8",
    fontSize: 13,
    paddingHorizontal: 8,
  },
});
