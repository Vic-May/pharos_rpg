import { useTheme } from "@/context/ThemeContext";
import { Stance } from "@/types/rpg";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface StanceSelectorProps {
  stances: Stance[];
  activeStanceId?: string | null;
  turnActions: { bonus: boolean }; // Precisa saber se tem ação bônus
  onStanceChange: (newIndex: number) => void;
}

export const StanceSelector = ({
  stances,
  activeStanceId,
  turnActions,
  onStanceChange,
}: StanceSelectorProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  // Se não tiver posturas, não renderiza nada
  if (!stances || stances.length === 0) return null;

  const currentStanceIdx = stances.findIndex((s) => s.id === activeStanceId);
  const isNeutral = currentStanceIdx === -1;
  const activeStance = isNeutral ? null : stances[currentStanceIdx];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Postura Atual</Text>

      {/* --- GRUPO DE BOTÕES (NEUTRA + I, II, III...) --- */}
      <View style={styles.toggleGroup}>
        {/* Botão Neutra */}
        <TouchableOpacity
          style={[styles.btn, isNeutral && styles.btnNeutralActive]}
          onPress={() => onStanceChange(-1)}
        >
          <Text style={[styles.btnText, isNeutral && styles.btnTextActive]}>
            Neutra
          </Text>
        </TouchableOpacity>

        {/* Botões das Posturas */}
        {stances.map((stance, index) => {
          const isActive = currentStanceIdx === index;
          // Regra: Pode clicar se já estiver nela (pra ver info) ou se tiver ação bônus
          const canSwitch = isActive || turnActions.bonus;

          return (
            <TouchableOpacity
              key={stance.id || index}
              style={[
                styles.btn,
                isActive &&
                  (index === 0 ? styles.btnP1Active : styles.btnP2Active), // Estilos diferentes para P1/P2/P3 se quiser
                !canSwitch && { opacity: 0.5 },
              ]}
              onPress={() => canSwitch && onStanceChange(index)}
              disabled={!canSwitch}
            >
              <Text style={[styles.btnText, isActive && { color: "#fff" }]}>
                {toRoman(index + 1)}
              </Text>

              {/* Ícone de Cadeado se não puder trocar */}
              {!isActive && !turnActions.bonus && (
                <Ionicons
                  name="lock-closed"
                  size={10}
                  color={colors.textSecondary}
                  style={styles.lockIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* --- CARD DE DETALHES --- */}
      <View
        style={[
          styles.card,
          isNeutral
            ? styles.cardNeutral
            : currentStanceIdx === 0
              ? styles.cardP1
              : styles.cardP2,
        ]}
      >
        <Text style={styles.cardTitle}>
          {isNeutral ? "Postura Neutra" : activeStance?.name}
        </Text>

        <View style={styles.divider} />

        {isNeutral ? (
          <Text style={styles.neutralDesc}>
            Combatendo sem foco em técnicas específicas.
          </Text>
        ) : (
          <View style={styles.detailsList}>
            <InfoRow
              label="Benefício"
              text={activeStance?.benefit}
              color={colors.success}
              styles={styles}
            />
            <InfoRow
              label="Restrição"
              text={activeStance?.restriction}
              color={colors.error}
              styles={styles}
            />
            <InfoRow
              label="Manobra"
              text={activeStance?.maneuver}
              color={colors.focus}
              styles={styles}
            />
            {activeStance?.recovery && (
              <InfoRow
                label="Recuperação"
                text={activeStance.recovery}
                color={colors.primary}
                styles={styles}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

// Helper simples para renderizar linhas de informação
const InfoRow = ({ label, text, color, styles }: any) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color }]}>{label}:</Text>
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

// Helper para converter número em Romano (I, II, III, IV)
const toRoman = (num: number) => {
  const map = ["", "I", "II", "III", "IV", "V"];
  return map[num] || num;
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { marginBottom: 16 },
    label: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
      marginLeft: 4,
    },
    toggleGroup: {
      flexDirection: "row",
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      padding: 4,
      marginBottom: 10,
    },
    btn: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 6,
    },
    btnText: {
      fontWeight: "bold",
      color: colors.textSecondary,
      fontSize: 14,
    },
    btnTextActive: { color: colors.text },

    // Estilos de Ativo
    btnNeutralActive: { backgroundColor: colors.surface, elevation: 2 },
    btnP1Active: { backgroundColor: colors.primary }, // Azul/Roxo
    btnP2Active: { backgroundColor: colors.error }, // Vermelho (Agressivo)
    // Se tiver P3, usaria outra cor

    lockIcon: { position: "absolute", top: 4, right: 4 },

    // Card de Detalhes
    card: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "transparent",
    },
    cardNeutral: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    cardP1: {
      backgroundColor: colors.primary + "10",
      borderColor: colors.primary + "40",
    },
    cardP2: {
      backgroundColor: colors.error + "10",
      borderColor: colors.error + "40",
    },

    cardTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 8,
      opacity: 0.5,
    },
    neutralDesc: {
      textAlign: "center",
      fontStyle: "italic",
      color: colors.textSecondary,
    },
    detailsList: { gap: 4 },
    infoRow: { flexDirection: "row", flexWrap: "wrap" },
    infoLabel: { fontWeight: "bold", marginRight: 6, fontSize: 13 },
    infoText: { color: colors.textSecondary, flex: 1, fontSize: 13 },
  });
