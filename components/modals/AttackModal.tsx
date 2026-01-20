import { useTheme } from "@/context/ThemeContext";
import { Combatant } from "@/types/rpg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// --- HELPER: Rolar Dados ---
const rollFormula = (formula: string): number => {
  try {
    const clean = formula.toLowerCase().replace(/\s/g, "");
    const parts = clean.split("+");
    let total = 0;
    for (const part of parts) {
      if (part.includes("d")) {
        const [count, faces] = part.split("d").map(Number);
        for (let i = 0; i < (count || 1); i++) {
          total += Math.floor(Math.random() * faces) + 1;
        }
      } else {
        total += parseInt(part) || 0;
      }
    }
    return total;
  } catch (e) {
    return 0;
  }
};

// --- HELPER: Status de Vida (Névoa de Guerra) ---
const getHealthStatus = (current: number, max: number) => {
  if (current <= 0) return "Derrotado";
  const percent = current / max;
  if (percent > 0.5) return "Saudável";
  if (percent > 0.2) return "Ferido";
  return "Gravemente Ferido";
};

interface AttackModalProps {
  visible: boolean;
  onClose: () => void;
  attacker: Combatant;
  potentialTargets: Combatant[];
  onConfirmAttack: (
    targetId: string,
    hitTotal: number,
    damageTotal: number,
    isCrit: boolean
  ) => void;
  isGm: boolean; // <--- A chave para a visibilidade
  initialBonus?: string;
  initialDamage?: string;
}

