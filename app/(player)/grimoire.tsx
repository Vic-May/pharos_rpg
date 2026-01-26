import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Contexto e Dados
import { useAlert } from "@/context/AlertContext";
import { useCharacter } from "@/context/CharacterContext";
import { useTheme } from "@/context/ThemeContext";
import { Spell } from "@/types/rpg";
import { getCircleTheme } from "@/utils/spellUtils";

// Componentes
import { SpellSelectorModal } from "@/components/modals/SpellSelectorModal";
import { SpellCard } from "@/components/rpg/SpellCard";
import { StatBar } from "@/components/ui/StatBar";

export default function GrimoireScreen() {
  const { character, addSpell, removeSpell, updateStat } = useCharacter();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { showAlert } = useAlert();

  const [learnModalVisible, setLearnModalVisible] = useState(false);

  // Agrupamento de magias por Círculo
  const sections = useMemo(() => {
    if (!character.grimoire || character.grimoire.length === 0) return [];

    const groups = character.grimoire.reduce(
      (acc, spell) => {
        const circleKey = spell.circle;
        if (!acc[circleKey]) acc[circleKey] = [];
        acc[circleKey].push(spell);
        return acc;
      },
      {} as Record<number, Spell[]>,
    );

    return Object.keys(groups)
      .map((key) => Number(key))
      .sort((a, b) => a - b)
      .map((circle) => ({
        title: `${circle}º Círculo`,
        circleLevel: circle,
        data: groups[circle],
      }));
  }, [character.grimoire]);

  const focus = character.stats.focus;

  // Handlers
  const handleCastSpell = (spellName: string, cost: number) => {
    showAlert(
      "Conjurar Magia",
      `Gastar ${cost} de Foco para lançar ${spellName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Conjurar", onPress: () => updateStat("focus", -cost) },
      ],
    );
  };

  const handleForgetSpell = (spellId: string) => {
    showAlert("Esquecer Magia", "Tem certeza?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim",
        style: "destructive",
        onPress: () => removeSpell(spellId),
      },
    ]);
  };

  const handleLearnSpell = (spell: Spell) => {
    addSpell(spell);
    showAlert("Sucesso", `${spell.name} adicionada ao grimório.`);
  };

  return (
    <View style={styles.container}>
      {/* --- HUD DE FOCO --- */}
      <View style={styles.focusHud}>
        <View style={styles.focusHeader}>
          <View style={styles.focusLabelContainer}>
            <Ionicons name="flash" size={16} color={colors.focus} />
            <Text style={styles.focusTitle}>PONTOS DE FOCO</Text>
          </View>
          <Text style={styles.focusValue}>
            <Text style={styles.focusCurrent}>{focus.current}</Text>
            <Text style={styles.focusMax}> / {focus.max}</Text>
          </Text>
        </View>

        {/* Usando o componente StatBar reutilizável */}
        <StatBar
          current={focus.current}
          max={focus.max}
          color={colors.focus}
          backgroundColor={colors.border}
        />
      </View>

      {/* Botão de Adicionar Magia */}
      <View style={styles.actionBar}>
        <Text style={styles.screenTitle}>Grimório</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setLearnModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Aprender</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Magias Aprendidas */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SpellCard
            spell={item}
            currentFocus={focus.current}
            onCast={(cost) => handleCastSpell(item.name, cost)}
            onForget={() => handleForgetSpell(item.id)}
          />
        )}
        renderSectionHeader={({ section: { title, circleLevel } }) => {
          const theme = getCircleTheme(circleLevel);
          return (
            <View style={styles.sectionHeader}>
              <View
                style={[styles.circleDot, { backgroundColor: theme.primary }]}
              />
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                {title}
              </Text>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
        ListEmptyComponent={
          <Text style={styles.emptyList}>
            Nenhuma magia aprendida. Clique em Aprender para adicionar.
          </Text>
        }
      />

      {/* --- MODAL DE APRENDER MAGIAS --- */}
      <SpellSelectorModal
        visible={learnModalVisible}
        onClose={() => setLearnModalVisible(false)}
        onSelect={addSpell}
        learnedSpells={character.spells}
      />
    </View>
  );
}

// Styles reduzidos (apenas layout)
const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    // HUD Foco
    focusHud: {
      backgroundColor: colors.surface,
      paddingVertical: 12,
      paddingHorizontal: 16,
      elevation: 2,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 4,
    },
    focusHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    focusLabelContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
    focusTitle: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.focus,
      letterSpacing: 1,
    },
    focusValue: { fontSize: 14, color: colors.textSecondary },
    focusCurrent: { fontSize: 20, fontWeight: "bold", color: colors.text },
    focusMax: { fontSize: 14, color: colors.textSecondary },
    // Action Bar
    actionBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: colors.background,
    },
    screenTitle: { fontSize: 24, fontWeight: "bold", color: colors.text },
    addBtn: {
      flexDirection: "row",
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      alignItems: "center",
      gap: 4,
    },
    addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
    // List
    listContent: { paddingBottom: 20 },
    sectionHeader: {
      backgroundColor: colors.background,
      paddingVertical: 8,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    circleDot: { width: 8, height: 8, borderRadius: 4 },
    sectionTitle: { fontSize: 18, fontWeight: "bold" },
    emptyList: {
      textAlign: "center",
      marginTop: 40,
      color: colors.textSecondary,
      fontStyle: "italic",
      paddingHorizontal: 40,
    },
    // Modal
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
