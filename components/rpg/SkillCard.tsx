import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Seus imports
import { useTheme } from "@/context/ThemeContext";
import { Character, Combatant, Skill } from "@/types/rpg";
import { getActionColor, getActionKey } from "@/utils/rpgUtils";

interface SkillCardProps {
  skill: Skill;
  updateStat?: (stat: "hp" | "focus", value: number) => void;
  character: Character | Combatant;
  toggleAction?: (type: "standard" | "bonus" | "reaction") => void;
  showAlert: (title: string, msg: string) => void;
  onPress?: (skill: Skill) => void; // <--- Nova prop
}

export const SkillCard = ({
  skill,
  updateStat,
  character,
  toggleAction,
  showAlert,
  onPress,
}: SkillCardProps) => {
  const [expanded, setExpanded] = useState(false);

  // 1. BLINDAGEM DO TEMA
  // Se useTheme falhar ou não tiver cores, usa um fallback para não travar o app
  const { colors } = useTheme();

  const styles = useMemo(() => getStyles(colors), [colors]);

  // 2. BLINDAGEM DE DADOS (O Erro "undefined value to object" costuma vir daqui)
  if (!skill) return null; // Se a habilidade não existir, não renderiza nada

  // Garante que character e turnActions existam antes de tentar ler
  const turnActions = character?.turnActions || {};
  const isCharacter = "stats" in character;

  // Se for Character, pega de .stats.focus. Se for Combatant, pega de .focus
  const focusData = isCharacter
    ? (character as Character).stats.focus
    : (character as Combatant).focus;
  // const stats = character?.stats || character?.focus;

  const actionKey = getActionKey(skill.actionType);
  const hasEnoughFocus = (focusData.current || 0) >= (skill.cost || 0);

  // Verifica disponibilidade da ação de forma segura
  const isActionAvailable = actionKey ? turnActions[actionKey] : true;

  const handleUseSkill = () => {
    if (!hasEnoughFocus) {
      showAlert(
        "Foco Insuficiente",
        "Você não tem foco para usar esta habilidade.",
      );
      return;
    }
    if (!isActionAvailable) {
      const actionName =
        actionKey === "standard"
          ? "Ação Padrão"
          : actionKey === "bonus"
            ? "Ação Bônus"
            : "Reação";
      showAlert(
        "Ação Indisponível",
        `Você já gastou sua ${actionName} neste turno.`,
      );
      return;
    }

    if (onPress) {
      onPress(skill);
      return;
    }

    if (updateStat && toggleAction) {
      updateStat("focus", -(skill.cost || 0));
      if (actionKey) toggleAction(actionKey);
    }
  };

  const getButtonText = () => {
    if (!hasEnoughFocus) return "FOCO INSUFICIENTE";
    if (!isActionAvailable) return "SEM AÇÃO DISPONÍVEL";
    return "USAR HABILIDADE";
  };

  return (
    <TouchableOpacity
      style={styles.skillCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
      // disabled={!canUse}
    >
      <View style={styles.skillHeader}>
        <View>
          <Text style={styles.skillName}>{skill.name}</Text>
          <Text
            style={[
              styles.skillType,
              { color: getActionColor(skill.actionType, colors) },
            ]}
          >
            {skill.actionType || "Passiva"}
          </Text>
        </View>
        <View
          style={[
            styles.costBadge,
            !hasEnoughFocus && styles.costBadgeDisabled,
          ]}
        >
          <Text
            style={[
              styles.costText,
              !hasEnoughFocus && styles.costTextDisabled,
            ]}
          >
            {skill.cost || 0} Foco
          </Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.skillBody}>
          <Text style={styles.description}>
            {skill.description || "Sem descrição disponível."}
          </Text>

          <TouchableOpacity
            style={[
              styles.useButton,
              (!hasEnoughFocus || !isActionAvailable) &&
                styles.useButtonDisabled,
            ]}
            onPress={handleUseSkill}
            disabled={!hasEnoughFocus}
          >
            <Text style={styles.useButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ESTILOS (Garante que nenhuma propriedade seja lida de undefined)
const getStyles = (colors: any) =>
  StyleSheet.create({
    skillCard: {
      backgroundColor: colors.surface,
      marginBottom: 10,
      borderRadius: 8,
      padding: 16,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skillHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    costBadge: {
      backgroundColor: colors.inputBg,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    costBadgeDisabled: {
      backgroundColor: (colors.error || "red") + "15",
      borderWidth: 1,
      borderColor: colors.error || "red",
    },
    costText: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.text,
    },
    costTextDisabled: {
      color: colors.error || "red",
    },
    skillBody: {
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    description: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    useButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 6,
      alignItems: "center",
    },
    useButtonDisabled: {
      backgroundColor: colors.border,
    },
    useButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 14,
      textTransform: "uppercase",
    },
    skillRow: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skillName: { fontWeight: "bold", color: colors.text, fontSize: 14 },
    skillType: { fontSize: 12, color: colors.primary, marginTop: 2 },
    detailText: { color: colors.textSecondary, fontSize: 12 },
    skillCost: {
      justifyContent: "center",
      paddingLeft: 10,
      borderLeftWidth: 1,
      borderColor: colors.border,
    },
  });
