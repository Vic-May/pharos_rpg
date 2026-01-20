import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// Contexto e Componentes
import { DiceRoller } from "@/components/rpg/DiceRoller";
import { useTheme } from "@/context/ThemeContext";

export default function GMDashboard() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [history, setHistory] = useState<{ dice: string; val: number }[]>([]);
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  const handleRollResult = (sides: number, result: number) => {
    setLastRoll(result);
    // Adiciona ao topo e limita a 10 itens
    setHistory((prev) =>
      [{ dice: `d${sides}`, val: result }, ...prev].slice(0, 10),
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* --- RESULTADO DESTAQUE --- */}
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Último Resultado</Text>
        <Text style={styles.resultValue}>
          {lastRoll !== null ? lastRoll : "-"}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Mesa de Dados</Text>

      {/* Componente Reutilizável (Cor Vermelha para o Mestre) */}
      <DiceRoller onRoll={handleRollResult} color="#c62828" />

      {/* --- HISTÓRICO --- */}
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <MaterialCommunityIcons
            name="history"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={styles.sectionTitle}>Histórico de Rolagens</Text>
        </View>

        <View style={styles.historyList}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum dado rolado ainda.</Text>
          ) : (
            history.map((h, i) => (
              <View key={i} style={styles.historyRow}>
                <Text style={styles.historyDice}>{h.dice}</Text>
                <View style={styles.dots} />
                <Text style={styles.historyValue}>{h.val}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20 },

    // Placar Principal
    resultContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 30,
      alignItems: "center",
      marginBottom: 30,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 4, // Sombra mais forte para destaque
    },
    resultLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      textTransform: "uppercase",
      fontWeight: "bold",
      letterSpacing: 1,
    },
    resultValue: {
      fontSize: 80,
      fontWeight: "bold",
      color: "#c62828", // Vermelho Sangue (Tema GM)
      includeFontPadding: false,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
    },

    // Histórico
    historySection: {
      marginTop: 30,
      backgroundColor: colors.inputBg,
      borderRadius: 16,
      padding: 16,
    },
    historyHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    historyList: { gap: 8 },
    historyRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + "40", // Borda muito sutil
    },
    historyDice: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    dots: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 10,
      borderStyle: "dotted",
      borderWidth: 1, // Simula pontilhado se supported ou linha sólida sutil
      opacity: 0.3,
    },
    historyValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    emptyText: {
      textAlign: "center",
      color: colors.textSecondary,
      fontStyle: "italic",
      marginTop: 10,
    },
  });
