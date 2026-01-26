import { useAlert } from "@/context/AlertContext"; // <--- Importar Alert
import { useCharacter } from "@/context/CharacterContext";
import { useTheme } from "@/context/ThemeContext";
import { FEATS_DATA } from "@/data/progression";
import { Feat } from "@/types/rpg";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const FeatsModal = ({ visible, onClose }: Props) => {
  const { colors } = useTheme();
  // Adicione removeFeat aqui 👇
  const { character, addFeat, removeFeat } = useCharacter();
  const { showAlert } = useAlert(); // <--- Hook de Alerta

  const [selectorVisible, setSelectorVisible] = useState(false);

  // Calcula slots (Mantido igual)
  const FEAT_LEVELS = [3, 7, 10, 13];
  const slots = useMemo(() => {
    return FEAT_LEVELS.map((level) => ({
      level,
      unlocked: (character.level || 1) >= level,
      // Proteção extra caso feats seja undefined
      feat: character.feats
        ? character.feats[FEAT_LEVELS.indexOf(level)]
        : null,
    }));
  }, [character.level, character.feats]);

  const availableFeats = FEATS_DATA.filter(
    (f) => !character.feats?.some((owned) => owned.id === f.id),
  );

  const featsByCat = [
    {
      title: "Geral",
      data: availableFeats.filter((f) => f.category === "Geral"),
    },
    {
      title: "Marcial & Sobrevivência",
      data: availableFeats.filter((f) => f.category === "Marcial"),
    },
    {
      title: "Social",
      data: availableFeats.filter((f) => f.category === "Social"),
    },
    {
      title: "Mágico & Mental",
      data: availableFeats.filter((f) => f.category === "Mágico"),
    },
  ];

  const handleSelectFeat = (feat: Feat) => {
    addFeat(feat);
    setSelectorVisible(false);
  };

  // NOVA FUNÇÃO: Remover com confirmação
  const handleRemove = (feat: Feat) => {
    showAlert(
      "Remover Façanha",
      `Deseja remover "${feat.name}"? Você perderá os benefícios.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => removeFeat(feat.id),
        },
      ],
    );
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      padding: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    backBtn: { marginRight: 10 },
    title: { fontSize: 20, fontWeight: "bold", color: colors.text },

    content: { padding: 16 },
    slotCard: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    slotLocked: { opacity: 0.5, backgroundColor: colors.inputBg },
    slotIcon: { width: 40, alignItems: "center" },
    slotInfo: { flex: 1, marginLeft: 10 },
    slotTitle: { fontSize: 16, fontWeight: "bold", color: colors.text },
    slotDesc: { fontSize: 12, color: colors.textSecondary },
    addBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    addText: { color: "#fff", fontWeight: "bold", fontSize: 12 },

    // Estilo do botão de remover
    removeBtn: {
      padding: 8,
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      marginLeft: 8,
    },

    // Modal Interno (Lista) - Mantido igual
    listHeader: {
      backgroundColor: colors.background,
      padding: 10,
      paddingHorizontal: 16,
    },
    listHeaderTitle: {
      color: colors.primary,
      fontWeight: "bold",
      textTransform: "uppercase",
      fontSize: 12,
    },
    featItem: {
      backgroundColor: colors.surface,
      padding: 16,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    featName: { fontSize: 16, fontWeight: "bold", color: colors.text },
    featObj: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      fontStyle: "italic",
    },
    featBenefit: { fontSize: 13, color: colors.text, marginTop: 4 },
  });

  // Modal Seletor (Mantido igual, apenas omitido aqui para brevidade)
  if (selectorVisible) {
    return (
      <Modal visible={true} animationType="slide">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setSelectorVisible(false)}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Escolher Objetivo</Text>
          </View>
          <SectionList
            sections={featsByCat}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderTitle}>{title}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.featItem}
                onPress={() => handleSelectFeat(item)}
              >
                <Text style={styles.featName}>{item.name}</Text>
                <Text style={styles.featObj}>🎯 {item.objective}</Text>
                <Text style={styles.featBenefit}>💎 {item.benefit}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Façanhas & Objetivos</Text>
        </View>

        <ScrollView style={styles.content}>
          <Text
            style={{
              color: colors.textSecondary,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Defina um objetivo para desbloquear poderes ocultos.
          </Text>

          {slots.map((slot) => (
            <View
              key={slot.level}
              style={[styles.slotCard, !slot.unlocked && styles.slotLocked]}
            >
              <View style={styles.slotIcon}>
                <Ionicons
                  name={
                    slot.feat
                      ? "trophy"
                      : slot.unlocked
                        ? "lock-open"
                        : "lock-closed"
                  }
                  size={24}
                  color={slot.feat ? "#FFD700" : colors.textSecondary}
                />
              </View>

              <View style={styles.slotInfo}>
                <Text style={styles.slotTitle}>Slot Nível {slot.level}</Text>
                {slot.unlocked ? (
                  slot.feat ? (
                    <View>
                      <Text
                        style={{ color: colors.primary, fontWeight: "bold" }}
                      >
                        {slot.feat.name}
                      </Text>
                      <Text style={styles.slotDesc}>{slot.feat.benefit}</Text>
                    </View>
                  ) : (
                    <Text style={styles.slotDesc}>
                      Disponível. Selecione um objetivo.
                    </Text>
                  )
                ) : (
                  <Text style={styles.slotDesc}>
                    Desbloqueia no nível {slot.level}
                  </Text>
                )}
              </View>

              {/* AÇÕES: Adicionar ou Remover */}
              {slot.unlocked && !slot.feat && (
                <TouchableOpacity
                  onPress={() => setSelectorVisible(true)}
                  style={styles.addBtn}
                >
                  <Text style={styles.addText}>DEFINIR</Text>
                </TouchableOpacity>
              )}

              {/* Botão de Remover (Lixeira) */}
              {slot.unlocked && slot.feat && (
                <TouchableOpacity
                  onPress={() => handleRemove(slot.feat!)}
                  style={styles.removeBtn}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.error}
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};
