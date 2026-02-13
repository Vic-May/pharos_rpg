import { useTheme } from "@/context/ThemeContext";
import { Combatant } from "@/types/rpg";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface HealModalProps {
  visible: boolean;
  onClose: () => void;
  healer: Combatant;
  potentialTargets: Combatant[]; // Lista de aliados (ou todos)
  onConfirmHeal: (
    targetId: string,
    healAmount: number,
    isCrit: boolean,
  ) => void;
  spellName: string;
  healFormula: string;
  modifier: number; // Modificador de atributo (INT/SAB)
}

export function HealModal({
  visible,
  onClose,
  healer,
  potentialTargets,
  onConfirmHeal,
  spellName,
  healFormula,
  modifier,
}: HealModalProps) {
  const { colors } = useTheme();
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(
    healer.id,
  ); // Padrão: Self-cast
  const [manualRoll, setManualRoll] = useState("");

  const styles = getStyles(colors);

  // Parse da fórmula (Ex: "1d8")
  const [countStr, dieStr] = healFormula.split("d");
  const count = parseInt(countStr) || 1;
  const die = parseInt(dieStr) || 8;

  const handleRoll = () => {
    if (!selectedTargetId) return;

    let total = 0;
    let rollDetails = [];

    // Se tiver input manual, usa ele
    if (manualRoll) {
      total = parseInt(manualRoll);
    } else {
      // Rola os dados
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * die) + 1;
        total += roll;
        rollDetails.push(roll);
      }
      // Soma o modificador (INT/SAB)
      total += modifier;
    }

    // Passa false para isCrit (crítico geralmente não dobra cura em D&D padrão, ajuste se necessário)
    onConfirmHeal(selectedTargetId, total, false);
    onClose();
    setManualRoll("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Conjurar {spellName}</Text>
          <Text style={styles.subtitle}>
            Fórmula: {healFormula} + {modifier}
          </Text>

          <Text style={styles.label}>Escolha o Alvo:</Text>
          <FlatList
            data={potentialTargets}
            keyExtractor={(item) => item.id}
            style={{ maxHeight: 200, marginBottom: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.targetItem,
                  selectedTargetId === item.id && styles.targetItemSelected,
                ]}
                onPress={() => setSelectedTargetId(item.id)}
              >
                <Text
                  style={[
                    styles.targetName,
                    selectedTargetId === item.id && styles.targetNameSelected,
                  ]}
                >
                  {item.name} - PV: {Math.round((item.hp.current / item.hp.max) * 100)}% 
                </Text>
                {selectedTargetId === item.id && (
                  <Ionicons name="medical" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            )}
          />

          <View style={styles.rollSection}>
            <TextInput
              style={styles.input}
              placeholder="Valor Manual (Opcional)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={manualRoll}
              onChangeText={setManualRoll}
            />

            <TouchableOpacity
              style={styles.healBtn}
              onPress={handleRoll}
              disabled={!selectedTargetId}
            >
              <Ionicons name="water" size={24} color="#fff" />
              <Text style={styles.btnText}>
                {manualRoll
                  ? "CONFIRMAR VALOR"
                  : `ROLAR CURA (${healFormula}+${modifier})`}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      padding: 20,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.primary,
      textAlign: "center",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    targetItem: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    targetItemSelected: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    targetName: { fontSize: 16, color: colors.text },
    targetNameSelected: { color: "#fff", fontWeight: "bold" },
    rollSection: { gap: 10, marginTop: 10 },
    input: {
      backgroundColor: colors.inputBg,
      padding: 12,
      borderRadius: 8,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      textAlign: "center",
    },
    healBtn: {
      backgroundColor: colors.success,
      padding: 16,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    cancelBtn: { padding: 16, alignItems: "center", marginTop: 10 },
    cancelText: { color: colors.textSecondary },
  });
