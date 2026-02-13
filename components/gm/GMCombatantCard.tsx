import { Combatant } from "@/types/rpg";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AvatarPortrait } from "../ui/AvatarPortrait";

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
        { backgroundColor: colors.surface, borderColor: colors.border },
        isActive && { borderColor: colors.primary, borderWidth: 2 },
      ]}
    >
      <View style={styles.cardHeader}>
        {/* --- NOVO BLOCO DE AVATAR + INIT --- */}
        <View style={styles.avatarWrapper}>
          {/* Avatar Componentizado! */}
          <AvatarPortrait
            imageUrl={item.image}
            size={48}
            name={item.name}
            fallbackBgColor={isActive ? colors.primary : colors.inputBg}
            fallbackTextColor={isActive ? "#fff" : colors.textSecondary}
          />

          {/* Badge de Iniciativa (Sobreposta) */}
          <View
            style={[
              styles.initBadge,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isActive && { borderColor: colors.primary }, // Se for o turno dele, a borda do badge também acende
            ]}
          >
            <Text style={[styles.initValue, { color: colors.text }]}>
              {Math.floor(item.initiative || 0)}
            </Text>
          </View>
        </View>

        {/* --- INFORMAÇÕES CENTRAIS --- */}
        <View style={styles.infoCenter}>
          <Text
            style={[
              styles.name,
              { color: colors.text },
              isActive && { color: colors.primary },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.typeLabel, { color: colors.textSecondary }]}>
            {isPlayer ? "JOGADOR" : "NPC"} • CA {item.armorClass}
          </Text>
          {item.activeStanceId && (
            <Text
              style={{
                fontSize: 10,
                color: colors.primary, // Destaque na cor principal do tema
                marginTop: 2,
                fontWeight: "bold",
              }}
            >
              {item.stances?.find((s) => s.id === item.activeStanceId)?.name ||
                "Ativa"}
            </Text>
          )}
        </View>

        {/* Botão Remover */}
        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          style={styles.removeBtn}
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
          <View style={styles.statValueBox}>
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
          style={[styles.verticalDivider, { backgroundColor: colors.border }]}
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
          <View style={styles.statValueBoxFocus}>
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
    marginRight: 12, // Aumentei um tiquinho o respiro do avatar para o nome
  },
  initBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 22, // Deixei ligeiramente maior para acomodar números como "20"
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    elevation: 2,
  },
  initValue: { fontSize: 10, fontWeight: "900" },

  infoCenter: { flex: 1, paddingHorizontal: 4 },
  name: { fontSize: 16, fontWeight: "bold" },
  typeLabel: { fontSize: 11, fontWeight: "bold", marginTop: 2 },

  removeBtn: { padding: 8 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 12,
  },
  statControl: { flexDirection: "row", alignItems: "center", gap: 6 },
  statValueBox: { alignItems: "center", minWidth: 60 },
  statValueBoxFocus: { alignItems: "center", minWidth: 50 },
  statValue: { fontSize: 16, fontWeight: "bold" },
  statLabel: { fontSize: 10, fontWeight: "bold" },

  verticalDivider: { width: 1, height: "80%" },
});
