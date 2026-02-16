// src/components/rpg/EquipSlot.tsx
import { useTheme } from "@/context/ThemeContext";
import { EquipmentItem } from "@/types/rpg";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AvatarPortrait } from "../ui/AvatarPortrait";

interface EquipSlotProps {
  label: string;
  item: EquipmentItem;
  icon: keyof typeof Ionicons.glyphMap;
  type: "weapon" | "defense";
  onPress: () => void;
}

export const EquipSlot = ({
  label,
  item,
  icon,
  type,
  onPress,
}: EquipSlotProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Ionicons name={icon} size={14} color={colors.textSecondary} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      </View>

      <View style={styles.content}>
        {/* --- LÓGICA DE EXIBIÇÃO DA IMAGEM --- */}
        <View style={styles.imageWrapper}>
          {item.image ? (
            <AvatarPortrait imageUrl={item.image} size={40} />
          ) : (
            <View
              style={[
                styles.iconPlaceholder,
                { backgroundColor: colors.inputBg },
              ]}
            >
              <Ionicons
                name={type === "weapon" ? "color-wand" : "shield-checkmark"}
                size={20}
                color={colors.textSecondary}
              />
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[styles.itemName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name || "Vazio"}
          </Text>
          <Text style={[styles.itemStats, { color: colors.primary }]}>
            {type === "weapon" ? item.stats || "-" : `CA +${item.defense || 0}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  label: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  content: { flexDirection: "row", alignItems: "center", gap: 10 },

  // Estilos da Imagem
  imageWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8, // Pode ser 20 se quiser redondo igual o avatar
    overflow: "hidden",
  },
  iconPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  textContainer: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "bold" },
  itemStats: { fontSize: 12, fontWeight: "600", marginTop: 2 },
});
