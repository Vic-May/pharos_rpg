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
import { Combatant, NpcTemplate } from "@/types/rpg";
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
    if (editingNpc) {
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

  const confirmAddToCombat = () => {
    if (!selectedNpc) return;
    const qty = parseInt(quantity) || 1;

    // 1. Limpa o nome base (remove "#1", "#2" se já vier no nome do template/seleção)
    // Ex: se selectedNpc.name for "Bandido #2", vira "Bandido"
    const baseName = selectedNpc.name.replace(/ #\d+$/, "").trim();

    // 2. Descobre qual o maior número que já existe no combate para esse nome
    // Filtra todos que são "Bandido" ou "Bandido #X"
    const existingSameName = combatants.filter(
      (c) => c.name === baseName || c.name.startsWith(`${baseName} #`),
    );

    let highestNumber = 0;

    if (existingSameName.length > 0) {
      // Se já tem gente com esse nome, varre para achar o maior número
      existingSameName.forEach((c) => {
        // Se o nome for exato, conta como 1
        if (c.name === baseName) {
          highestNumber = Math.max(highestNumber, 1);
        } else {
          // Tenta extrair o número do final da string
          const match = c.name.match(/ #(\d+)$/);
          if (match && match[1]) {
            highestNumber = Math.max(highestNumber, parseInt(match[1]));
          }
        }
      });
    }

    // Lógica para enviar ao combate
    for (let i = 0; i < qty; i++) {
      const init =
        Math.floor(Math.random() * 20) + 1 + selectedNpc.initiativeBonus;

      // 3. Define o próximo número sequencial
      const nextNumber = highestNumber + i + 1;

      // 4. Decide se coloca o número no nome
      // Coloca número se: Estiver adicionando mais de 1 AGORA -OU- Já existirem outros na mesa
      const shouldNumber = qty > 1 || existingSameName.length > 0;

      const combatantName = shouldNumber
        ? `${baseName} #${nextNumber}`
        : baseName;

      const npcData = {
        armorClass: selectedNpc.armorClass,
        maxFocus: selectedNpc.maxFocus,
        currentFocus: selectedNpc.maxFocus, // Importante inicializar
        attributes: selectedNpc.attributes,
        equipment: selectedNpc.equipment,
        actions: selectedNpc.actions,
        stances: selectedNpc.stances,
        skills: selectedNpc.skills,
      };

      if (isConnected) {
        const npcPayload = {
          id: generateSafeId(combatantName), // ID único baseado no nome com número
          name: combatantName,
          hp: { current: selectedNpc.maxHp, max: selectedNpc.maxHp },
          initiative: init,
          type: "npc",
          ...npcData,
          turnActions: { standard: true, bonus: true, reaction: true },
        } as Combatant;

        sendMessage("GM_ADD_NPC", npcPayload);
      } else {
        addCombatant(combatantName, selectedNpc.maxHp, init, "npc", npcData);
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
