import { useTheme } from "@/context/ThemeContext";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DeathSaveMonitorProps {
  hp: number;
  successes: number;
  failures: number;
  onUpdate: (type: "success" | "failure", value: number) => void;
}

export function DeathSaveMonitor({
  hp,
  successes,
  failures,
  onUpdate,
}: DeathSaveMonitorProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  if (hp > 0) return null;

  return (
    <View style={styles.deathSaveContainer}>
      <Text style={styles.deathSaveTitle}>TESTES DE MORTE</Text>

      <View style={styles.deathSaveRow}>
        {/* Sucessos */}
        <View style={styles.deathSaveGroup}>
          <Text style={styles.deathSaveLabel}>Sucessos</Text>
          <View style={styles.dotsContainer}>
            {[1, 2, 3].map((i) => (
              <TouchableOpacity
                key={`succ-${i}`}
                style={[
                  styles.deathSaveDot,
                  successes >= i && styles.deathSaveDotSuccess,
                ]}
                onPress={() => onUpdate("success", successes === i ? i - 1 : i)}
              />
            ))}
          </View>
        </View>

        {/* Falhas */}
        <View style={styles.deathSaveGroup}>
          <Text style={styles.deathSaveLabel}>Falhas</Text>
          <View style={styles.dotsContainer}>
            {[1, 2, 3].map((i) => (
              <TouchableOpacity
                key={`fail-${i}`}
                style={[
                  styles.deathSaveDot,
                  failures >= i && styles.deathSaveDotFailure,
                ]}
                onPress={() => onUpdate("failure", failures === i ? i - 1 : i)}
              />
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.deathSaveHelp}>
        3 sucessos estabilizam. 3 falhas matam.
      </Text>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    deathSaveContainer: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.error,
      marginBottom: 16,
      alignItems: "center",
    },
    deathSaveTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.error,
      marginBottom: 12,
      letterSpacing: 2,
    },
    deathSaveRow: { flexDirection: "row", gap: 40, marginBottom: 12 },
    deathSaveGroup: { alignItems: "center" },
    deathSaveLabel: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    dotsContainer: { flexDirection: "row", gap: 8 },
    deathSaveDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.textSecondary,
      backgroundColor: "transparent",
    },
    deathSaveDotSuccess: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    deathSaveDotFailure: {
      backgroundColor: colors.error,
      borderColor: colors.error,
    },
    deathSaveHelp: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: "italic",
      textAlign: "center",
    },
  });
