import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedModal } from "../ui/ThemedModal"; // Ajuste o caminho conforme sua pasta

interface GoldModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newAmount: number) => void;
  currentSilver: number;
}

export function GoldModal({
  visible,
  onClose,
  onSave,
  currentSilver,
}: GoldModalProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Estado local para controlar o input antes de salvar
  const [tempSilver, setTempSilver] = useState("");

  // Sempre que abrir, sincroniza com o valor atual do personagem
  useEffect(() => {
    if (visible) {
      setTempSilver(String(currentSilver || 0));
    }
  }, [visible, currentSilver]);

  const adjustMoney = (amount: number) => {
    const currentVal = parseInt(tempSilver) || 0;
    const newVal = Math.max(0, currentVal + amount);
    setTempSilver(String(newVal));
  };

  const handleSave = () => {
    const val = parseInt(tempSilver) || 0;
    onSave(val);
    onClose();
  };

  return (
    <ThemedModal
      visible={visible}
      onClose={onClose}
      title="Gerenciar Pratas"
      animationType="fade"
    >
      <View style={{ padding: 20 }}>
        {/* Input Principal */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="cash"
            size={20}
            color={colors.textSecondary}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.moneyInput}
            keyboardType="numeric"
            value={tempSilver}
            onChangeText={setTempSilver}
            autoFocus
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Botões de Ajuste Rápido */}
        <View style={styles.quickAdjustContainer}>
          <View style={styles.quickAdjustRow}>
            {[-10, -1, 1, 10].map((val) => (
              <TouchableOpacity
                key={val}
                onPress={() => adjustMoney(val)}
                style={styles.adjustBtn}
              >
                <Text style={styles.adjustBtnText}>
                  {val > 0 ? `+${val}` : val}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.modalButtons}>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedModal>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    moneyInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    quickAdjustContainer: {
      marginBottom: 20,
    },
    quickAdjustRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },
    adjustBtn: {
      flex: 1,
      backgroundColor: colors.inputBg,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    adjustBtnText: {
      fontWeight: "bold",
      color: colors.text,
    },
    modalButtons: { flexDirection: "row", gap: 10 },
    cancelBtn: {
      flex: 1,
      padding: 12,
      alignItems: "center",
      borderRadius: 8,
      backgroundColor: colors.inputBg,
    },
    saveBtn: {
      flex: 1,
      padding: 12,
      alignItems: "center",
      borderRadius: 8,
      backgroundColor: colors.gold || "#FFD700", // Fallback se não tiver gold no theme
    },
    cancelText: { color: colors.textSecondary, fontWeight: "bold" },
    saveText: { color: "#fff", fontWeight: "bold" },
  });
