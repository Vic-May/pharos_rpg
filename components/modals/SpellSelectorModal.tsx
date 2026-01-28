import { useTheme } from "@/context/ThemeContext";
import { MAGIC_SCHOOLS } from "@/data/spellData";
import { Spell } from "@/types/rpg";
import React, { useMemo } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LearnSpellItem } from "../rpg/LearnSpellItem";
import { SafeAreaView } from "react-native-safe-area-context";

interface SpellSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (spell: Spell) => void;
  learnedSpells?: Spell[]; // Para marcar quais já foram aprendidas
}

export const SpellSelectorModal = ({
  visible,
  onClose,
  onSelect,
  learnedSpells = [],
}: SpellSelectorModalProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Biblioteca Arcana</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          {MAGIC_SCHOOLS.map((school) => (
            <View key={school.id} style={styles.schoolGroup}>
              <Text style={styles.schoolTitle}>{school.name}</Text>
              <Text style={styles.schoolQuote}>{school.quote}</Text>

              {school.spells.map((spell) => {
                const isLearned = learnedSpells.some((s) => s.id === spell.id);
                return (
                  <LearnSpellItem
                    key={spell.id}
                    spell={spell}
                    isLearned={isLearned}
                    onLearn={() => onSelect(spell)}
                  />
                );
              })}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    modalContainer: { flex: 1, backgroundColor: colors.background },
    modalHeader: {
      padding: 16,
      backgroundColor: colors.surface,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
    closeText: { color: colors.primary, fontWeight: "600" },
    modalContent: { padding: 16 },
    schoolGroup: { marginBottom: 24 },
    schoolTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    schoolQuote: {
      fontSize: 12,
      fontStyle: "italic",
      color: colors.textSecondary,
      marginBottom: 12,
    },
  });
