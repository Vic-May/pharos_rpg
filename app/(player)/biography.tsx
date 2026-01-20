import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// Contexto
import { ThemeColors } from "@/constants/theme";
import { useAlert } from "@/context/AlertContext";
import { useCharacter } from "@/context/CharacterContext";
import { useTheme } from "@/context/ThemeContext";
import { SKILL_DESCRIPTIONS } from "@/data/expertiseData";

// Componente Refatorado
import { SkillList } from "@/components/rpg/SkillList";

export default function BiographyScreen() {
  const { character, updateBackstory, toggleTrainedSkill } = useCharacter();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { showAlert } = useAlert();

  const handleShowDescription = (skill: string) => {
    showAlert(skill, SKILL_DESCRIPTIONS[skill] || "Sem descrição disponível.");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* --- SEÇÃO 1: PERÍCIAS TREINADAS --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="school" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Perícias Treinadas</Text>
          </View>
          <Text style={styles.helperText}>
            Toque para treinar (+2). Segure para ver a descrição.
          </Text>

          {/* LISTA DE SKILLS COMPONENTIZADA */}
          <SkillList
            character={character}
            onToggleSkill={toggleTrainedSkill}
            onShowDescription={handleShowDescription}
          />
        </View>

        <View style={styles.divider} />

        {/* --- SEÇÃO 2: HISTÓRIA --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>História do Personagem</Text>
          </View>

          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              multiline={true}
              placeholder="Escreva aqui a origem, feitos e motivações do seu personagem..."
              placeholderTextColor={colors.textSecondary}
              value={character.backstory}
              onChangeText={updateBackstory}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16 },
    section: { marginBottom: 30 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
    helperText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 12,
      fontStyle: "italic",
    },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
    textAreaContainer: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      height: 300,
      elevation: 2,
      marginBottom: 50,
    },
    textArea: {
      flex: 1,
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
      textAlignVertical: "top",
    },
  });
