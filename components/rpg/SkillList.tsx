import { useTheme } from "@/context/ThemeContext";
import { SKILL_GROUPS } from "@/data/expertiseData";
import { AttributeName, Character } from "@/types/rpg";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SkillListProps {
  character: Character;
  onToggleSkill: (skillName: string) => void;
  onShowDescription: (skillName: string) => void;
}

const PROFICIENCY_BONUS = 2;

export const SkillList = ({
  character,
  onToggleSkill,
  onShowDescription,
}: SkillListProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.groupsWrapper}>
      {SKILL_GROUPS.map((group) => {
        const attrName = group.attribute as AttributeName;
        const attrMod = character.attributes[attrName]?.modifier || 0;
        const formattedMod = attrMod >= 0 ? `+${attrMod}` : `${attrMod}`;

        return (
          <View key={group.attribute} style={styles.groupContainer}>
            {/* CABEÇALHO DO GRUPO */}
            <View style={styles.groupHeader}>
              <Text style={styles.attributeLabel}>
                {group.attribute}{" "}
                <Text style={styles.modTextHighlight}>{formattedMod}</Text>
              </Text>
              <View style={styles.line} />
            </View>

            <View style={styles.skillsContainer}>
              {group.skills.map((skill) => {
                const isTrained = character.trainedSkills?.includes(skill);
                const skillTotal =
                  attrMod + (isTrained ? PROFICIENCY_BONUS : 0);
                const formattedTotal =
                  skillTotal >= 0 ? `+${skillTotal}` : `${skillTotal}`;

                return (
                  <TouchableOpacity
                    key={skill}
                    style={[
                      styles.skillChip,
                      isTrained && styles.skillChipActive,
                    ]}
                    onPress={() => onToggleSkill(skill)}
                    onLongPress={() => onShowDescription(skill)}
                    delayLongPress={500}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.skillText,
                        isTrained && styles.skillTextActive,
                      ]}
                    >
                      {skill}
                    </Text>

                    <View
                      style={[
                        styles.modPill,
                        isTrained
                          ? { backgroundColor: "rgba(255,255,255,0.25)" }
                          : { backgroundColor: colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modPillText,
                          isTrained && styles.skillTextActive,
                        ]}
                      >
                        {formattedTotal}
                      </Text>
                    </View>

                    {isTrained && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#fff"
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    groupsWrapper: { gap: 24 },
    groupContainer: { gap: 10 },
    groupHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    attributeLabel: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    modTextHighlight: { color: colors.primary },
    line: { flex: 1, height: 1, backgroundColor: colors.border, opacity: 0.5 },
    skillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    skillChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 1,
    },
    skillChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      elevation: 3,
    },
    skillText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
      marginRight: 6,
    },
    skillTextActive: { color: "#fff", fontWeight: "bold" },
    modPill: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 26,
      alignItems: "center",
      justifyContent: "center",
    },
    modPillText: { fontSize: 12, fontWeight: "bold", color: colors.text },
  });
