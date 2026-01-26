import { useCharacter } from "@/context/CharacterContext";
import { useTheme } from "@/context/ThemeContext";
import { SPECIALIZATIONS } from "@/data/progression";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SpecializationModal = ({ visible, onClose }: Props) => {
  const { colors } = useTheme();
  const { character, applySpecialization } = useCharacter();

  // Filtra as especializações disponíveis para a classe do personagem
  const availableSpecs = useMemo(() => {
    return SPECIALIZATIONS.filter((s) => s.classRequired === character.class);
  }, [character.class]);

  const handleSelect = (spec: any) => {
    applySpecialization(spec);
    onClose();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.8)",
      justifyContent: "center",
      padding: 20,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      maxHeight: "80%",
      padding: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 20,
    },
    item: {
      backgroundColor: colors.inputBg,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 4,
    },
    itemDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
    warning: {
      marginTop: 8,
      fontSize: 12,
      color: colors.error,
      fontStyle: "italic",
    },
    closeBtn: { marginTop: 16, alignItems: "center" },
    closeText: { color: colors.textSecondary },
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Especialização de Classe</Text>
          <Text style={styles.subtitle}>
            Nível 5 alcançado. Escolha seu caminho.
          </Text>

          <ScrollView>
            {availableSpecs.map((spec) => (
              <TouchableOpacity
                key={spec.id}
                style={styles.item}
                onPress={() => handleSelect(spec)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.itemTitle}>{spec.name}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.itemDesc}>{spec.description}</Text>

                {/* Aviso específico para Corsários */}
                {spec.proficiencyChanges && (
                  <Text style={styles.warning}>
                    ⚠️ {spec.proficiencyChanges}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
