import { Combatant } from "@/types/rpg";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GMCombatantCardProps {
  item: Combatant;
  isActive: boolean;
  colors: any;
  onUpdate: (id: string, type: "hp" | "focus", value: number) => void;
  onRemove: (id: string) => void;
}

export const GMCombatantCard = ({
  item,
  isActive,
  colors,
  onUpdate,
  onRemove,
}: GMCombatantCardProps) => {
  const isPlayer = item.type === "player";

  return (
    <View
      style={[
        styles.card,
        isActive && { borderColor: colors.primary, borderWidth: 2 },
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.initBadge, { backgroundColor: colors.inputBg }]}>
          <Text style={[styles.initText, { color: colors.text }]}>
            {item.initiative}
          </Text>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <Text
            style={[
              styles.name,
              isActive && { color: colors.primary },
              { color: colors.text },
            ]}
          >
            {item.name}
          </Text>
          <Text style={[styles.typeLabel, { color: colors.textSecondary }]}>
            {isPlayer ? "JOGADOR" : "NPC"} • CA {item.armorClass}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          style={{ padding: 5 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={[styles.statsRow, { borderColor: colors.border }]}>
        {/* HP Control */}
        <View style={styles.statControl}>
          <TouchableOpacity
            onPress={() => onUpdate(item.id, "hp", item.hp.current - 1)}
          >
            <Ionicons name="remove-circle" size={28} color={colors.error} />
          </TouchableOpacity>
          <View style={{ alignItems: "center", minWidth: 60 }}>
            <Text style={[styles.statValue, { color: colors.hp || "#ef5350" }]}>
              {item.hp.current}/{item.hp.max}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              PV
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onUpdate(item.id, "hp", item.hp.current + 1)}
          >
            <Ionicons name="add-circle" size={28} color={colors.success} />
          </TouchableOpacity>
        </View>

        {/* Focus Control */}
        <View style={styles.statControl}>
          <TouchableOpacity
            onPress={() =>
              onUpdate(item.id, "focus", Math.max(0, item.focus.current - 1))
            }
          >
            <Ionicons
              name="remove-circle-outline"
              size={28}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <View style={{ alignItems: "center", minWidth: 50 }}>
            <Text style={[styles.statValue, { color: colors.focus }]}>
              {item.focus.current}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              FOCO
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              onUpdate(
                item.id,
                "focus",
                Math.min(item.focus.max, item.focus.current + 1),
              )
            }
          >
            <Ionicons
              name="add-circle-outline"
              size={28}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 10, borderRadius: 8, padding: 12, borderWidth: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  initBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  initText: { fontWeight: "bold" },
  name: { fontSize: 16, fontWeight: "bold" },
  typeLabel: { fontSize: 10, fontWeight: "bold" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 10,
  },
  statControl: { flexDirection: "row", alignItems: "center", gap: 10 },
  statValue: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 10, fontWeight: "bold" },
});
