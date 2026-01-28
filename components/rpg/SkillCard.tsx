import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Seus imports
import { useTheme } from "@/context/ThemeContext";
import { Skill } from "@/types/rpg";
import { getActionKey } from "@/utils/rpgUtils";

interface SkillCardProps {
  skill: Skill;
  updateStat: (stat: "hp" | "focus", value: number) => void;
  character: any;
  toggleAction: (type: "standard" | "bonus" | "reaction") => void;
  showAlert: (title: string, msg: string) => void;
}

export const SkillCard = ({
  skill,
  updateStat,
  character,
  toggleAction,
  showAlert,
}: SkillCardProps) => {
  const [expanded, setExpanded] = useState(false);

  // 1. BLINDAGEM DO TEMA
  // Se useTheme falhar ou não tiver cores, usa um fallback para não travar o app
  const themeContext = useTheme();
  const colors = themeContext?.colors || {
    surface: "#fff",
    text: "#000",
    primary: "blue",
    border: "#ccc",
    inputBg: "#eee",
    textSecondary: "#666",
    error: "red",
  };

  const styles = useMemo(() => getStyles(colors), [colors]);

  // 2. BLINDAGEM DE DADOS (O Erro "undefined value to object" costuma vir daqui)
  if (!skill) return null; // Se a habilidade não existir, não renderiza nada

  // Garante que character e turnActions existam antes de tentar ler
  const turnActions = character?.turnActions || {};
  const stats = character?.stats || { focus: { current: 0 } };

  const actionKey = getActionKey(skill.actionType);
  const hasEnoughFocus = (stats.focus?.current || 0) >= (skill.cost || 0);

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

    updateStat("focus", -(skill.cost || 0));
    if (actionKey) toggleAction(actionKey);
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
    >
      <View style={styles.skillHeader}>
        <View>
          <Text style={styles.skillName}>{skill.name}</Text>
          <Text style={styles.skillType}>{skill.actionType || "Passiva"}</Text>
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
    skillName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    skillType: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
      textTransform: "capitalize",
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
  });
