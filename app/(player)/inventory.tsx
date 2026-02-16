import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Imports de Contexto e Tipos
import { EquipSlot } from "@/components/rpg/EquipSlot";
import { AvatarPortrait } from "@/components/ui/AvatarPortrait";
import { StatBar } from "@/components/ui/StatBar";
import { ThemedModal } from "@/components/ui/ThemedModal";
import { useAlert } from "@/context/AlertContext";
import { useCharacter } from "@/context/CharacterContext";
import { useTheme } from "@/context/ThemeContext";
import { EquipmentItem, Item, ItemType } from "@/types/rpg";
import * as ImagePicker from "expo-image-picker";

// Adicionado 'shield' ao tipo
type EquipSlotType = "meleeWeapon" | "rangedWeapon" | "armor" | "shield";

export default function InventoryScreen() {
  const {
    character,
    updateEquipment,
    addItem,
    removeItem,
    updateItemQuantity,
    updateItem,
    getLoadMetrics,
  } = useCharacter();

  // --- TEMA ---
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { showAlert } = useAlert();
  const { currentLoad, maxLoad, isOverloaded } = getLoadMetrics();

  // --- ESTADOS ---
  const [equipModalVisible, setEquipModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<EquipSlotType | null>(null);

  // Estados do formulário de equipamento
  const [editName, setEditName] = useState("");
  const [editStats, setEditStats] = useState("");
  const [editDefense, setEditDefense] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImage, setEditImage] = useState("");

  // Estados de Item da Mochila
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [itemActionModalVisible, setItemActionModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [editItemModalVisible, setEditItemModalVisible] = useState(false);
  const [targetItemName, setTargetItemName] = useState("");
  const [targetItemQty, setTargetItemQty] = useState("");
  const [targetItemType, setTargetItemType] = useState<ItemType>("consumable");

  const [editWeight, setEditWeight] = useState("0");
  const [targetItemWeight, setTargetItemWeight] = useState("0");

  const handleEditItemPress = () => {
    if (!selectedItem) return;
    setTargetItemName(selectedItem.name);
    setTargetItemQty(String(selectedItem.quantity));
    setTargetItemType(selectedItem.type);
    setTargetItemWeight(String(selectedItem.weight || 0));

    setItemActionModalVisible(false);
    setEditItemModalVisible(true);
  };

  // Salva a edição do item da mochila
  const handleSaveItemEdit = () => {
    if (!selectedItem || !targetItemName.trim()) return;

    updateItem(selectedItem.id, {
      name: targetItemName,
      quantity: parseInt(targetItemQty) || 1,
      type: targetItemType,
      weight: parseFloat(targetItemWeight) || 0,
    });

    setEditItemModalVisible(false);
  };

  // --- HANDLERS EQUIPAMENTO ---
  const handleEditSlot = (slot: EquipSlotType, item: EquipmentItem) => {
    setSelectedSlot(slot);
    setEditName(item.name);
    setEditStats(item.stats);
    setEditDefense(item.defense ? String(item.defense) : "0");
    setEditWeight(item.weight ? String(item.weight) : "0");
    setEditDesc(item.description || "");
    setEquipModalVisible(true);
    setEditImage(item.image || "");
  };

  const saveEquipment = () => {
    if (selectedSlot) {
      const newItem: EquipmentItem = {
        name: editName,
        stats: editStats,
        defense: parseInt(editDefense) || 0,
        description: editDesc,
        weight: parseFloat(editWeight) || 0,
        image: editImage.trim() || undefined,
      };
      updateEquipment(selectedSlot, newItem);
      setEquipModalVisible(false);
    }
  };

  // --- HANDLERS MOCHILA ---
  const handleAddItem = () => {
    // 1. Usar targetItemName (que é o que o Input atualiza)

    if (!targetItemName.trim()) return;

    const qty = parseInt(targetItemQty) || 1;
    const weight = parseFloat(targetItemWeight) || 0;

    // 2. Passar as variáveis target para a função addItem
    addItem(targetItemName, targetItemType, qty, weight);

    // 3. Fechar o modal (O reset dos campos já é feito quando você clica no botão "+" via handleOpenAddItem)
    setAddItemModalVisible(false);
  };

  const handleItemPress = (item: Item) => {
    setSelectedItem(item);
    setItemActionModalVisible(true);
  };

  const handleConsumeItem = () => {
    if (selectedItem) {
      updateItemQuantity(selectedItem.id, -1);
      showAlert("Item Usado", `Você usou 1x ${selectedItem.name}.`);
      setItemActionModalVisible(false);
    }
  };

  const handleDiscardItem = () => {
    if (selectedItem) {
      showAlert("Descartar", `Jogar fora ${selectedItem.name}?`, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Jogar Fora",
          style: "destructive",
          onPress: () => {
            removeItem(selectedItem.id);
            setItemActionModalVisible(false);
          },
        },
      ]);
    }
  };

  const handleOpenAddItem = () => {
    // 1. Limpa os campos do formulário compartilhado
    setTargetItemName("");
    setTargetItemQty("1");
    setTargetItemType("consumable"); // Valor padrão
    setTargetItemWeight("0");

    // 2. Abre o modal no modo "Adicionar"
    setAddItemModalVisible(true);
  };

  // Helper de Tags da Mochila (Agora usa as cores do tema)
  const getBadgeInfo = (type: ItemType) => {
    switch (type) {
      case "consumable":
        return {
          label: "Consumível",
          bg: colors.success + "20",
          text: colors.success,
        }; // Verde Transparente
      case "key":
        return {
          label: "Item Chave",
          bg: colors.warning + "20",
          text: colors.warning,
        }; // Laranja Transparente
      case "equipment":
        return {
          label: "Equipamento",
          bg: colors.primary + "20",
          text: colors.primary,
        }; // Roxo Transparente
      default:
        return { label: "Item", bg: colors.border, text: colors.text };
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      showAlert(
        "Permissão necessária",
        "É necessário permitir o acesso à galeria para mudar a imagem do item.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true, // Permite recortar a espada/escudo
      aspect: [1, 1], // Quadrado (para caber bonitinho no slot)
      quality: 0.5, // Comprime para não pesar no AsyncStorage
      base64: true, // Fundamental!
    });

    if (!result.canceled && result.assets[0].base64) {
      const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setEditImage(imageUri);
    }
  };

  const renderItem = ({ item }: { item: Item }) => {
    const badge = getBadgeInfo(item.type);
    return (
      <TouchableOpacity
        style={styles.itemRow}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.itemMain}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>
                {badge.label}
              </Text>
            </View>
            {/* Badge de Peso */}
            {item.weight > 0 && (
              <View style={styles.weightBadge}>
                <Ionicons
                  name="scale-outline"
                  size={10}
                  color={colors.textSecondary}
                />
                <Text style={styles.weightText}>
                  {item.weight * item.quantity}kg
                </Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.itemQty}>x{item.quantity}</Text>
      </TouchableOpacity>
    );
  };

  const isDefenseSlot = selectedSlot === "armor" || selectedSlot === "shield";

  return (
    <View style={styles.container}>
      <View style={styles.loadContainer}>
        <View style={styles.loadHeader}>
          <Text style={styles.loadLabel}>
            Carga Total {isOverloaded && "(SOBRECARGA)"}
          </Text>
          <Text
            style={[styles.loadValue, isOverloaded && { color: colors.error }]}
          >
            {currentLoad} / {maxLoad} kg
          </Text>
        </View>
        <StatBar
          current={currentLoad}
          max={maxLoad}
          color={isOverloaded ? colors.error : colors.primary}
          backgroundColor={colors.border}
        />
      </View>

      <View style={styles.equipSection}>
        <Text style={styles.sectionTitle}>Equipamento Atual</Text>
        <View style={styles.equipRow}>
          <EquipSlot
            label="Curto Alcance"
            item={character.equipment.meleeWeapon}
            icon="cut"
            type="weapon"
            onPress={() =>
              handleEditSlot("meleeWeapon", character.equipment.meleeWeapon)
            }
          />
          <EquipSlot
            label="Longo Alcance"
            item={character.equipment.rangedWeapon}
            icon="locate"
            type="weapon"
            onPress={() =>
              handleEditSlot("rangedWeapon", character.equipment.rangedWeapon)
            }
          />
        </View>
        <View style={styles.equipRow}>
          <EquipSlot
            label="Armadura"
            item={character.equipment.armor}
            icon="shirt"
            type="defense"
            onPress={() => handleEditSlot("armor", character.equipment.armor)}
          />
          <EquipSlot
            label="Escudo"
            item={character.equipment.shield}
            icon="shield"
            type="defense"
            onPress={() => handleEditSlot("shield", character.equipment.shield)}
          />
        </View>
      </View>

      {/* Seção Scrollável: Mochila */}
      <View style={styles.backpackSection}>
        <View style={styles.backpackHeader}>
          <Text style={styles.sectionHeader}>Mochila </Text>
          <TouchableOpacity onPress={() => handleOpenAddItem()}>
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={character.backpack}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Mochila vazia.</Text>
          }
        />
      </View>

      {/* --- MODAL 1: EDITAR EQUIPAMENTO --- */}
      <ThemedModal
        visible={equipModalVisible}
        onClose={() => setEquipModalVisible(false)}
        title="Editar Slot"
      >
        <ScrollView style={{ padding: 20 }}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome do Item</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {isDefenseSlot ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bônus de Defesa (CA)</Text>
                <View style={styles.rowCenter}>
                  <Text style={styles.prefix}>+</Text>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={editDefense}
                    onChangeText={setEditDefense}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descrição</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  value={editDesc}
                  onChangeText={setEditDesc}
                  multiline
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dano (ex: 1d6 + 2)</Text>
              <TextInput
                style={styles.input}
                value={editStats}
                onChangeText={setEditStats}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={editWeight}
              onChangeText={setEditWeight}
              placeholder="0.0"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* NOVO BLOCO DE IMAGEM */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Imagem do Equipamento</Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              {/* Preview da Imagem ou Placeholder */}
              <View style={styles.itemImagePreview}>
                {editImage ? (
                  <AvatarPortrait imageUrl={editImage} size={60} /> // Usando o AvatarPortrait para exibir
                ) : (
                  <View
                    style={[
                      styles.iconPlaceholder,
                      { backgroundColor: colors.inputBg },
                    ]}
                  >
                    <Ionicons
                      name="image-outline"
                      size={24}
                      color={colors.textSecondary}
                    />
                  </View>
                )}
              </View>

              {/* Botões de Ação */}
              <View style={{ flex: 1, gap: 8 }}>
                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={pickImage}
                >
                  <Ionicons name="camera" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>Escolher Imagem</Text>
                </TouchableOpacity>

                {editImage ? (
                  <TouchableOpacity
                    style={[
                      styles.actionBtnDestructive,
                      { padding: 8, marginBottom: 0 },
                    ]}
                    onPress={() => setEditImage("")}
                  >
                    <Text style={[styles.actionBtnText, { fontSize: 12 }]}>
                      Remover Imagem
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={() => setEquipModalVisible(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveEquipment} style={styles.saveBtn}>
              <Text style={styles.saveText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedModal>

      {/* --- MODAL 2 e 4: ADICIONAR/EDITAR ITEM (Reutiliza lógica visual) --- */}
      <ThemedModal
        visible={addItemModalVisible || editItemModalVisible}
        onClose={() => {
          setAddItemModalVisible(false);
          setEditItemModalVisible(false);
        }}
        title={addItemModalVisible ? "Novo Item" : "Editar Item"}
      >
        <ScrollView style={{ padding: 20 }}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              style={styles.input}
              value={targetItemName}
              onChangeText={setTargetItemName}
              placeholder="Ex: Poção"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quantidade</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={targetItemQty}
              onChangeText={setTargetItemQty}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <Text style={styles.inputLabel}>Tipo</Text>
          <View style={styles.typeSelector}>
            {(["consumable", "equipment", "key"] as ItemType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeChip,
                  targetItemType === t && styles.typeChipActive,
                ]}
                onPress={() => setTargetItemType(t)}
              >
                <Text
                  style={[
                    styles.typeText,
                    targetItemType === t && styles.typeTextActive,
                  ]}
                >
                  {t === "consumable"
                    ? "Consumível"
                    : t === "equipment"
                      ? "Equip"
                      : "Chave"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Peso Unitário (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={targetItemWeight}
              onChangeText={setTargetItemWeight}
              placeholder="0.0"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={() => {
                setAddItemModalVisible(false);
                setEditItemModalVisible(false);
              }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addItemModalVisible ? handleAddItem : handleSaveItemEdit}
              style={styles.saveBtn}
            >
              <Text style={styles.saveText}>
                {addItemModalVisible ? "Adicionar" : "Salvar"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedModal>

      {/* --- MODAL 3: AÇÕES DO ITEM --- */}
      <ThemedModal
        visible={itemActionModalVisible}
        onClose={() => setItemActionModalVisible(false)}
        title={selectedItem?.name || "Item"}
      >
        <View style={{ padding: 20 }}>
          <Text style={styles.itemDesc}>
            Quantidade atual: {selectedItem?.quantity}
          </Text>

          {selectedItem?.type === "consumable" && (
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={handleConsumeItem}
            >
              <Ionicons name="beaker" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Usar Item (-1)</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.actionBtnPrimary,
              { backgroundColor: colors.primary },
            ]}
            onPress={handleEditItemPress}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Editar Detalhes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnDestructive}
            onPress={handleDiscardItem}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Jogar Fora (Tudo)</Text>
          </TouchableOpacity>
        </View>
      </ThemedModal>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    equipSection: {
      backgroundColor: colors.surface,
      padding: 16,
      elevation: 2,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 12,
      color: colors.text,
    },
    equipRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
    backpackSection: { flex: 1, backgroundColor: colors.surface },
    backpackHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingRight: 16,
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: "bold",
      marginLeft: 16,
      marginBottom: 8,
      marginTop: 8,
      color: colors.text,
    },
    listContent: { padding: 16 },
    emptyText: {
      textAlign: "center",
      color: colors.textSecondary,
      marginTop: 20,
      fontStyle: "italic",
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemMain: { flexDirection: "column", gap: 4, alignItems: "flex-start" },
    itemName: { fontSize: 16, fontWeight: "500", color: colors.text },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: "flex-start",
    },
    badgeText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
    itemQty: { fontSize: 16, fontWeight: "bold", color: colors.textSecondary },
    separator: { height: 1, backgroundColor: colors.border },
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 6 },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.inputBg,
      color: colors.text,
    },
    rowCenter: { flexDirection: "row", alignItems: "center" },
    prefix: {
      fontSize: 18,
      fontWeight: "bold",
      marginRight: 8,
      color: colors.text,
    },
    modalButtons: { flexDirection: "row", gap: 10, marginTop: 10 },
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
      backgroundColor: colors.primary,
    },
    cancelText: { color: colors.textSecondary, fontWeight: "bold" },
    saveText: { color: "#fff", fontWeight: "bold" },
    typeSelector: { flexDirection: "row", gap: 8, marginBottom: 20 },
    typeChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    typeChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    typeText: { fontSize: 12, color: colors.textSecondary },
    typeTextActive: { color: "#fff", fontWeight: "bold" },
    itemDesc: {
      textAlign: "center",
      marginBottom: 20,
      color: colors.textSecondary,
    },
    actionBtnPrimary: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.success,
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      gap: 8,
    },
    actionBtnDestructive: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.error,
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      gap: 8,
    },
    actionBtnText: { color: "#fff", fontWeight: "bold" },
    loadContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      backgroundColor: colors.surface,
      marginBottom: 8,
    },
    loadHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    loadLabel: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.textSecondary,
      textTransform: "uppercase",
    },
    loadValue: { fontSize: 12, fontWeight: "bold", color: colors.text },
    weightBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      paddingHorizontal: 6,
      borderRadius: 4,
      gap: 2,
    },
    weightText: { fontSize: 10, color: colors.textSecondary },
    itemImagePreview: {
      width: 60,
      height: 60,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    iconPlaceholder: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
  });