export const AttackModal = ({
  visible,
  onClose,
  attacker,
  potentialTargets,
  onConfirmAttack,
  isGm,
  initialBonus,
  initialDamage,
}: AttackModalProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [step, setStep] = useState(1);
  const [selectedTarget, setSelectedTarget] = useState<Combatant | null>(null);

  const [attackBonus, setAttackBonus] = useState("0");
  const [damageFormula, setDamageFormula] = useState("1d4");
  const [hitValue, setHitValue] = useState("");
  const [dmgValue, setDmgValue] = useState("");
  const [isCrit, setIsCrit] = useState(false);

  // Reset ao abrir
  useEffect(() => {
    if (visible) {
      setStep(1);
      setSelectedTarget(null);
      setHitValue("");
      setDmgValue("");
      setIsCrit(false);

      // Previsão de bônus baseada em Atributos
      const strMod = attacker.attributes["Força"]?.modifier || 0;
      const dexMod = attacker.attributes["Destreza"]?.modifier || 0;
      const bestMod = Math.max(strMod, dexMod);

      setAttackBonus(bestMod >= 0 ? `+${bestMod}` : `${bestMod}`);
      setDamageFormula(`1d6+${bestMod + 2}`);

      if (initialBonus && initialDamage) {
        // SE VEIO DE MAGIA: Usa o que veio
        setAttackBonus(initialBonus);
        setDamageFormula(initialDamage);
      } else {
        // SE É ATAQUE BÁSICO: Calcula For/Des
        const strMod = attacker.attributes["Força"]?.modifier || 0;
        const dexMod = attacker.attributes["Destreza"]?.modifier || 0;
        const bestMod = Math.max(strMod, dexMod);
        setAttackBonus(bestMod >= 0 ? `+${bestMod + 2}` : `${bestMod}`);
        setDamageFormula(`1d6+${bestMod}`);
      }
    }
  }, [visible, attacker, initialBonus, initialDamage]);

  const handleSelectTarget = (target: Combatant) => {
    setSelectedTarget(target);
    setStep(2);
  };

  const handleAutoRoll = () => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const bonus = parseInt(attackBonus) || 0;
    const totalHit = d20 + bonus;
    const critical = d20 === 20;
    setIsCrit(critical);
    setHitValue(String(totalHit));

    let damage = rollFormula(damageFormula);
    if (critical) damage = Math.floor(damage * 1.5);
    setDmgValue(String(damage));
  };

  const handleSubmit = () => {
    if (!selectedTarget) return;
    const finalHit = parseInt(hitValue) || 0;
    const finalDmg = parseInt(dmgValue) || 0;
    onConfirmAttack(selectedTarget.id, finalHit, finalDmg, isCrit);
    onClose();
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
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 1 ? "Selecionar Alvo" : "Resolver Ataque"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* STEP 1: LISTA DE ALVOS */}
          {step === 1 && (
            <FlatList
              data={potentialTargets.filter(
                (t) => t.id !== attacker.id && t.hp.current > 0
              )}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 400 }}
              renderItem={({ item }) => {
                // Lógica de Exibição
                const status = getHealthStatus(item.hp.current, item.hp.max);
                const showExactData = isGm || item.type === "player"; // Player vê dados exatos de outros Players? Geralmente não, mas ajustável. Aqui vou seguir o prompt: GM vê tudo.

                return (
                  <TouchableOpacity
                    style={styles.targetRow}
                    onPress={() => handleSelectTarget(item)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.targetName}>{item.name}</Text>
                      <Text style={styles.targetDetail}>
                        {item.type === "player" ? "Jogador" : "Inimigo"} •{" "}
                        {/* CONDICIONAL DE HP */}
                        <Text
                          style={{
                            fontWeight: isGm ? "bold" : "normal",
                            color: isGm ? colors.text : colors.textSecondary,
                          }}
                        >
                          {isGm
                            ? `HP ${item.hp.current}/${item.hp.max}`
                            : status}
                        </Text>
                      </Text>
                    </View>

                    {/* CONDICIONAL DE CA (Só GM vê o Badge) */}
                    {isGm && (
                      <View style={styles.acBadge}>
                        <MaterialCommunityIcons
                          name="shield"
                          size={14}
                          color={colors.surface}
                        />
                        <Text style={styles.acText}>CA {item.armorClass}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhum alvo válido.</Text>
              }
            />
          )}

          {/* STEP 2: ROLAGEM */}
          {step === 2 && selectedTarget && (
            <ScrollView contentContainerStyle={{ padding: 10 }}>
              <View style={styles.versusContainer}>
                <Text style={styles.versusText}>
                  <Text style={{ color: colors.primary }}>{attacker.name}</Text>{" "}
                  vs{" "}
                  <Text style={{ color: colors.error }}>
                    {selectedTarget.name}
                  </Text>
                </Text>

                {/* CONDICIONAL: Só mostra a CA numérica para o GM */}
                {isGm ? (
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    CA do Alvo: {selectedTarget.armorClass}
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      fontStyle: "italic",
                    }}
                  >
                    Status:{" "}
                    {getHealthStatus(
                      selectedTarget.hp.current,
                      selectedTarget.hp.max
                    )}
                  </Text>
                )}
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.label}>Bônus Acerto</Text>
                  <TextInput
                    style={styles.input}
                    value={attackBonus}
                    onChangeText={setAttackBonus}
                    placeholder="+0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Dano (Ex: 1d8+3)</Text>
                  <TextInput
                    style={styles.input}
                    value={damageFormula}
                    onChangeText={setDamageFormula}
                    placeholder="1d6"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.autoRollBtn}
                onPress={handleAutoRoll}
              >
                <MaterialCommunityIcons
                  name="dice-d20"
                  size={24}
                  color="#fff"
                />
                <Text style={styles.autoRollText}>ROLAR DADOS (APP)</Text>
              </TouchableOpacity>

              <Text style={styles.orText}>— OU INSIRA MANUALMENTE —</Text>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.label}>Total Acerto</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: hitValue
                          ? parseInt(hitValue) >= selectedTarget.armorClass
                            ? colors.success
                            : colors.error
                          : colors.border,
                      },
                    ]}
                    value={hitValue}
                    onChangeText={setHitValue}
                    keyboardType="numeric"
                    placeholder="D20 + Mod"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Total Dano</Text>
                  <TextInput
                    style={styles.input}
                    value={dmgValue}
                    onChangeText={setDmgValue}
                    keyboardType="numeric"
                    placeholder="Dano Final"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              {/* Feedback Visual: ACERTOU/ERROU */}
              {/* O Jogador vê o feedback (Quality of Life), mas não vê a CA exata acima */}
              {hitValue !== "" && (
                <View
                  style={[
                    styles.resultBanner,
                    {
                      backgroundColor:
                        parseInt(hitValue) >= selectedTarget.armorClass
                          ? colors.success + "20"
                          : colors.error + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.resultText,
                      {
                        color:
                          parseInt(hitValue) >= selectedTarget.armorClass
                            ? colors.success
                            : colors.error,
                      },
                    ]}
                  >
                    {parseInt(hitValue) >= selectedTarget.armorClass
                      ? "ACERTOU!"
                      : "ERROU!"}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.confirmBtn, !hitValue && { opacity: 0.5 }]}
                onPress={handleSubmit}
                disabled={!hitValue}
              >
                <Text style={styles.confirmText}>CONFIRMAR ATAQUE</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

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
      borderRadius: 16,
      maxHeight: "80%",
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    title: { fontSize: 18, fontWeight: "bold", color: colors.text },
    emptyText: {
      padding: 20,
      textAlign: "center",
      color: colors.textSecondary,
    },

    targetRow: {
      flexDirection: "row",
      padding: 16,
      borderBottomWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    targetName: { fontSize: 16, fontWeight: "bold", color: colors.text },
    targetDetail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    acBadge: {
      backgroundColor: colors.text,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    acText: { color: colors.surface, fontWeight: "bold", fontSize: 12 },

    versusContainer: { alignItems: "center", marginBottom: 16 },
    versusText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    row: { flexDirection: "row", marginBottom: 16 },
    label: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
      textTransform: "uppercase",
      fontWeight: "bold",
    },
    input: {
      backgroundColor: colors.inputBg,
      padding: 12,
      borderRadius: 8,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "bold",
    },
    divider: { height: 1, backgroundColor: colors.border, marginBottom: 16 },

    autoRollBtn: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 14,
      borderRadius: 8,
      gap: 8,
    },
    autoRollText: { color: "#fff", fontWeight: "bold" },
    orText: {
      textAlign: "center",
      color: colors.textSecondary,
      marginVertical: 12,
      fontSize: 12,
    },

    resultBanner: {
      padding: 10,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 16,
    },
    resultText: { fontWeight: "900", fontSize: 18, letterSpacing: 1 },

    confirmBtn: {
      backgroundColor: colors.success,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    confirmText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  });
