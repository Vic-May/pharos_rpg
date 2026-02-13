import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Contextos e Utilidades
import { useAlert } from "@/context/AlertContext";
import { useCampaign } from "@/context/CampaignContext";
import { useCharacter } from "@/context/CharacterContext";
import { useTheme } from "@/context/ThemeContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { generateSafeId } from "@/utils/stringUtils";

// Componentes Refatorados
import { ActiveTurnInterface } from "@/components/session/ActiveTurnInterface"; // Sua interface de turno
import { CombatNotification } from "@/components/session/CombatNotification";
import { ConnectionForm } from "@/components/session/ConnectionForm"; // O novo componente
import { ReactionOverlay } from "@/components/session/ReactionOverlay"; // Sua barra de reação
import { SpectatorCard } from "@/components/session/SpectatorCard"; // O novo componente

export default function SessionCombatScreen() {
  const { combatants, activeTurnId, logs, lastEvent } = useCampaign();
  const { character } = useCharacter();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { showAlert } = useAlert();

  const { joinSession, disconnect, isConnected } = useWebSocket();

  // Estado local para o modal de Iniciativa (apenas quando entra)
  const [initValue, setInitValue] = useState("");
  const [showInitModal, setShowInitModal] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  // Guardar temporariamente os dados de conexão para usar após rolar iniciativa
  const [tempConnection, setTempConnection] = useState<{
    ip: string;
    code: string;
  } | null>(null);

  const [notification, setNotification] = useState<{
    visible: boolean;
    type: "damage" | "heal" | "info"; // <--- Adicionado
    source: string;
    skill: string;
    value: number;
  }>({ visible: false, type: "damage", source: "", skill: "", value: 0 });

  // ID Seguro para comparação
  const mySafeId = generateSafeId(character.name);

  // Verifica quem está agindo
  const currentActor = combatants.find((c) => c.id === activeTurnId);
  const isMyTurn = currentActor ? currentActor.id === mySafeId : false;

  // Pega os dados sincronizados
  const myCombatantData = combatants.find((c) => c.id === mySafeId) || {
    ...character,
    id: mySafeId,
    // Garante que tenha os campos mínimos se não estiver sincronizado ainda
    hp: character.stats.hp,
    currentFocus: character.stats.focus.current,
    maxFocus: character.stats.focus.max,
    turnActions: { standard: true, bonus: true, reaction: true },
    armorClass: 10, // Valor padrão seguro
    baseArmorClass: 10,
    skills: [],
    spells: [],
  };

  // --- HANDLERS ---

  const handleConnectRequest = (ip: string, code: string) => {
    if (!ip || !code) {
      showAlert("Atenção", "Preencha IP e Código da Sala.");
      return;
    }

    // Verifica se já está no combate (Reconexão rápida)
    const alreadyInCombat = combatants.find((c) => c.id === mySafeId);

    if (alreadyInCombat) {
      joinSession(ip, code, alreadyInCombat.initiative);
    } else {
      // Se é novo, precisa rolar iniciativa
      setTempConnection({ ip, code });
      setInitValue("");
      setShowInitModal(true);
    }
  };

  const handleForceReconnect = (ip: string, code: string) => {
    // Tenta reconectar sem iniciativa (o servidor deve tratar ou ignorar)
    if (ip && code) joinSession(ip, code, -1);
  };

  const rollInitiative = () => {
    setIsRolling(true);
    setTimeout(() => {
      const d20 = Math.floor(Math.random() * 20) + 1;
      const dexMod = character.attributes["Destreza"]?.modifier || 0;
      setInitValue(String(d20 + dexMod));
      setIsRolling(false);
    }, 500);
  };

  const confirmJoin = () => {
    const finalInit = parseInt(initValue);
    if (isNaN(finalInit)) {
      showAlert("Erro", "Iniciativa inválida.");
      return;
    }

    if (tempConnection) {
      joinSession(tempConnection.ip, tempConnection.code, finalInit);
      setShowInitModal(false);
      setTempConnection(null);
    }
  };

  useEffect(() => {
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      // Verifica a string exata que você colocou no Python
      if (lastLog.includes("O Mestre encerrou o combate")) {
        setShowVictoryModal(true);
      }
    }
  }, [logs]);

  useEffect(() => {
    if (!lastEvent) return;

    // Verifica se o alvo sou eu
    if (lastEvent.target_id === mySafeId) {
      // Se for Dano OU Cura
      if (lastEvent.type === "damage" || lastEvent.type === "heal") {
        setNotification({
          visible: true,
          type: lastEvent.type, // Passa "damage" ou "heal" direto do backend
          source: lastEvent.attacker_name || "Origem desconhecida",
          skill: lastEvent.skill_name || "Ação",
          value: lastEvent.value || 0,
        });
      }
    }
  }, [lastEvent?.id, mySafeId]); // Monitora ID do evento

  // --- TELA DE CONEXÃO ---
  if (!isConnected) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ConnectionForm
          onConnect={handleConnectRequest}
          title="Conectar à Sessão"
          btnLabel="PRÓXIMO"
          extraButton={
            // Pequeno "hack" para passar o force reconnect, ou você pode melhorar o componente ConnectionForm
            <TouchableOpacity style={{ marginTop: 20 }}>
              <Text
                style={{
                  color: colors.primary,
                  textAlign: "center",
                  textDecorationLine: "underline",
                }}
              >
                Problemas de conexão?
              </Text>
            </TouchableOpacity>
          }
        />

        {/* Modal de Iniciativa (Só aparece na primeira conexão) */}
        <Modal
          visible={showInitModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowInitModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Iniciativa</Text>

              <TouchableOpacity
                style={styles.rollBtn}
                onPress={rollInitiative}
                disabled={isRolling}
              >
                <MaterialCommunityIcons
                  name="dice-d20"
                  size={24}
                  color="#fff"
                />
                <Text style={styles.rollBtnText}>
                  {isRolling ? "Rolando..." : "Rolar Dado"}
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  alignSelf: "center",
                  marginVertical: 10,
                  color: colors.textSecondary,
                }}
              >
                — OU —
              </Text>

              <Text style={styles.label}>Valor Final</Text>
              <TextInput
                style={[
                  styles.input,
                  { textAlign: "center", fontSize: 24, fontWeight: "bold" },
                ]}
                keyboardType="numeric"
                value={initValue}
                onChangeText={setInitValue}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.inputBg }]}
                  onPress={() => setShowInitModal(false)}
                >
                  <Text style={{ color: colors.text }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    { backgroundColor: colors.success, flex: 1 },
                  ]}
                  onPress={confirmJoin}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    ENTRAR
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // --- TELA DE COMBATE ---
  return (
    <View style={styles.container}>
      <CombatNotification
        visible={notification.visible}
        type={notification.type}
        source={notification.source}
        skill={notification.skill}
        value={notification.value}
        onHide={() => setNotification((prev) => ({ ...prev, visible: false }))}
      />
      {/* Banner de Turno */}
      <View
        style={[
          styles.turnBanner,
          isMyTurn
            ? { backgroundColor: colors.success }
            : { backgroundColor: colors.surface },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.turnBannerText, isMyTurn && { color: "#fff" }]}>
            {isMyTurn
              ? "SUA VEZ DE AGIR"
              : `VEZ DE: ${currentActor?.name?.toUpperCase() || "AGUARDANDO..."}`}
          </Text>
        </View>
        <TouchableOpacity onPress={disconnect} style={styles.disconnectBtn}>
          <Ionicons
            name="close-circle"
            size={24}
            color={isMyTurn ? "#fff" : colors.error}
          />
        </TouchableOpacity>
      </View>

      {/* Área Principal */}
      {isMyTurn ? (
        <ActiveTurnInterface combatant={myCombatantData as any} />
      ) : (
        <FlatList
          data={combatants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <SpectatorCard
              item={item}
              activeTurnId={activeTurnId}
              colors={colors}
              isGm={false}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Conectado. Aguardando...</Text>
          }
        />
      )}

      {/* Overlay de Reação */}
      {!isMyTurn && myCombatantData && (
        <ReactionOverlay combatant={myCombatantData as any} />
      )}

      <Modal
        visible={showVictoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVictoryModal(false)}
      >
        <View style={styles.victoryOverlay}>
          <View
            style={[styles.victoryCard, { backgroundColor: colors.surface }]}
          >
            <MaterialCommunityIcons name="crown" size={60} color="#FFD700" />
            <Text style={[styles.victoryTitle, { color: colors.text }]}>
              COMBATE ENCERRADO
            </Text>
            <Text style={[styles.victorySub, { color: colors.textSecondary }]}>
              O mestre finalizou o encontro.
              {"\n"}Seus recursos de turno foram restaurados.
            </Text>

            <TouchableOpacity
              style={styles.victoryBtn}
              onPress={() => setShowVictoryModal(false)}
            >
              <Text style={styles.victoryBtnText}>CONTINUAR</Text>
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
    turnBanner: {
      padding: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    turnBannerText: { fontWeight: "bold", fontSize: 16, color: colors.text },
    disconnectBtn: { padding: 4 },
    empty: { textAlign: "center", marginTop: 50, color: colors.textSecondary },

    // Estilos do Modal de Iniciativa (que ainda vive aqui pois é específico)
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      padding: 20,
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    label: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.textSecondary,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    input: {
      backgroundColor: colors.inputBg,
      padding: 14,
      borderRadius: 8,
      marginBottom: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 16,
    },
    rollBtn: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginBottom: 10,
    },
    rollBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    modalBtn: {
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    victoryOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.8)", // Fundo mais escuro
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    victoryCard: {
      width: "90%",
      borderRadius: 20,
      padding: 30,
      alignItems: "center",
      elevation: 10,
      borderWidth: 2,
      borderColor: "#FFD700", // Borda dourada
    },
    victoryTitle: {
      fontSize: 24,
      fontWeight: "900",
      textTransform: "uppercase",
      marginTop: 16,
      marginBottom: 8,
      letterSpacing: 1,
    },
    victorySub: {
      textAlign: "center",
      fontSize: 16,
      marginBottom: 24,
      lineHeight: 22,
    },
    victoryBtn: {
      backgroundColor: "#2e7d32", // Verde Vitória
      paddingVertical: 14,
      paddingHorizontal: 30,
      borderRadius: 30,
      width: "100%",
      alignItems: "center",
    },
    victoryBtnText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
  });
