import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Contextos e Hooks
import { useAlert } from "@/context/AlertContext";
import { useCampaign } from "@/context/CampaignContext";
import { useTheme } from "@/context/ThemeContext";

// Componentes
import { CombatantCard } from "@/components/gm/CombatantCard";

export default function GMCombatScreen() {
  const { combatants, addCombatant, sortCombat, clearCombat } = useCampaign();
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [modalVisible, setModalVisible] = useState(false);

  // Estados do Modal "Adicionar Manual"
  const [manualName, setManualName] = useState("");
  const [manualHp, setManualHp] = useState("");
  const [manualInit, setManualInit] = useState("");
  const [manualAc, setManualAc] = useState("");

  const handleAddManual = () => {
    let finalName = manualName.trim() || "Inimigo";

    // Lógica para evitar nomes duplicados no manual
    // Conta quantos começam com esse nome
    const existingCount = combatants.filter(
      (c) => c.name === finalName || c.name.startsWith(`${finalName} #`),
    ).length;

    if (existingCount > 0) {
      finalName = `${finalName} #${existingCount + 1}`;
    }

    addCombatant(
      finalName,
      parseInt(manualHp) || 10,
      parseInt(manualInit) || 0,
      "npc",
      { armorClass: parseInt(manualAc) || 10 },
    );

    setModalVisible(false);
    setManualName("");
    setManualInit("");
    setManualHp("");
    setManualAc("");
  };

  return (
    <View style={styles.container}>
      {/* Header do Mestre */}
      <View style={styles.gmHeader}>
        <Text style={styles.gmTitle}>Turno</Text>
        <View style={{ flexDirection: "row", gap: 15 }}>
          <TouchableOpacity onPress={sortCombat}>
            <Ionicons name="filter" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              showAlert("Limpar", "Remover todos os combatentes?", [
                { text: "Sim", onPress: clearCombat, style: "destructive" },
                { text: "Não", style: "cancel" },
              ])
            }
          >
            <Ionicons name="trash" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Combatentes */}
      <FlatList
        data={combatants}
        renderItem={({ item }) => <CombatantCard item={item} />}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            A mesa está vazia.{"\n"}Adicione combatentes pelo Bestiário ou botão
            abaixo.
          </Text>
        }
      />

      {/* Botão Flutuante (Add Manual) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="person-add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal Manual */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Adicionar Rápido</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome (Ex: Goblin)"
              placeholderTextColor={colors.textSecondary}
              value={manualName}
              onChangeText={setManualName}
              autoFocus
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="HP"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={manualHp}
                onChangeText={setManualHp}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Init"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={manualInit}
                onChangeText={setManualInit}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="CA"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={manualAc}
                onChangeText={setManualAc}
              />
            </View>

            <TouchableOpacity onPress={handleAddManual} style={styles.addBtn}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Adicionar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 15, alignItems: "center" }}
            >
              <Text style={{ color: colors.textSecondary }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    gmHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
    },
    gmTitle: { fontSize: 20, fontWeight: "bold", color: colors.text },
    empty: {
      textAlign: "center",
      marginTop: 50,
      color: colors.textSecondary,
      lineHeight: 24,
    },

    // FAB e Modal (Estilos mantidos para consistência visual)
    fab: {
      position: "absolute",
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#c62828", // Vermelho GM
      alignItems: "center",
      justifyContent: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      padding: 20,
      alignItems: "center",
    },
    modal: {
      backgroundColor: colors.surface,
      padding: 24,
      borderRadius: 16,
      width: "100%",
      maxWidth: 400,
      elevation: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    input: {
      backgroundColor: colors.inputBg,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addBtn: {
      backgroundColor: "#c62828",
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
    },
  });
