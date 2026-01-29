import { Combatant } from "@/types/rpg";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
        {/* --- NOVO BLOCO DE AVATAR + INIT --- */}
        <View style={styles.avatarWrapper}>
          <View
            style={[
              styles.avatarContainer,
              isActive && { borderColor: colors.primary, borderWidth: 2 },
            ]}
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  {
                    backgroundColor: isActive ? colors.primary : colors.inputBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.avatarInitial,
                    { color: isActive ? "#fff" : colors.textSecondary },
                  ]}
                >
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Badge de Iniciativa (Sobreposta) */}
          <View
            style={[
              styles.initBadge,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.initValue, { color: colors.text }]}>
              {Math.floor(item.initiative || 0)}
            </Text>
          </View>
        </View>

        {/* --- INFORMAÇÕES CENTRAIS --- */}
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <Text
            style={[
              styles.name,
              isActive && { color: colors.primary },
              { color: colors.text },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.typeLabel, { color: colors.textSecondary }]}>
            {isPlayer ? "JOGADOR" : "NPC"} • CA {item.armorClass}
          </Text>
        </View>

        {/* Botão Remover */}
        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          style={{ padding: 5 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* --- CONTROLES DE HP E FOCO --- */}
      <View style={[styles.statsRow, { borderColor: colors.border }]}>
        {/* HP Control */}
        <View style={styles.statControl}>
          <TouchableOpacity
            onPress={() => onUpdate(item.id, "hp", item.hp.current - 1)}
          >
            <Ionicons name="remove-circle" size={32} color={colors.error} />
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
            <Ionicons name="add-circle" size={32} color={colors.success} />
          </TouchableOpacity>
        </View>

        <View
          style={{ width: 1, height: "80%", backgroundColor: colors.border }}
        />

        {/* Focus Control */}
        <View style={styles.statControl}>
          <TouchableOpacity
            onPress={() =>
              onUpdate(item.id, "focus", Math.max(0, item.focus.current - 1))
            }
          >
            <Ionicons
              name="remove-circle-outline"
              size={32}
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
              size={32}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },

  // Avatar Styles
  avatarWrapper: {
    position: "relative",
    marginRight: 8,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "#ccc",
  },
  avatar: { width: "100%", height: "100%" },
  avatarFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 20, fontWeight: "bold" },

  initBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    elevation: 2,
  },
  initValue: { fontSize: 9, fontWeight: "900" },

  name: { fontSize: 16, fontWeight: "bold" },
  typeLabel: { fontSize: 10, fontWeight: "bold", marginTop: 2 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 12,
  },
  statControl: { flexDirection: "row", alignItems: "center", gap: 8 },
  statValue: { fontSize: 16, fontWeight: "bold" },
  statLabel: { fontSize: 10, fontWeight: "bold" },
});
