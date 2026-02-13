import { useTheme } from "@/context/ThemeContext";
import { Character, Combatant, Spell } from "@/types/rpg";
import { getActionColor, getActionKey } from "@/utils/rpgUtils";
import { getSchoolTheme } from "@/utils/spellUtils";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SpellCardProps {
  spell: Spell;
  character: Character | Combatant;
  onCast: (spell: Spell) => void;
  onForget?: (spellId: string) => void;
}

export const SpellCard = ({
  spell,
  character,
  onCast,
  onForget,
}: SpellCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const theme = getSchoolTheme(spell.school); // spell.school deve ser "Fogo", "Agua", etc.
  const IconLib = theme.iconLib; //

  // 1. Normalização de Dados (Online vs Offline)
  const isCharacter = "stats" in character;
  const focusData = isCharacter
    ? (character as Character).stats.focus
    : (character as Combatant).focus;

  const currentFocus = focusData?.current || 0;
  const turnActions = character.turnActions || {};

  // 2. Validações
  const actionKey = getActionKey(spell.actionType || "standard");
  const hasAction = actionKey ? turnActions[actionKey] : true;
  const hasFocus = currentFocus >= spell.cost;

  // Nota: Permitimos expandir mesmo se não puder usar, para ver a descrição
  // Mas o botão de ação ficará desabilitado
  const canCast = hasAction && hasFocus;

  const getButtonText = () => {
    if (!hasFocus) return "FOCO INSUFICIENTE";
    if (!hasAction) return "SEM AÇÃO DISPONÍVEL";
    return "CONJURAR MAGIA";
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderColor: theme.color }, // <--- Borda com a cor da escola
      ]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      {/* --- CABEÇALHO (Sempre visível) --- */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            {/* Ícone da Escola */}
            <IconLib name={theme.icon} size={16} color={theme.color} />

            {/* Nome da Magia na cor da escola */}
            <Text style={[styles.name, { color: theme.color }]}>
              {spell.name}
            </Text>
          </View>

          {/* Linha de Tags (Tipo + Custo Ação) */}
          <View style={styles.tagsRow}>
            <Text
              style={[
                styles.skillType,
                { color: getActionColor(spell.actionType, colors) },
              ]}
            >
              {spell.actionType || "Passiva"} |
            </Text>
            <Text style={[styles.typeText, { color: theme.color }]}>
              {spell.school || "Arcano"}
            </Text>
            {spell.isAttack && (
              <Text style={styles.attackTag}>
                ATAQUE ({spell.damageFormula})
              </Text>
            )}
            {spell.isHealing && (
              <Text style={styles.healTag}>CURA ({spell.healFormula})</Text>
            )}
          </View>
        </View>

        {/* Badge de Custo */}
        <View style={[styles.costBadge, !hasFocus && styles.costBadgeError]}>
          <Text style={[styles.costText, !hasFocus && styles.costTextError]}>
            {spell.cost} Foco
          </Text>
        </View>
      </View>

      {/* --- CORPO EXPANDÍVEL --- */}
      {expanded && (
        <View style={styles.body}>
          <Text style={styles.description}>
            {spell.description || "Sem descrição disponível."}
          </Text>

          {/* Detalhes Técnicos (Opcional) */}
          {/* <View style={styles.detailsRow}>
            <Text style={styles.detailItem}>
              Alcance: {spell.range || "Pessoal"}
            </Text>
            <Text style={styles.detailItem}>
              Duração: {spell.duration || "Instantânea"}
            </Text>
          </View> */}

          {/* Botão de Ação */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.castButton, !canCast && styles.castButtonDisabled]}
              onPress={() => onCast(spell)}
              disabled={!canCast}
            >
              <Text style={styles.castButtonText}>{getButtonText()}</Text>
            </TouchableOpacity>

            {onForget && (
              <TouchableOpacity
                style={styles.forgetButton}
                onPress={() => onForget(spell.id)}
              >
                <Text style={styles.forgetButtonText}>Esquecer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      marginBottom: 10,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      // borderColor: "#b39ddb", // Roxo mágico para diferenciar de skills físicas
      elevation: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    name: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#b39ddb", // Título Roxo
      marginBottom: 4,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      alignItems: "center",
    },
    typeText: {
      fontSize: 12,
      fontWeight: "600",
    },
    attackTag: {
      fontSize: 10,
      color: colors.error,
      fontWeight: "bold",
      backgroundColor: colors.error + "15",
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    healTag: {
      fontSize: 10,
      color: colors.success,
      fontWeight: "bold",
      backgroundColor: colors.success + "15",
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    // Badge de Custo
    costBadge: {
      backgroundColor: colors.inputBg,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      marginLeft: 8,
    },
    costBadgeError: {
      backgroundColor: colors.error + "15",
      borderWidth: 1,
      borderColor: colors.error,
    },
    costText: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.text,
    },
    costTextError: {
      color: colors.error,
    },
    // Corpo Expandido
    body: {
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border + "40", // Mais sutil
      paddingTop: 12,
    },
    description: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    detailsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      backgroundColor: colors.inputBg,
      padding: 8,
      borderRadius: 4,
    },
    detailItem: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    // Botão de Conjurar
    skillType: { fontSize: 12 },
    castButton: {
      backgroundColor: "#7e57c2", // Roxo Mágico (Deep Purple 400)
      paddingVertical: 12,
      borderRadius: 6,
      alignItems: "center",
    },
    castButtonDisabled: {
      backgroundColor: colors.border,
    },
    castButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 14,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    forgetButton: {
      paddingVertical: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 6,
      backgroundColor: "transparent",
    },
    forgetButtonText: {
      color: colors.error,
      fontWeight: "bold",
      fontSize: 12,
      textTransform: "uppercase",
    },
    actionsContainer: {
      marginTop: 12,
      gap: 8, // Espaçamento entre os botões
    },
  });
