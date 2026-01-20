import { useTheme } from "@/context/ThemeContext";
import { Attributes } from "@/types/rpg"; // Certifique-se de importar o tipo correto
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface AttributeGridProps {
  attributes: Attributes;
}

export function AttributeGrid({ attributes }: AttributeGridProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.attributesGrid}>
      {Object.values(attributes).map((attr) => (
        <View key={attr.name} style={styles.attrCard}>
          <Text style={styles.attrLabel}>
            {attr.name.substring(0, 3).toUpperCase()}
          </Text>
          <Text style={styles.attrValue}>{attr.value}</Text>
          <View style={styles.modBadge}>
            <Text style={styles.modText}>
              {attr.modifier >= 0 ? "+" : ""}
              {attr.modifier}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    attributesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    attrCard: {
      width: "30%",
      backgroundColor: colors.surface,
      padding: 10,
      alignItems: "center",
      marginBottom: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    attrLabel: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.textSecondary,
    },
    attrValue: { fontSize: 22, fontWeight: "bold", color: colors.text },
    modBadge: {
      backgroundColor: colors.text,
      borderRadius: 4,
      paddingHorizontal: 6,
      marginTop: 4,
    },
    modText: { color: colors.background, fontSize: 12, fontWeight: "bold" },
  });
