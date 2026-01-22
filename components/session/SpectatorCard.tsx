import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export const SpectatorCard = ({ item, isCurrentTurn, colors, styles }: any) => {
  const isPlayer = item.type === "player";
  const current = item.hp?.current || 0;
  const max = item.hp?.max || 1;
  const hpPercent = Math.max(0, Math.min(1, current / max));

  let statusText = `${current}/${max}`;
  let barColor = isPlayer ? colors.success : colors.error;

  if (!isPlayer) {
    if (hpPercent > 0.5) statusText = "Saudável";
    else if (hpPercent > 0.2) statusText = "Ferido";
    else if (current > 0) statusText = "Gravemente Ferido";
    else statusText = "Derrotado";
  }

  return (
    <View
      style={[
        styles.spectatorCard,
        isCurrentTurn && { borderColor: colors.primary, borderWidth: 2 },
      ]}
    >
      <View style={styles.initBadge}>
        <Text style={styles.initText}>{item.initiative}</Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={[
              styles.spectatorName,
              isCurrentTurn && { color: colors.primary },
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

        <View style={styles.miniBarBg}>
          <View
            style={[
              styles.miniBarFill,
              { width: `${hpPercent * 100}%`, backgroundColor: barColor },
            ]}
          />
        </View>

        <Text style={styles.spectatorStatus}>
          {isPlayer ? `HP: ${statusText}` : `Status: ${statusText}`}
        </Text>
      </View>
    </View>
  );
};
