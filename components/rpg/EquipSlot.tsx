import { useTheme } from "@/context/ThemeContext";
import { EquipmentItem } from "@/types/rpg";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EquipSlotProps {
  label: string;
  item: EquipmentItem;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  type?: "weapon" | "defense";
}

export const EquipSlot = ({
  label,
  item,
  icon,
  onPress,
  type = "weapon",
}: EquipSlotProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const isDefense = type === "defense";
  const hasItem = item.name && item.name !== "Nenhum" && item.name !== "Vazio";

  const displayValue = isDefense
    ? item.defense > 0
      ? `+${item.defense}`
      : "+0"
    : item.stats;

  return (
    <TouchableOpacity style={styles.slot} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.slotHeader}>
        <Text style={styles.slotLabel}>{label}</Text>
        <Ionicons name={icon} size={14} color={colors.textSecondary} />
      </View>

      <Text
        style={[styles.slotValue, !hasItem && styles.placeholder]}
        numberOfLines={1}
      >
        {hasItem ? item.name : "Vazio"}
      </Text>

      {hasItem && (
        <View style={styles.infoRow}>
          <View style={[styles.statsBadge, isDefense && styles.defenseBadge]}>
            <Text style={[styles.statsText, isDefense && styles.defenseText]}>
              {isDefense ? "CA " : ""}
              {displayValue}
            </Text>
          </View>
          {isDefense && item.description ? (
            <Ionicons
              name="information-circle"
              size={16}
              color={colors.textSecondary}
              style={{ marginLeft: 4 }}
            />
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    slot: {
      flex: 1,
      backgroundColor: colors.inputBg,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 100,
      justifyContent: "space-between",
    },
    slotHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    slotLabel: {
      fontSize: 10,
      textTransform: "uppercase",
      color: colors.textSecondary,
      fontWeight: "bold",
    },
    slotValue: { fontSize: 16, fontWeight: "bold", color: colors.text },
    placeholder: { color: colors.textSecondary, fontStyle: "italic" },
    infoRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    statsBadge: {
      alignSelf: "flex-start",
      backgroundColor: colors.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    statsText: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.textSecondary,
    },
    defenseBadge: { backgroundColor: colors.focus + "20" },
    defenseText: { color: colors.focus },
  });
