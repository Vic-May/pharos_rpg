import { useTheme } from "@/context/ThemeContext";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ResourceControlProps {
  label: string;
  current: number;
  max: number;
  color: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function ResourceControl({
  label,
  current,
  max,
  color,
  onIncrement,
  onDecrement,
}: ResourceControlProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const percent = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <View style={styles.resourceContainer}>
      <View style={styles.resourceHeader}>
        <Text style={styles.resourceLabel}>{label}</Text>
        <Text style={styles.resourceValues}>
          {current} / {max}
        </Text>
      </View>

      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity onPress={onDecrement} style={styles.btn}>
          <Text style={{ color: colors.text }}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onIncrement} style={styles.btn}>
          <Text style={{ color: colors.text }}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    resourceContainer: { marginBottom: 16 },
    resourceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    resourceLabel: { fontWeight: "600", color: colors.text },
    resourceValues: { color: colors.textSecondary },
    barBackground: {
      height: 12,
      backgroundColor: colors.border,
      borderRadius: 6,
      overflow: "hidden",
      marginBottom: 8,
    },
    barFill: { height: "100%" },
    buttonsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
    btn: {
      width: 40,
      height: 30,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
