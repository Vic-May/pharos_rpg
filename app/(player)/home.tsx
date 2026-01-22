import { EditCharacterModal } from "@/components/modals/EditCharacterModal";
import { GoldModal } from "@/components/modals/GoldModal";
import { AttributeGrid } from "@/components/rpg/AttributeGrid";
import { DeathSaveMonitor } from "@/components/rpg/DeathSaveMonitor";
import { ResourceControl } from "@/components/rpg/ResourceControl";
import { ThemeColors } from "@/constants/theme";
import { useAlert } from "@/context/AlertContext";
import { useCharacter } from "@/context/CharacterContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const {
    character,
    updateStat,
    updateImage,
    updateSilver,
    performShortRest,
    performLongRest,
    updateDeathSave,
    importCharacter,
  } = useCharacter();

  const { colors } = useTheme(); // <--- Pegue as cores
  const { showAlert } = useAlert();

  // 3. Gerar Estilos baseados nas cores atuais
  const styles = useMemo(() => getStyles(colors), [colors]);

  // Estado para controlar a visibilidade do Modal de Edição
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [showOriginDetails, setShowOriginDetails] = useState(false);

  const [isMoneyModalVisible, setMoneyModalVisible] = useState(false);

  const handleExport = async () => {
    try {
      const dataStr = JSON.stringify(character);
      await Clipboard.setStringAsync(dataStr);
      showAlert(
        "Ficha Copiada!",
        "Os dados do personagem foram copiados para a área de transferência.\n\nAgora abra o aplicativo novo (Mestre) e use o botão de Importar.",
      );
    } catch (error) {
      showAlert("Erro", "Falha ao copiar dados para a área de transferência.");
    }
  };

  const openMoneyModal = () => {
    setMoneyModalVisible(true);
  };

  const handleShortRest = () => {
    showAlert(
      "Descanso Curto",
      "Deseja gastar algumas horas para descansar? Isso recuperará metade da sua Vida e Foco máximos.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: performShortRest },
      ],
    );
  };

  const handleLongRest = () => {
    showAlert(
      "Descanso Longo",
      "Deseja dormir uma noite completa? Isso recuperará TODA a sua Vida e Foco.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Dormir", onPress: performLongRest }, // style default (azul)
      ],
    );
  };

  // const handleReset = () => {
  //   showAlert(
  //     "Resetar Ficha",
  //     "Tem a certeza? Isto apagará todo o progresso e restaurará os dados iniciais do código.",
  //     [
  //       { text: "Cancelar", style: "cancel" },
  //       {
  //         text: "Sim, Resetar",
  //         style: "destructive",
  //         onPress: () => resetCharacter(), // <--- Chama a função
  //       },
  //     ]
  //   );
  // };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      showAlert(
        "Permissão necessária",
        "É necessário permitir o acesso à galeria para mudar a foto.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // Apenas imagens
      allowsEditing: true, // Permite recortar (crop)
      aspect: [1, 1], // Força formato quadrado
      quality: 0.5, // Qualidade média para não pesar no armazenamento
      base64: true, // Importante para salvar no AsyncStorage
    });

    if (!result.canceled && result.assets[0].base64) {
      // Salva a imagem como string base64 data URI
      const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      updateImage(imageUri);
    }
  };

  const handleImport = async () => {
    try {
      // 1. Lê o texto da memória
      const content = await Clipboard.getStringAsync();

      if (!content) {
        showAlert("Erro", "Área de transferência vazia.");
        return;
      }

      // 2. Tenta converter para JSON
      const parsedData = JSON.parse(content);

      // 3. Validação básica (vê se tem nome e status)
      if (!parsedData.name || !parsedData.stats) {
        showAlert(
          "Inválido",
          "O texto copiado não parece ser uma ficha de personagem válida.",
        );
        return;
      }

      // 4. Confirmação antes de sobrescrever
      showAlert(
        "Importar Ficha",
        `Deseja substituir o personagem atual por "${parsedData.name}"?\n\nIsso apagará os dados atuais deste app.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sim, Substituir",
            style: "destructive",
            onPress: () => {
              importCharacter(parsedData);
              // Opcional: Avisar sucesso
              // showAlert("Sucesso", "Personagem importado!");
            },
          },
        ],
      );
    } catch (error) {
      showAlert(
        "Erro",
        "Falha ao ler ou processar a ficha. O formato está correto?",
      );
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* --- HEADER --- */}
        <View style={styles.topBar}>
          <Text style={styles.screenTitle}>Ficha</Text>
          {/* Agrupamento dos 3 botões à direita */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {/* 1. Botão Importar (Download) */}
            <TouchableOpacity onPress={handleImport} style={styles.iconBtn}>
              <Ionicons
                name="download-outline"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>

            {/* 2. Botão Exportar (Share) */}
            <TouchableOpacity onPress={handleExport} style={styles.iconBtn}>
              <Ionicons
                name="share-social-outline"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>

            {/* 3. Botão Editar (Settings) */}
            <TouchableOpacity
              onPress={() => setEditModalVisible(true)}
              style={styles.iconBtn}
            >
              <Ionicons
                name="settings-sharp"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- AVATAR E INFO --- */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.8}
            style={styles.avatarContainer}
          >
            {character.image ? (
              <Image
                source={{ uri: character.image }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera" size={32} color={colors.iconDefault} />
                <Text style={styles.avatarText}>Foto</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.charName}>{character.name}</Text>
            <Text style={styles.subtext}>
              {character.class || "Sem Classe"} •{" "}
              {character.ancestry?.name || "Sem Origem"}
            </Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Nível {character.level}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- CARTEIRA --- */}
        <View style={styles.walletContainer}>
          <View style={styles.walletHeader}>
            <View style={styles.walletLabelBox}>
              <Ionicons name="cash-outline" size={20} color={colors.gold} />
              <Text style={styles.walletLabel}>Pratas</Text>
            </View>
            <TouchableOpacity onPress={openMoneyModal}>
              <Text style={styles.walletValue}>{character.silver || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- ANCESTRALIDADE & ORIGEM --- */}
        <TouchableOpacity
          style={styles.originCard}
          activeOpacity={0.9}
          onPress={() => {
            if (!character.ancestry || !character.culturalOrigin) {
              setEditModalVisible(true);
            } else {
              setShowOriginDetails(!showOriginDetails);
            }
          }}
          onLongPress={() => setEditModalVisible(true)}
        >
          <View style={styles.originHeader}>
            <View>
              <Text style={styles.originLabel}>Ancestralidade & Origem</Text>
              {character.ancestry && character.culturalOrigin ? (
                <Text style={styles.originValue}>
                  {character.ancestry.name} • {character.culturalOrigin.name}
                </Text>
              ) : (
                <Text
                  style={[
                    styles.originValue,
                    { color: colors.textSecondary, fontStyle: "italic" },
                  ]}
                >
                  Toque para definir sua origem
                </Text>
              )}
            </View>
            <Ionicons
              name={
                !character.ancestry
                  ? "create-outline"
                  : showOriginDetails
                    ? "chevron-up"
                    : "chevron-down"
              }
              size={20}
              color={
                !character.ancestry ? colors.primary : colors.textSecondary
              }
            />
          </View>

          {showOriginDetails &&
            character.ancestry &&
            character.culturalOrigin && (
              <View style={styles.originBody}>
                <View style={styles.traitRow}>
                  <Text style={styles.traitName}>
                    Trait: {character.ancestry.traitName}
                  </Text>
                  <Text style={styles.traitDesc}>
                    {character.ancestry.traitDescription}
                  </Text>
                </View>
                <View style={styles.traitRow}>
                  <Text style={styles.traitName}>
                    Cultura: {character.culturalOrigin.culturalTrait}
                  </Text>
                </View>
                <View style={styles.infoBlock}>
                  <Ionicons
                    name="gift-outline"
                    size={14}
                    color={colors.textSecondary}
                    style={{ marginTop: 2 }}
                  />
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: "bold" }}>Herança: </Text>
                    {character.culturalOrigin.heritage}
                  </Text>
                </View>
                <View style={styles.infoBlock}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={14}
                    color={colors.textSecondary}
                    style={{ marginTop: 2 }}
                  />
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: "bold" }}>Línguas: </Text>
                    {character.culturalOrigin.languages.join(", ")}
                  </Text>
                </View>
              </View>
            )}
        </TouchableOpacity>

        {/* --- RECURSOS (HP/FOCO) --- */}
        <ResourceControl
          label="Vida"
          current={character.stats.hp.current}
          max={character.stats.hp.max}
          color={colors.hp}
          onIncrement={() => updateStat("hp", 1)}
          onDecrement={() => updateStat("hp", -1)}
        />

        <ResourceControl
          label="Foco"
          current={character.stats.focus.current}
          max={character.stats.focus.max}
          color={colors.focus}
          onIncrement={() => updateStat("focus", 1)}
          onDecrement={() => updateStat("focus", -1)}
        />

        {/* --- SEÇÃO DE DEATH SAVES (CONDICIONAL) --- */}

        <DeathSaveMonitor
          hp={character.stats.hp.current}
          successes={character.deathSaves.successes}
          failures={character.deathSaves.failures}
          onUpdate={updateDeathSave}
        />

        <View style={styles.divider} />

        {/* --- ATRIBUTOS --- */}
        <AttributeGrid attributes={character.attributes} />

        {/* --- BOTÃO RESET --- */}
        {/* <View style={styles.debugSection}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>⚠ Resetar Ficha (Debug)</Text>
          </TouchableOpacity>
        </View> */}

        <View style={styles.divider} />

        {/* --- DESCANSO --- */}
        <Text style={styles.sectionLabel}>Recuperação</Text>
        <View style={styles.restContainer}>
          <TouchableOpacity
            style={styles.restButtonShort}
            onPress={handleShortRest}
          >
            <View style={styles.iconCircleShort}>
              <Ionicons name="cafe" size={20} color="#f57c00" />
            </View>
            <View>
              <Text style={styles.restTitle}>Descanso Curto</Text>
              <Text style={styles.restDesc}>Recupera 50%</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restButtonLong}
            onPress={handleLongRest}
          >
            <View style={styles.iconCircleLong}>
              <Ionicons name="moon" size={20} color="#5e35b1" />
            </View>
            <View>
              <Text style={styles.restTitle}>Descanso Longo</Text>
              <Text style={styles.restDesc}>Recupera Tudo</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* --- MODAL DINHEIRO --- */}
      <GoldModal
        visible={isMoneyModalVisible}
        onClose={() => setMoneyModalVisible(false)}
        currentSilver={character.silver || 0}
        onSave={(newVal) => updateSilver(newVal)}
      />

      {/* --- MODAL EDIÇÃO (AGORA COM NÍVEL) --- */}
      <EditCharacterModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
      />
    </View>
  );
}

// --- GERADOR DE ESTILOS DINÂMICO ---
const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    content: { padding: 16 },

    // Top Bar
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    screenTitle: { fontSize: 28, fontWeight: "bold", color: colors.text },
    iconBtn: { padding: 8 },

    // Header
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      gap: 16,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.border,
    },
    avatarImage: { width: "100%", height: "100%", borderRadius: 40 },
    avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
    avatarText: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
    editBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.surface,
    },

    headerText: { flex: 1 },
    charName: { fontSize: 24, fontWeight: "bold", color: colors.text },
    subtext: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
    levelBadge: {
      marginTop: 6,
      backgroundColor: colors.text,
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    levelText: {
      color: colors.background,
      fontSize: 10,
      fontWeight: "bold",
      textTransform: "uppercase",
    },

    divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },

    // Carteira (Mantive as cores originais mas adaptei o texto e fundo)
    walletContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.gold,
    },
    walletHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    walletLabelBox: { flexDirection: "row", alignItems: "center", gap: 8 },
    walletLabel: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.gold,
      textTransform: "uppercase",
    },
    walletValue: { fontSize: 28, fontWeight: "bold", color: colors.text },

    // Origin Card
    originCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 16,
    },
    originHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    originLabel: {
      fontSize: 10,
      textTransform: "uppercase",
      color: colors.textSecondary,
      fontWeight: "bold",
    },
    originValue: { fontSize: 16, fontWeight: "bold", color: colors.text },
    originBody: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    traitRow: { marginBottom: 8 },
    traitName: { fontSize: 14, fontWeight: "bold", color: colors.text },
    traitDesc: { fontSize: 13, color: colors.textSecondary },
    infoBlock: { flexDirection: "row", gap: 6, marginBottom: 4 },
    infoText: { fontSize: 13, color: colors.textSecondary, flex: 1 },

    // Resources
    resourceContainer: { marginBottom: 16 },
    resourceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    resourceLabel: { fontWeight: "600", color: colors.text },
    resourceValues: { color: colors.textSecondary },
    barBackground: {
      height: 12,
      backgroundColor: colors.border,
      borderRadius: 6,
      overflow: "hidden",
      marginBottom: 8,
    },
    barFill: { height: "100%" },
    buttonsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
    btn: {
      width: 40,
      height: 30,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Debug
    debugSection: { marginTop: 20, alignItems: "center", marginBottom: 20 },
    resetButton: {
      backgroundColor: colors.error + "20",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.error,
    },
    resetText: { color: colors.error, fontWeight: "bold" },

    // Rest
    sectionLabel: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.textSecondary,
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    restContainer: { flexDirection: "row", gap: 12 },
    // Cards de descanso mantidos com cor fixa para identidade visual, mas texto adaptado
    restButtonShort: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff3e0",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#ffe0b2",
    },
    restButtonLong: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ede7f6",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#d1c4e9",
    },
    iconCircleShort: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#fff",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    iconCircleLong: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#fff",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    restTitle: { fontSize: 14, fontWeight: "bold", color: "#333" }, // Fixo para contraste com o fundo claro
    restDesc: { fontSize: 10, color: "#666", marginTop: 2 }, // Fixo

    // Modais
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    smallModal: {
      backgroundColor: colors.surface,
      width: "80%",
      borderRadius: 12,
      padding: 20,
      elevation: 5,
    },
    smallModalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
      textAlign: "center",
      color: colors.text,
    },
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
      backgroundColor: colors.gold,
    },
    cancelText: { color: colors.textSecondary, fontWeight: "bold" },
    saveText: { color: "#fff", fontWeight: "bold" },

    // Edit Modal Full
    modalContainer: { flex: 1, backgroundColor: colors.background },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      padding: 20,
      borderBottomWidth: 1,
      marginTop: 20,
      borderBottomColor: colors.border,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
    closeText: { color: colors.primary, fontSize: 16, fontWeight: "600" },
    modalContent: { padding: 20, paddingBottom: 50 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 12,
      color: colors.textSecondary,
      textTransform: "uppercase",
    },

    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, color: colors.textSecondary, marginBottom: 6 },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.inputBg,
      color: colors.text,
    },

    // Chips
    classSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    classChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    classChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    classChipDisabled: { backgroundColor: colors.inputBg, opacity: 0.5 },
    classChipText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    classChipTextActive: { color: "#fff", fontWeight: "bold" },
    classChipTextDisabled: {
      textDecorationLine: "line-through",
      color: colors.error,
    },

    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 4,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primary },
    chipText: { color: colors.textSecondary, fontWeight: "500" },
    chipTextActive: { color: "#fff" },
    helperText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 16,
      fontStyle: "italic",
    },

    listSelector: { gap: 8 },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    listItemActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "10",
    }, // Tint leve
    listItemTitle: { fontWeight: "bold", fontSize: 14, color: colors.text },
    listItemTitleActive: { color: colors.primary },
    listItemDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

    // Attr Editor
    attributesEditor: {
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      padding: 10,
    },
    attrEditRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    attrEditLabel: {
      fontSize: 16,
      fontWeight: "500",
      width: 100,
      color: colors.text,
    },
    stepper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepBtn: { padding: 10 },
    attrEditValue: {
      fontSize: 18,
      fontWeight: "bold",
      width: 40,
      textAlign: "center",
      color: colors.text,
    },
    modPreview: {
      width: 60,
      textAlign: "right",
      color: colors.textSecondary,
      fontSize: 14,
    },
    row: { flexDirection: "row" },
    // Quick Adjust (Novos Estilos)
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
  });
