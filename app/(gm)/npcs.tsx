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

import { AddNpcModal } from "@/components/modals/AddNpcModal";
import { NpcCard } from "@/components/rpg/NpcCard";
import { useAlert } from "@/context/AlertContext";
import { useCampaign } from "@/context/CampaignContext";
import { useTheme } from "@/context/ThemeContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { NpcTemplate } from "@/types/rpg";
import { npcToCombatant } from "@/utils/combatantFactory";
import { generateSafeId } from "@/utils/stringUtils";

// Componentes

export default function NpcScreen() {
  const {
    npcLibrary,
    saveNpcToLibrary,
    deleteNpcFromLibrary,
    updateNpcInLibrary,
    addCombatant,
    combatants,
  } = useCampaign();
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const { sendMessage, isConnected } = useWebSocket();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [modalVisible, setModalVisible] = useState(false);
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [selectedNpc, setSelectedNpc] = useState<NpcTemplate | null>(null);
  const [editingNpc, setEditingNpc] = useState<NpcTemplate | null>(null);
  const [quantity, setQuantity] = useState("1");

  // --- HANDLERS ---
  const handleCreate = () => {
    setEditingNpc(null);
    setModalVisible(true);
  };

  const handleEdit = (npc: NpcTemplate) => {
    setEditingNpc(npc);
    setModalVisible(true);
  };

  const handleSaveNpc = (data: Partial<NpcTemplate>) => {
    if (editingNpc && editingNpc.id) {
      updateNpcInLibrary(editingNpc.id, data as NpcTemplate);
    } else {
      saveNpcToLibrary(data as Omit<NpcTemplate, "id">);
    }
  };

  const openCombatModal = (npc: NpcTemplate) => {
    setSelectedNpc(npc);
    setQuantity("1");
    setQtyModalVisible(true);
  };

  const handleDuplicate = (npc: NpcTemplate) => {
    // Cria uma cópia profunda para evitar referência
    const copy: NpcTemplate = {
      ...npc,
      id: "", // Limpa o ID para ser tratado como novo ao salvar
      name: `${npc.name} (Cópia)`,
    };

    setEditingNpc(copy); // Define como "editando" (mas sem ID, então salvará como novo)
    setModalVisible(true);
  };

  const confirmAddToCombat = () => {
    if (!selectedNpc) return;
    const qty = parseInt(quantity) || 1;

    const baseName = selectedNpc.name.replace(/ #\d+$/, "").trim();

    const existingSameName = combatants.filter(
      (c) => c.name === baseName || c.name.startsWith(`${baseName} #`),
    );

    let highestNumber = 0;
    if (existingSameName.length > 0) {
      existingSameName.forEach((c) => {
        if (c.name === baseName) {
          highestNumber = Math.max(highestNumber, 1);
        } else {
          const match = c.name.match(/ #(\d+)$/);
          if (match && match[1]) {
            highestNumber = Math.max(highestNumber, parseInt(match[1]));
          }
        }
      });
    }

    for (let i = 0; i < qty; i++) {
      const init =
        Math.floor(Math.random() * 20) + 1 + selectedNpc.initiativeBonus;

      const nextNumber = highestNumber + i + 1;

      const shouldNumber = qty > 1 || existingSameName.length > 0;

      const newCombatant = npcToCombatant(selectedNpc, init, nextNumber);

      if (!shouldNumber) {
        newCombatant.name = baseName;
        newCombatant.id = generateSafeId(baseName);
      } else {
        newCombatant.name = `${baseName} #${nextNumber}`;
      }

      // Envio
      if (isConnected) {
        sendMessage("GM_ADD_NPC", newCombatant);
      } else {
        addCombatant(
          newCombatant.name,
          newCombatant.hp.max,
          init,
          "npc",
          newCombatant,
        );
      }
    }

    const modeMsg = isConnected
      ? "enviados ao servidor"
      : "adicionados (Offline)";
    showAlert("Sucesso", `${qty}x ${baseName} ${modeMsg}.`);
    setQtyModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={npcLibrary}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <NpcCard
            item={item}
            onEdit={handleEdit}
            onDelete={deleteNpcFromLibrary}
            onCombat={openCombatModal}
            onDuplicate={handleDuplicate}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum NPC no Bestiário.</Text>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* MODAL COMPLEXO DE EDIÇÃO */}
      <AddNpcModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveNpc}
        initialData={editingNpc}
      />

      {/* MODAL QUANTIDADE (Mantido igual) */}
      <Modal visible={qtyModalVisible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.qtyBox}>
            <Text style={styles.qtyTitle}>Adicionar ao Combate</Text>
            <Text
              style={{
                color: colors.textSecondary,
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Quantos {selectedNpc?.name}?
            </Text>
            <TextInput
              style={styles.qtyInput}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                onPress={() => setQtyModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmAddToCombat}
                style={styles.confirmBtn}
              >
                <Text style={styles.saveText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    empty: { textAlign: "center", marginTop: 50, color: colors.textSecondary },

    // Botão Flutuante (FAB)
    fab: {
      position: "absolute",
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#c62828", // Vermelho do Mestre
      alignItems: "center",
      justifyContent: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },

    // Modal de Quantidade
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      padding: 20,
      alignItems: "center",
    },
    qtyBox: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 12,
      width: "80%",
      elevation: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    qtyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 12,
    },
    qtyInput: {
      backgroundColor: colors.inputBg,
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      padding: 12,
      borderRadius: 8,
      color: colors.text,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalBtns: { flexDirection: "row", gap: 10 },
    cancelBtn: {
      flex: 1,
      padding: 12,
      backgroundColor: colors.inputBg,
      alignItems: "center",
      borderRadius: 8,
    },
    confirmBtn: {
      flex: 1,
      padding: 12,
      backgroundColor: "#c62828",
      alignItems: "center",
      borderRadius: 8,
    },
    cancelText: { color: colors.textSecondary, fontWeight: "bold" },
    saveText: { color: "#fff", fontWeight: "bold" },
  });
