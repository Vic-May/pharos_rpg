import { useTheme } from "@/context/ThemeContext";
import { Spell } from "@/types/rpg";
import { getCircleTheme } from "@/utils/spellUtils";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LearnSpellItemProps {
  spell: Spell;
  isLearned: boolean;
  onLearn: () => void;
}

export const LearnSpellItem = ({
  spell,
  isLearned,
  onLearn,
}: LearnSpellItemProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(false);
  const theme = getCircleTheme(spell.circle);

  return (
    <View
      style={[styles.learnCardContainer, isLearned && styles.learnCardDisabled]}
    >
      <TouchableOpacity
        style={styles.learnCardHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.learnName,
              isLearned && { color: colors.textSecondary },
            ]}
          >
            {spell.name}
          </Text>
          <Text style={styles.learnInfo}>
            Círculo {spell.circle} • {spell.school}
          </Text>
        </View>

        {isLearned ? (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={colors.textSecondary}
          />
        ) : (
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={theme.primary}
          />
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.learnCardBody}>
          <Text style={styles.learnDescription}>{spell.description}</Text>
          <Text style={styles.learnEffect}>Efeito: {spell.effect}</Text>

          {!isLearned && (
            <TouchableOpacity
              style={[styles.learnBtn, { backgroundColor: theme.primary }]}
              onPress={onLearn}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.learnBtnText}>Adicionar ao Grimório</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    learnCardContainer: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginBottom: 8,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    learnCardDisabled: {
      backgroundColor: colors.inputBg,
      elevation: 0,
      opacity: 0.8,
    },
    learnCardHeader: {
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    learnName: { fontSize: 16, fontWeight: "bold", color: colors.text },
    learnInfo: { fontSize: 12, color: colors.textSecondary },
    learnCardBody: {
      padding: 12,
      paddingTop: 0,
      borderTopWidth: 1,
      borderTopColor: colors.border + "50",
    },
    learnDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
      lineHeight: 20,
      marginBottom: 8,
    },
    learnEffect: {
      fontSize: 12,
      fontStyle: "italic",
      color: colors.text,
      marginBottom: 12,
    },
    learnBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 6,
    },
    learnBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  });
