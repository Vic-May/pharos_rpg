import { Combatant } from "@/types/rpg";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AvatarPortrait } from "../ui/AvatarPortrait";

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
      {/* IMAGEM DO COMBATENTE */}
      <View style={styles.avatarWrapper}>
        {/* IMAGEM / FALLBACK */}
        <View
          style={[
            styles.avatarContainer,
            isActive && { borderColor: colors.primary, borderWidth: 2 }, // Borda colorida se for a vez
          ]}
        >
          <AvatarPortrait
            imageUrl={item.image}
            size={48}
            name={item.name}
            fallbackBgColor={isActive ? colors.primary : colors.inputBg}
            fallbackTextColor={isActive ? "#fff" : colors.textSecondary}
          />
        </View>

        {/* BADGE DE INICIATIVA (Sobreposta) */}
        <View style={[styles.initBadge, { backgroundColor: colors.surface }]}>
          <Text style={[styles.initLabel, { color: colors.textSecondary }]}>
            INIT
          </Text>
          <Text style={[styles.initValue, { color: colors.text }]}>
            {Math.floor(item.initiative || 0)}
          </Text>
        </View>
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
      position: "absolute",
      bottom: -6, // Sai um pouco para fora
      right: -6, // Sai um pouco para fora
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border, // Cria um "recorte" visual entre a badge e o avatar
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      elevation: 5,
      flexDirection: "row",
      gap: 2,
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
    avatarContainer: {
      width: 56,
      height: 56,
      borderRadius: 28, // Círculo perfeito
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "transparent", // Borda invisível por padrão
      elevation: 4, // Sombra Android
      shadowColor: "#000", // Sombra iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      backgroundColor: colors.background, // Fundo para png transparente
    },

    avatarWrapper: {
      position: "relative", // Necessário para a badge absoluta
      marginRight: 16,
      alignItems: "center",
      justifyContent: "center",
    },

    avatar: {
      width: "100%",
      height: "100%",
    },

    avatarFallback: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    avatarInitial: {
      fontSize: 24,
      fontWeight: "bold",
    },

    // BADGE DE INICIATIVA ESTILIZADA

    initLabel: {
      fontSize: 6,
      fontWeight: "bold",
      marginTop: 1,
    },

    initValue: {
      fontSize: 10,
      fontWeight: "900",
    },
  });
