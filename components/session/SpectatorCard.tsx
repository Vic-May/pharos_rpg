import { Combatant } from "@/types/rpg";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface SpectatorCardProps {
  item: Combatant;
  activeTurnId: string | null;
  colors: any; // Ou use o tipo ThemeColors se tiver
  isGm?: boolean;
}

export const SpectatorCard = ({
  item,
  activeTurnId,
  colors,
  isGm,
}: SpectatorCardProps) => {
  // Geramos os estilos locais usando as cores passadas
  const styles = useMemo(() => getStyles(colors), [colors]);

  const isActive = item.id === activeTurnId;
  const isDead = item.hp.current <= 0;

  // Cálculo da barra de vida
  const hpPercent = Math.max(
    0,
    Math.min(100, (item.hp.current / item.hp.max) * 100),
  );

  return (
    <View
      style={[
        styles.spectatorCard,
        isActive && { borderColor: colors.primary, borderWidth: 2 },
        isDead && { opacity: 0.6 },
      ]}
    >
      {/* Badge de Iniciativa */}
      <View
        style={[
          styles.initBadge,
          isActive && { backgroundColor: colors.primary },
        ]}
      >
        <Text style={[styles.initText, isActive && { color: "#fff" }]}>
          {Math.floor(item.initiative || 0)}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.spectatorName}>
            {item.name} {isDead && "💀"}
          </Text>

          {/* Mostra HP exato apenas se for GM ou o próprio dono (lógica simplificada aqui) */}
          <Text style={styles.spectatorStatus}>
            {isGm
              ? `${item.hp.current}/${item.hp.max} PV`
              : item.type === "npc"
                ? getHealthStatus(hpPercent)
                : `${hpPercent.toFixed(0)}%`}
          </Text>
        </View>

        {/* Barra de Vida Miniatura */}
        <View style={styles.miniBarBg}>
          <View
            style={[
              styles.miniBarFill,
              {
                width: `${hpPercent}%`,
                backgroundColor:
                  hpPercent < 30
                    ? colors.error
                    : hpPercent < 60
                      ? "#fb8c00"
                      : colors.success,
              },
            ]}
          />
        </View>

        {/* Status de Postura (Opcional) */}
        {item.activeStanceId && (
          <Text
            style={{ fontSize: 10, color: colors.textSecondary, marginTop: 2 }}
          >
            Postura Ativa
          </Text>
        )}
      </View>
    </View>
  );
};

// Helper para descrição de vida (Névoa de Guerra)
const getHealthStatus = (percent: number) => {
  if (percent >= 100) return "Intacto";
  if (percent >= 75) return "Arranhado";
  if (percent >= 50) return "Ferido";
  if (percent >= 25) return "Grave";
  if (percent > 0) return "Crítico";
  return "Morto";
};

// ESTILOS LOCAIS DO CARD
const getStyles = (colors: any) =>
  StyleSheet.create({
    spectatorCard: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      marginBottom: 10,
      borderRadius: 8,
      padding: 10,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    initBadge: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.inputBg,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    initText: {
      fontWeight: "bold",
      color: colors.text,
      fontSize: 12,
    },
    spectatorName: {
      fontWeight: "bold",
      fontSize: 14,
      color: colors.text,
    },
    spectatorStatus: {
      fontSize: 10,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    miniBarBg: {
      height: 6,
      backgroundColor: colors.inputBg,
      borderRadius: 3,
      marginTop: 6,
      overflow: "hidden",
    },
    miniBarFill: {
      height: "100%",
      borderRadius: 3,
    },
  });
