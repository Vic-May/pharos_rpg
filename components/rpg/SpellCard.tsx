import { useTheme } from "@/context/ThemeContext";
import { Spell } from "@/types/rpg";
import { getCircleTheme } from "@/utils/spellUtils";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SpellCardProps {
  spell: Spell;
  currentFocus: number;
  onCast: (cost: number) => void;
  onForget: () => void;
}

export const SpellCard = ({
  spell,
  currentFocus,
  onCast,
  onForget,
}: SpellCardProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(false);

  const theme = getCircleTheme(spell.circle);
  const castCost = spell.circle * 2; // Regra de custo
  const canCast = currentFocus >= castCost;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: theme.primary }]}
      activeOpacity={0.9}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerTop}>
          <Text style={styles.spellName}>{spell.name}</Text>
          <View style={[styles.schoolBadge, { backgroundColor: theme.light }]}>
            <Text style={[styles.schoolText, { color: theme.primary }]}>
              {spell.school}
            </Text>
          </View>
        </View>
        {!expanded && (
          <Text style={styles.summaryEffect} numberOfLines={1}>
            {spell.effect}
          </Text>
        )}
      </View>

      {expanded && (
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="flash" size={14} color={theme.primary} />
            <Text style={styles.effectLabel}>
              Efeito: <Text style={styles.effectValue}>{spell.effect}</Text>
            </Text>
          </View>
          <Text style={styles.description}>{spell.description}</Text>

          <View style={styles.actionsFooter}>
            <TouchableOpacity style={styles.forgetBtn} onPress={onForget}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.castBtn,
                !canCast && styles.castBtnDisabled,
                { backgroundColor: canCast ? theme.primary : colors.border },
              ]}
              onPress={() => canCast && onCast(castCost)}
              disabled={!canCast}
            >
              <Text style={styles.castBtnText}>
                {canCast
                  ? `CONJURAR (-${castCost} Foco)`
                  : `Custo: ${castCost} Foco`}
              </Text>
            </TouchableOpacity>
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
      marginHorizontal: 16,
      marginVertical: 6,
      borderRadius: 8,
      padding: 16,
      elevation: 2,
      borderLeftWidth: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: { marginBottom: 4 },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    spellName: { fontSize: 16, fontWeight: "bold", color: colors.text },
    schoolBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    schoolText: { fontSize: 10, textTransform: "uppercase", fontWeight: "700" },
    summaryEffect: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    cardBody: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 6,
    },
    effectLabel: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.textSecondary,
    },
    effectValue: { fontWeight: "normal", color: colors.text },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      textAlign: "justify",
      marginBottom: 16,
    },
    actionsFooter: { flexDirection: "row", alignItems: "center", gap: 10 },
    forgetBtn: {
      padding: 10,
      backgroundColor: colors.error + "15",
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.error + "50",
    },
    castBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    castBtnDisabled: { opacity: 0.7 },
    castBtnText: {
      color: "#fff",
      fontWeight: "bold",
      textTransform: "uppercase",
      fontSize: 14,
    },
  });
