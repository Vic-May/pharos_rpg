import { Combatant } from "@/types/rpg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

// Helper de Status (Névoa de Guerra)
const getHealthStatus = (current: number, max: number) => {
  if (current <= 0) return "Derrotado";
  const percent = current / max;
  if (percent > 0.5) return "Saudável";
  if (percent > 0.2) return "Ferido";
  return "Gravemente Ferido";
};

interface Props {
  item: Combatant;
  activeTurnId: string;
  colors: any; // Cores do tema
  isGm?: boolean; // Se for GM vê números exatos
}

export const SpectatorCard = ({
  item,
  activeTurnId,
  colors,
  isGm = false,
}: Props) => {
  const isCurrentTurn = item.id === activeTurnId;
  const isPlayer = item.type === "player";

  // Dados de Vida
  const current = item.hp?.current || 0;
  const max = item.hp?.max || 1;
  const hpPercent = Math.max(0, Math.min(1, current / max));

  // Lógica de Exibição
  let statusText = "";
  if (isGm || isPlayer) {
    // GM e Players veem números de outros Players (opcional, mas comum)
    statusText = `${current}/${max}`;
  } else {
    // Inimigos aparecem com texto vago
    statusText = getHealthStatus(current, max);
  }

  const barColor = isPlayer ? colors.success : colors.error;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isCurrentTurn && { borderColor: colors.primary, borderWidth: 2 },
      ]}
    >
      {/* Badge de Iniciativa */}
      <View style={[styles.initBadge, { backgroundColor: colors.inputBg }]}>
        <Text style={[styles.initText, { color: colors.text }]}>
          {item.initiative}
        </Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={[
              styles.name,
              { color: isCurrentTurn ? colors.primary : colors.text },
            ]}
          >
            {item.name}
          </Text>
          <MaterialCommunityIcons
            name={isPlayer ? "account" : "skull"}
            size={16}
            color={colors.textSecondary}
          />
        </View>

        {/* Barra de Vida */}
        <View style={[styles.barBg, { backgroundColor: colors.inputBg }]}>
          <View
            style={[
              styles.barFill,
              { width: `${hpPercent * 100}%`, backgroundColor: barColor },
            ]}
          />
        </View>

        <Text style={[styles.status, { color: colors.textSecondary }]}>
          {isPlayer ? `HP: ${statusText}` : `Status: ${statusText}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    marginBottom: 10,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  initBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  initText: { fontWeight: "bold" },
  name: { fontWeight: "bold", fontSize: 16 },
  barBg: {
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 3 },
  status: {
    fontSize: 10,
    marginTop: 2,
    fontStyle: "italic",
  },
});
