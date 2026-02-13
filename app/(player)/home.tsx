import { EditCharacterModal } from "@/components/modals/EditCharacterModal";
import { FeatsModal } from "@/components/modals/FeatsModal";
import { GoldModal } from "@/components/modals/GoldModal";
import { SpecializationModal } from "@/components/modals/SpecializationModal";
import { AttributeGrid } from "@/components/rpg/AttributeGrid";
import { DeathSaveMonitor } from "@/components/rpg/DeathSaveMonitor";
import { ResourceControl } from "@/components/rpg/ResourceControl";
import { AvatarPortrait } from "@/components/ui/AvatarPortrait";
import { ThemeColors } from "@/constants/theme";
import { useAlert } from "@/context/AlertContext";
import { useCharacter } from "@/context/CharacterContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [showOriginDetails, setShowOriginDetails] = useState(false);
  const [specModalVisible, setSpecModalVisible] = useState(false);
  const [featsModalVisible, setFeatsModalVisible] = useState(false);
  const [isMoneyModalVisible, setMoneyModalVisible] = useState(false);

  // Estados da Imagem por URL
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");

  const canSpecialize =
    (character.level || 1) >= 5 && !character.specialization;

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

  const openMoneyModal = () => setMoneyModalVisible(true);

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
        { text: "Dormir", onPress: performLongRest },
      ],
    );
  };

  const handleSaveImage = () => {
    const url = tempImageUrl.trim();
    if (url && !url.startsWith("http")) {
      showAlert(
        "URL Inválida",
        "O link da imagem precisa começar com http ou https.",
      );
      return;
    }
    updateImage(url);
    setImageModalVisible(false);
  };

  const handleImport = async () => {
    try {
      const content = await Clipboard.getStringAsync();

      if (!content) {
        showAlert("Erro", "Área de transferência vazia.");
        return;
      }

      const parsedData = JSON.parse(content);

      if (!parsedData.name || !parsedData.stats) {
        showAlert(
          "Inválido",
          "O texto copiado não parece ser uma ficha de personagem válida.",
        );
        return;
      }

      showAlert(
        "Importar Ficha",
        `Deseja substituir o personagem atual por "${parsedData.name}"?\n\nIsso apagará os dados atuais deste app.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sim, Substituir",
            style: "destructive",
            onPress: () => importCharacter(parsedData),
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

  const handleOfflineDeathSave = (manualRoll?: number) => {
    let d20: number;

    if (manualRoll !== undefined) {
      if (isNaN(manualRoll) || manualRoll < 1 || manualRoll > 20) {
        showAlert("Valor Inválido", "Insira um valor entre 1 e 20.");
        return;
      }
      d20 = manualRoll;
    } else {
      d20 = Math.floor(Math.random() * 20) + 1;
    }

    const currentSuccesses = character.deathSaves.successes;
    const currentFailures = character.deathSaves.failures;

    let newSuccesses = currentSuccesses;
    let newFailures = currentFailures;
    let hpUpdate = 0;
    let died = false;
    let resultText = "";

    if (d20 === 20) {
      hpUpdate = 1;
      newSuccesses = 0;
      newFailures = 0;
      resultText = "20 NATURAL! Você renasce com 1 PV!";
    } else if (d20 === 1) {
      newFailures += 2;
      resultText = "FALHA CRÍTICA! (2 Falhas)";
    } else if (d20 >= 10) {
      newSuccesses += 1;
      resultText = "SUCESSO.";
    } else {
      newFailures += 1;
      resultText = "FALHA.";
    }

    if (newSuccesses >= 3 && hpUpdate === 0) {
      newSuccesses = 0;
      newFailures = 0;
      hpUpdate = 1;
      resultText += "\n\nESTABILIZOU! (Você acorda com 1 PV)";
    } else if (newFailures >= 3) {
      died = true;
      resultText += "\n\nSEU PERSONAGEM MORREU.";
    }

    // Aplica no Contexto
    if (hpUpdate > 0) {
      updateStat("hp", hpUpdate - character.stats.hp.current); // Ajusta para ficar com 1
      updateDeathSave("success", 0);
      updateDeathSave("failure", 0);
    } else {
      updateDeathSave("success", Math.min(3, newSuccesses));
      updateDeathSave("failure", Math.min(3, newFailures));
    }

    // Se estiver usando o controle de turnActions local, marca a padrão como gasta (opcional)
    showAlert(
      hpUpdate > 0 ? "Salvo!" : died ? "Morte" : "Teste de Morte",
      `Rolagem: ${d20}\n${resultText}`,
    );

    // No offline você pode querer terminar o turno automaticamente, ou apenas deixar o jogador clicar no botão
    // endTurn();
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
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity onPress={handleImport} style={styles.iconBtn}>
              <Ionicons
                name="download-outline"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleExport} style={styles.iconBtn}>
              <Ionicons
                name="share-social-outline"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>

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
            onPress={() => {
              setTempImageUrl(character.image || "");
              setImageModalVisible(true);
            }}
            activeOpacity={0.8}
            style={styles.avatarContainer}
          >
            {character.image ? (
              <AvatarPortrait imageUrl={character.image} size={80} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera" size={32} color={colors.iconDefault} />
                <Text style={styles.avatarText}>Foto</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="link" size={12} color="#fff" />
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

        {/* SEÇÃO DE PROGRESSÃO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progressão</Text>

          <TouchableOpacity
            style={[
              styles.progressionBtn,
              !canSpecialize && character.specialization && styles.btnCompleted,
              !canSpecialize && !character.specialization && styles.btnLocked,
            ]}
            onPress={() => setSpecModalVisible(true)}
            disabled={!canSpecialize && !character.specialization}
          >
            <View>
              <Text style={styles.btnTitle}>Especialização</Text>
              <Text style={styles.btnSub}>
                {character.specialization
                  ? character.specialization.name
                  : canSpecialize
                    ? "Toque para escolher"
                    : "Bloqueado (Nível 5)"}
              </Text>
            </View>
            <Ionicons
              name={
                character.specialization
                  ? "checkmark-circle"
                  : !canSpecialize
                    ? "lock-closed"
                    : "arrow-forward"
              }
              size={24}
              color={
                !canSpecialize && !character.specialization
                  ? colors.textSecondary
                  : colors.text
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.progressionBtn}
            onPress={() => setFeatsModalVisible(true)}
          >
            <View>
              <Text style={styles.btnTitle}>Façanhas</Text>
              <Text style={styles.btnSub}>
                {character.feats?.length || 0} desbloqueadas
              </Text>
            </View>
            <Ionicons name="trophy-outline" size={24} color={colors.text} />
          </TouchableOpacity>
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

        {character.stats.hp.current <= 0 && (
          <DeathSaveMonitor
            successes={character.deathSaves.successes}
            failures={character.deathSaves.failures}
            onUpdateSave={(type, val) => {
              // Quando o jogador clica manualmente nas bolinhas pela Home
              // Você já deve ter uma função no context que seta diretamente.
              updateDeathSave(type, val);
            }}
            onRoll={handleOfflineDeathSave}
            onEndTurn={() => null} // Na ficha, não tem botão de encerrar turno
          />
        )}

        <View style={styles.divider} />

        {/* --- ATRIBUTOS --- */}
        <AttributeGrid attributes={character.attributes} />

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

      {/* --- MODAIS COMPARTILHADOS --- */}
      <GoldModal
        visible={isMoneyModalVisible}
        onClose={() => setMoneyModalVisible(false)}
        currentSilver={character.silver || 0}
        onSave={(newVal) => updateSilver(newVal)}
      />

      <EditCharacterModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
      />

      <SpecializationModal
        visible={specModalVisible}
        onClose={() => setSpecModalVisible(false)}
      />

      <FeatsModal
        visible={featsModalVisible}
        onClose={() => setFeatsModalVisible(false)}
      />

      {/* --- MODAL DA IMAGEM (URL) --- */}
      <Modal
        visible={isImageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModal}>
            <Text style={styles.smallModalTitle}>Link do Avatar</Text>

            <Text
              style={[styles.label, { textAlign: "center", marginBottom: 12 }]}
            >
              Cole o link direto da imagem (Imgur, Pinterest, etc).
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="link"
                size={20}
                color={colors.textSecondary}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={[
                  styles.input,
                  { flex: 1, borderWidth: 0, paddingHorizontal: 0 },
                ]}
                value={tempImageUrl}
                onChangeText={setTempImageUrl}
                placeholder="https://exemplo.com/foto.jpg"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setImageModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveImage}
              >
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- GERADOR DE ESTILOS DINÂMICO (LIMPO E OTIMIZADO) ---
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

    // Header e Avatar
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

    // Globais
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
    section: {},
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 12,
      color: colors.textSecondary,
      textTransform: "uppercase",
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.textSecondary,
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 1,
    },

    // Carteira
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

    // Progressão
    progressionBtn: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    btnCompleted: {
      backgroundColor: colors.inputBg,
      borderColor: colors.success,
    },
    btnLocked: {
      backgroundColor: colors.inputBg,
      opacity: 0.6,
      borderColor: colors.border,
    },
    btnTitle: { fontSize: 16, fontWeight: "bold", color: colors.text },
    btnSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

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

    // Descanso
    restContainer: { flexDirection: "row", gap: 12 },
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
    restTitle: { fontSize: 14, fontWeight: "bold", color: "#333" },
    restDesc: { fontSize: 10, color: "#666", marginTop: 2 },

    // Modais (Inputs URL, etc)
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
      backgroundColor: colors.primary,
    },
    cancelText: { color: colors.textSecondary, fontWeight: "bold" },
    saveText: { color: "#fff", fontWeight: "bold" },
  });
