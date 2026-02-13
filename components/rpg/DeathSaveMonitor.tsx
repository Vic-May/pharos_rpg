import { useTheme } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface DeathSaveMonitorProps {
  successes: number;
  failures: number;
  // Função que o componente chama para pedir para salvar/atualizar
  onUpdateSave: (type: "success" | "failure", value: number) => void;
  // Função que o componente chama quando o usuário tenta rolar (ou envia um valor manual)
  onRoll: (manualValue?: number) => void;
  // Função para encerrar o turno
  onEndTurn: () => void;
}

export const DeathSaveMonitor = ({
  successes,
  failures,
  onUpdateSave,
  onRoll,
  onEndTurn,
}: DeathSaveMonitorProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [manualInput, setManualInput] = useState("");

  const handleManualRoll = () => {
    const val = Number(manualInput);
    if (!isNaN(val) && val > 0) {
      onRoll(val);
      setManualInput(""); // Limpa após usar
    }
  };

  const isStabilized = successes >= 3;
  const isDead = failures >= 3;
  const canRoll = !isStabilized && !isDead;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <MaterialCommunityIcons
            name="skull-outline"
            size={60}
            color={colors.error}
          />
          <Text style={styles.title}>VOCÊ ESTÁ CAÍDO!</Text>

          {/* --- PLACAR DE SUCESSOS/FALHAS --- */}
          <View style={styles.monitorCard}>
            <View style={styles.row}>
              {/* Sucessos */}
              <View style={styles.group}>
                <Text style={[styles.label, { color: colors.success }]}>
                  Sucessos
                </Text>
                <View style={styles.dotsContainer}>
                  {[1, 2, 3].map((i) => (
                    <TouchableOpacity
                      key={`succ-${i}`}
                      style={[
                        styles.dot,
                        { borderColor: colors.success },
                        successes >= i && { backgroundColor: colors.success },
                      ]}
                      onPress={() =>
                        onUpdateSave("success", successes === i ? i - 1 : i)
                      }
                    />
                  ))}
                </View>
              </View>

              {/* Falhas */}
              <View style={styles.group}>
                <Text style={[styles.label, { color: colors.error }]}>
                  Falhas
                </Text>
                <View style={styles.dotsContainer}>
                  {[1, 2, 3].map((i) => (
                    <TouchableOpacity
                      key={`fail-${i}`}
                      style={[
                        styles.dot,
                        { borderColor: colors.error },
                        failures >= i && { backgroundColor: colors.error },
                      ]}
                      onPress={() =>
                        onUpdateSave("failure", failures === i ? i - 1 : i)
                      }
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Mensagens de Fim de Jogo */}
            {isStabilized && (
              <Text style={styles.stabilizedText}>ESTABILIZADO</Text>
            )}
            {isDead && <Text style={styles.deadText}>MORTO</Text>}
          </View>

          {/* --- ÁREA DE AÇÃO (ROLAGEM) --- */}
          {canRoll && (
            <>
              <TouchableOpacity style={styles.rollBtn} onPress={() => onRoll()}>
                <MaterialCommunityIcons
                  name="dice-d20"
                  size={24}
                  color="#fff"
                />
                <Text style={styles.rollBtnText}>ROLAGEM DE SALVAGUARDA</Text>
              </TouchableOpacity>

              <Text style={styles.dividerText}>— OU —</Text>

              <View style={styles.manualRow}>
                <TextInput
                  style={styles.manualInput}
                  placeholder="Valor"
                  placeholderTextColor={colors.error + "80"}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={manualInput}
                  onChangeText={setManualInput}
                />
                <TouchableOpacity
                  style={[
                    styles.manualBtn,
                    !manualInput && styles.manualBtnDisabled,
                  ]}
                  onPress={handleManualRoll}
                  disabled={!manualInput}
                >
                  <Text style={styles.manualBtnText}>CONFIRMAR</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* --- FIM DE TURNO --- */}
          <TouchableOpacity style={styles.endTurnBtn} onPress={onEndTurn}>
            <Text style={styles.endTurnText}>PULAR / ENCERRAR TURNO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
    container: { alignItems: "center" },
    title: {
      fontSize: 24,
      fontWeight: "900",
      color: colors.error,
      marginTop: 10,
      marginBottom: 20,
    },
    monitorCard: {
      backgroundColor: colors.surface,
      width: "100%",
      borderRadius: 12,
      padding: 20,
      borderWidth: 2,
      borderColor: colors.error + "50",
      marginBottom: 30,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    group: { alignItems: "center" },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
      textTransform: "uppercase",
    },
    dotsContainer: { flexDirection: "row", gap: 10 },
    dot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
    },
    stabilizedText: {
      textAlign: "center",
      marginTop: 20,
      fontSize: 20,
      fontWeight: "bold",
      color: colors.success,
      letterSpacing: 2,
    },
    deadText: {
      textAlign: "center",
      marginTop: 20,
      fontSize: 24,
      fontWeight: "900",
      color: colors.error,
      letterSpacing: 4,
    },
    rollBtn: {
      backgroundColor: colors.error,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 8,
      width: "100%",
      gap: 10,
    },
    rollBtnText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    dividerText: {
      color: colors.textSecondary,
      marginVertical: 16,
      fontWeight: "bold",
    },
    manualRow: {
      flexDirection: "row",
      width: "100%",
      gap: 10,
      marginBottom: 30,
    },
    manualInput: {
      flex: 1,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 8,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "bold",
      color: colors.error,
    },
    manualBtn: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.error,
      justifyContent: "center",
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    manualBtnDisabled: { opacity: 0.5 },
    manualBtnText: {
      color: colors.error,
      fontWeight: "bold",
    },
    endTurnBtn: {
      width: "100%",
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 20,
    },
    endTurnText: {
      color: colors.textSecondary,
      fontWeight: "bold",
      letterSpacing: 1,
    },
  });
