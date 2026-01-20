import { useCharacter } from "@/context/CharacterContext";
import { useTheme } from "@/context/ThemeContext";
import { ANCESTRIES, CULTURAL_ORIGINS } from "@/data/origins";
import { ALL_CLASSES, AttributeName, CharacterClass } from "@/types/rpg";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface EditCharacterModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EditCharacterModal({
  visible,
  onClose,
}: EditCharacterModalProps) {
  const {
    character,
    updateNameAndClass,
    updateLevel,
    updateAncestry,
    updateOrigin,
    updateMaxStat,
    updateAttribute,
  } = useCharacter();

  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet" // iOS: Card estilo gaveta. Android: Full Screen.
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* --- HEADER FIXO --- */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Editar Personagem</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Concluir</Text>
          </TouchableOpacity>
        </View>

        {/* --- CONTEÚDO COM SCROLL --- */}
        <ScrollView contentContainerStyle={styles.content}>
          {/* 1. Identidade & Nível */}
          <Text style={styles.sectionTitle}>Identidade</Text>

          <View style={styles.row}>
            {/* Campo Nome */}
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={character.name}
                onChangeText={(txt) =>
                  updateNameAndClass(txt, character.class as CharacterClass)
                }
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Campo Nível */}
            <View style={[styles.inputGroup, { width: 120 }]}>
              <Text style={styles.label}>Nível</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => updateLevel((character.level || 1) - 1)}
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.attrEditValue}>{character.level || 1}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => updateLevel((character.level || 1) + 1)}
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Classe</Text>
            <View style={styles.classSelector}>
              {ALL_CLASSES.map((cls) => {
                const isSelected = character.class === cls;
                const currentAncestry = ANCESTRIES.find(
                  (a) => a.id === character.ancestry?.id,
                );
                const isRestricted =
                  currentAncestry?.restrictedClasses?.includes(cls);

                return (
                  <TouchableOpacity
                    key={cls}
                    disabled={isRestricted}
                    style={[
                      styles.classChip,
                      isSelected && styles.classChipActive,
                      isRestricted && styles.classChipDisabled,
                    ]}
                    onPress={() => updateNameAndClass(character.name, cls)}
                  >
                    <Text
                      style={[
                        styles.classChipText,
                        isSelected && styles.classChipTextActive,
                        isRestricted && styles.classChipTextDisabled,
                      ]}
                    >
                      {cls}
                    </Text>
                    {isSelected && (
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

          {/* 2. Ancestralidade */}
          <Text style={styles.sectionTitle}>Ancestralidade</Text>
          <View style={styles.chipContainer}>
            {ANCESTRIES.map((anc) => (
              <TouchableOpacity
                key={anc.id}
                style={[
                  styles.chip,
                  character.ancestry?.id === anc.id && styles.chipActive,
                ]}
                onPress={() => updateAncestry(anc.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    character.ancestry?.id === anc.id && styles.chipTextActive,
                  ]}
                >
                  {anc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helperText}>
            Bônus:{" "}
            {ANCESTRIES.find((a) => a.id === character.ancestry?.id)
              ?.attributeBonus || "-"}
          </Text>

          {/* 3. Origem */}
          <Text style={styles.sectionTitle}>Origem Cultural</Text>
          <View style={styles.listSelector}>
            {CULTURAL_ORIGINS.filter(
              (o) =>
                o.ancestryId === character.ancestry?.id ||
                o.ancestryId === "mista",
            ).map((orig) => (
              <TouchableOpacity
                key={orig.id}
                style={[
                  styles.listItem,
                  character.culturalOrigin?.id === orig.id &&
                    styles.listItemActive,
                ]}
                onPress={() => updateOrigin(orig.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.listItemTitle,
                      character.culturalOrigin?.id === orig.id &&
                        styles.listItemTitleActive,
                    ]}
                  >
                    {orig.name}
                  </Text>
                  <Text style={styles.listItemDesc}>{orig.description}</Text>
                </View>
                {character.culturalOrigin?.id === orig.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* 4. Stats & Atributos */}
          <Text style={styles.sectionTitle}>Status Máximos</Text>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Vida Máx</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(character.stats.hp.max)}
                onChangeText={(t) => updateMaxStat("hp", Number(t))}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Foco Máx</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(character.stats.focus.max)}
                onChangeText={(t) => updateMaxStat("focus", Number(t))}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Atributos</Text>
          <View style={styles.attributesEditor}>
            {Object.values(character.attributes).map((attr) => (
              <View key={attr.name} style={styles.attrEditRow}>
                <Text style={styles.attrEditLabel}>{attr.name}</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() =>
                      updateAttribute(
                        attr.name as AttributeName,
                        attr.value - 1,
                      )
                    }
                  >
                    <Ionicons name="remove" size={20} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.attrEditValue}>{attr.value}</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() =>
                      updateAttribute(
                        attr.name as AttributeName,
                        attr.value + 1,
                      )
                    }
                  >
                    <Ionicons name="add" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modPreview}>
                  Mod: {attr.modifier >= 0 ? "+" : ""}
                  {attr.modifier}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// --- ESTILOS ESPECÍFICOS DO MODAL ---
const getStyles = (colors: any) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background, // Fundo preenche tudo
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface, // Destaque visual
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    closeBtn: {
      padding: 4,
    },
    closeText: {
      color: colors.primary,
      fontWeight: "bold",
      fontSize: 16,
    },
    content: {
      padding: 20,
      paddingBottom: 60, // Espaço extra no final
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 12,
      color: colors.textSecondary,
      textTransform: "uppercase",
    },
    row: { flexDirection: "row" },
    inputGroup: { marginBottom: 16 },
    label: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 6,
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.inputBg,
      color: colors.text,
    },
    // Stepper
    stepper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "space-between",
    },
    stepBtn: { padding: 12 },
    attrEditValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      minWidth: 30,
    },
    // Chips & Selectors
    classSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    classChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    classChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    classChipDisabled: { backgroundColor: colors.inputBg, opacity: 0.5 },
    classChipText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    classChipTextActive: { color: "#fff", fontWeight: "bold" },
    classChipTextDisabled: {
      textDecorationLine: "line-through",
      color: colors.error,
    },
    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 4,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primary },
    chipText: { color: colors.textSecondary, fontWeight: "500" },
    chipTextActive: { color: "#fff" },
    helperText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 16,
      fontStyle: "italic",
    },
    // Lista Origem
    listSelector: { gap: 8 },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.inputBg,
    },
    listItemActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "15", // Tint leve
    },
    listItemTitle: { fontWeight: "bold", fontSize: 14, color: colors.text },
    listItemTitleActive: { color: colors.primary },
    listItemDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    // Attributes Editor
    attributesEditor: {
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    attrEditRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + "40",
    },
    attrEditLabel: {
      fontSize: 16,
      fontWeight: "500",
      width: 100,
      color: colors.text,
    },
    modPreview: {
      width: 60,
      textAlign: "right",
      color: colors.textSecondary,
      fontSize: 14,
    },
  });
