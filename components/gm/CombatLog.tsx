import React, { useEffect, useRef } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

interface CombatLogProps {
  logs: string[];
  colors: any; // Poderia usar useTheme internamente, mas aqui recebe props
}

export const CombatLog = ({ logs, colors }: CombatLogProps) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (logs.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [logs]);

  return (
    <View
      style={[
        styles.logContainer,
        { backgroundColor: "#1e1e1e", borderColor: colors.border },
      ]}
    >
      <View style={styles.logHeader}>
        <Text style={styles.logTitle}>TERMINAL DO SISTEMA</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={logs}
        keyExtractor={(_, index) => index.toString()}
        style={{ maxHeight: 120 }}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => (
          <Text style={styles.logText}>
            <Text style={{ color: colors.primary }}>{"> "}</Text>
            {item}
          </Text>
        )}
        ListEmptyComponent={
          <Text style={[styles.logText, { opacity: 0.5 }]}>
            Aguardando eventos...
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logContainer: {
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  logHeader: {
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 5,
    paddingHorizontal: 10,
  },
  logTitle: { color: "#888", fontSize: 10, fontWeight: "bold" },
  logText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#ddd",
    marginBottom: 2,
  },
});
