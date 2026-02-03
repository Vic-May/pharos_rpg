import { useCampaign } from "@/context/CampaignContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { Combatant, ResolveActionPayload, Skill, Spell } from "@/types/rpg";
import { getActionColor, getActionKey } from "@/utils/rpgUtils";
import { AttackModal } from "../modals/AttackModal";
import { HealModal } from "../modals/HealModal";
import { SpectatorCard } from "./SpectatorCard";

interface Props {
  combatant: Combatant;
  isGm?: boolean;
}

export const ActiveTurnInterface = ({ combatant, isGm = false }: Props) => {
  const { updateCombatant, combatants, activeTurnId } = useCampaign();
  const { sendMessage } = useWebSocket();
  const { showAlert } = useAlert();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [attackModalOpen, setAttackModalOpen] = useState(false);
  const [battlefieldVisible, setBattlefieldVisible] = useState(false);
  const [spellAttackConfig, setSpellAttackConfig] = useState<{
    bonus: string;
    damage: string;
    name: string;
    cost: number;
  } | null>(null);

  const [healModalOpen, setHealModalOpen] = useState(false);
  const [spellHealConfig, setSpellHealConfig] = useState<{
    formula: string;
    name: string;
    cost: number;
    modifier: number;
  } | null>(null);

  const isDying = combatant.hp.current <= 0;
  const [manualDeathInput, setManualDeathInput] = useState("");
  const successes = combatant.deathSaves?.successes || 0;
  const failures = combatant.deathSaves?.failures || 0;

  const updateDeathSaves = (type: "success" | "failure", value: number) => {
    const newSaves = {
      successes: type === "success" ? value : successes,
      failures: type === "failure" ? value : failures,
    };

    updateCombatant(combatant.id, "deathSaves", newSaves);

    // Opcional: Enviar socket se quiser sincronizar em tempo real as bolinhas
    // sendMessage("UPDATE_COMBATANT", { ... });
  };

  const handleDeathSave = (manualRoll?: number) => {
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

    const currentSuccesses = combatant?.deathSaves?.successes || 0;
    const currentFailures = combatant?.deathSaves?.failures || 0;

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

    if (hpUpdate > 0) {
      updateCombatant(combatant.id, "hp", {
        ...combatant.hp,
        current: hpUpdate,
      });
      updateCombatant(combatant.id, "deathSaves", {
        successes: 0,
        failures: 0,
      });
    } else {
      updateCombatant(combatant.id, "deathSaves", {
        successes: Math.min(3, newSuccesses),
        failures: Math.min(3, newFailures),
      });
    }

    if (turnActions.standard) {
      updateCombatant(combatant.id, "turnActions", {
        ...turnActions,
        standard: false,
      });
    }

    const payload = {
      combatantId: combatant.id,
      rollValue: d20,
    };

    sendMessage("ROLL_DEATH_SAVE", payload);

    showAlert(
      hpUpdate > 0 ? "Salvo!" : died ? "Morte" : "Teste de Morte",
      `Rolagem: ${d20}\n${resultText}`,
    );

    handleEndTurn();
    setManualDeathInput("");
  };

  // Garante que actions existe com valores padrão
  const turnActions = combatant.turnActions || {
    standard: true,
    bonus: true,
    reaction: true,
  };

  // --- LÓGICA DE DADOS (Visual) ---
  const stances = combatant.stances || [];
  const currentStanceIdx = stances.findIndex(
    (s: any) => s.id === combatant.activeStanceId,
  );
  const isNeutral = currentStanceIdx === -1;
  const activeStance = isNeutral ? null : stances[currentStanceIdx];

  const stanceBonus = activeStance?.acBonus || 0;
  const totalAC = combatant.armorClass || 10;

  const hpPercent = Math.min(
    100,
    (combatant.hp.current / combatant.hp.max) * 100,
  );
  const focusPercent = Math.min(
    100,
    (combatant.focus.current / combatant.focus.max) * 100,
  );

  // --- HANDLERS EXISTENTES ---
  const handleCastSpell = (spell: Spell) => {
    if (combatant.focus.current < spell.cost) {
      showAlert("Sem Foco", "Foco insuficiente.");
      return;
    }
    const actionKey = getActionKey(spell.actionType || "standard");
    if (actionKey && !turnActions[actionKey]) {
      showAlert("Sem Ação", "Ação indisponível.");
      return;
    }

    const intMod = combatant.attributes?.["Inteligência"]?.modifier || 0;
    const wisMod = combatant.attributes?.["Sabedoria"]?.modifier || 0;
    const magicMod = Math.max(intMod, wisMod);

    if (spell.isAttack) {
      setSpellAttackConfig({
        bonus: magicMod >= 0 ? `+${magicMod}` : `${magicMod}`,
        damage: spell.damageFormula || "1d4",
        name: spell.name,
        cost: spell.cost,
      });

      setAttackModalOpen(true);
    } else if (spell.isHealing) {
      setSpellHealConfig({
        formula: spell.healFormula || "1d4",
        name: spell.name,
        cost: spell.cost,
        modifier: magicMod,
      });
      setHealModalOpen(true);
    } else {
      const payload: ResolveActionPayload = {
        attackerId: combatant.id,
        targetId: null,
        actionName: spell.name,
        costType: actionKey || "standard",
        focusCost: spell.cost,
        damageAmount: 0,
        healingAmount: 0,
      };

      sendMessage("RESOLVE_ACTION", payload);

      updateCombatant(
        combatant.id,
        "focus",
        Math.max(0, combatant.focus.current - spell.cost),
      );
      if (actionKey) {
        updateCombatant(combatant.id, "turnActions", {
          ...turnActions,
          [actionKey]: false,
        });
      }

      showAlert("Magia", `${spell.name} conjurada!`);
    }
  };

  const handleConfirmHeal = (targetId: string, healAmount: number) => {
    if (!spellHealConfig) return;

    const target = combatants.find((c) => c.id === targetId);

    const payload: ResolveActionPayload = {
      attackerId: combatant.id,
      targetId: targetId,
      actionName: spellHealConfig.name,
      costType: "standard",
      focusCost: spellHealConfig.cost,
      damageAmount: 0,
      healingAmount: healAmount,
    };

    sendMessage("RESOLVE_ACTION", payload);

    if (target) {
      if (target.hp.current <= 0) {
        updateCombatant(targetId, "deathSaves", { successes: 0, failures: 0 });
      }

      const newHp = Math.min(target.hp.max, target.hp.current + healAmount);
      updateCombatant(targetId, "hp", { ...target.hp, current: newHp });
    }

    // Consome Foco
    updateCombatant(
      combatant.id,
      "focus",
      Math.max(0, combatant.focus.current - spellHealConfig.cost),
    );

    if (turnActions.standard) {
      updateCombatant(combatant.id, "turnActions", {
        ...turnActions,
        standard: false,
      });
    }

    setSpellHealConfig(null);
    showAlert("Cura Realizada", `${healAmount} PV restaurados.`);
  };

  const handleUseSkill = (skill: Skill) => {
    const actionKey = getActionKey(skill.actionType);

    if (combatant.focus.current < skill.cost) {
      showAlert("Sem Foco", "Foco insuficiente.");
      return;
    }
    if (actionKey && !turnActions[actionKey]) {
      showAlert("Sem Ação", "Ação indisponível.");
      return;
    }

    updateCombatant(
      combatant.id,
      "focus",
      Math.max(0, combatant.focus.current - skill.cost),
    );
    if (actionKey) {
      const newActions = { ...turnActions, [actionKey]: false };
      updateCombatant(combatant.id, "turnActions", newActions);
    }

    const payload: ResolveActionPayload = {
      attackerId: combatant.id,
      targetId: null,
      actionName: skill.name,
      costType: actionKey || "standard",
      focusCost: skill.cost,
      damageAmount: 0,
      healingAmount: 0,
    };

    sendMessage("RESOLVE_ACTION", payload);
    showAlert("Habilidade", `${skill.name} utilizada.`);
  };

  const handleStanceChange = (newIndex: number) => {
    const currentActiveStance = combatant.stances?.find(
      (s) => s.id === combatant.activeStanceId,
    );
    const currentBonusOnServer = currentActiveStance?.acBonus || 0;

    const safeBaseAC =
      combatant.armorClass ??
      (combatant.armorClass || 10) - currentBonusOnServer;

    let nextStanceId = null;
    let nextAC = safeBaseAC;

    if (newIndex !== -1) {
      const newStance = combatant.stances[newIndex];
      if (combatant.activeStanceId === newStance.id) return;

      if (!turnActions.bonus) {
        showAlert("Ação Indisponível", "Entrar em postura requer Ação Bônus.");
        return;
      }

      nextStanceId = newStance.id;
      nextAC = safeBaseAC + (newStance.acBonus || 0);

      const newActions = { ...turnActions, bonus: false };
      updateCombatant(combatant.id, "turnActions", newActions);
    }

    updateCombatant(combatant.id, "activeStanceId", nextStanceId);
    updateCombatant(combatant.id, "armorClass", nextAC);

    sendMessage("CHANGE_STANCE", {
      combatantId: combatant.id,
      stanceId: nextStanceId,
      newAC: nextAC,
    });
  };

  const handleToggleAction = (type: "standard" | "bonus" | "reaction") => {
    const newVal = !turnActions[type];
    const newActions = { ...turnActions, [type]: newVal };
    updateCombatant(combatant.id, "turnActions", newActions);
    sendMessage("PLAYER_ACTION", {
      character_id: combatant.id,
      action_type: "TOGGLE_ACTION",
      payload: { action_key: type, value: newVal },
    });
  };

  const handleEndTurn = () => {
    sendMessage("END_TURN", { character_id: combatant.id });
  };

  const handleCloseModal = () => {
    setAttackModalOpen(false);
    setSpellAttackConfig(null);
  };

  const handleConfirmAttack = (
    targetId: string,
    hitTotal: number,
    damageTotal: number,
    isCrit: boolean,
  ) => {
    const target = combatants.find((c) => c.id === targetId);
    if (!target) {
      showAlert("Erro", "Alvo não encontrado.");
      return;
    }

    const isHit = isCrit || hitTotal >= target.armorClass;
    const finalDamage = isHit ? damageTotal : 0;

    const isSpell = !!spellAttackConfig;
    let actionName = isSpell ? spellAttackConfig.name : "Ataque Básico";
    if (isCrit) actionName += " (Crítico!)";
    else if (!isHit) actionName += " (Errou)";

    const focusCost = isSpell ? spellAttackConfig.cost : 0;

    const payload: ResolveActionPayload = {
      attackerId: combatant.id,
      targetId: targetId,
      actionName: actionName,
      costType: "standard",
      focusCost: focusCost,
      damageAmount: finalDamage,
      healingAmount: 0,
    };

    sendMessage("RESOLVE_ACTION", payload);

    if (turnActions.standard) {
      updateCombatant(combatant.id, "turnActions", {
        ...turnActions,
        standard: false,
      });
    }

    if (focusCost > 0) {
      updateCombatant(
        combatant.id,
        "focus",
        Math.max(0, combatant.focus.current - focusCost),
      );
    }

    setSpellAttackConfig(null);

    showAlert(
      isHit ? "Sucesso" : "Errou",
      isHit
        ? `Causou ${finalDamage} de dano!`
        : isGm
          ? `Não superou a CA ${target.armorClass}.`
          : `O ataque não superou a defesa do alvo.`,
    );
  };

  // --- RENDERIZAÇÃO CONDICIONAL DE MORTE ---
  if (isDying) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.deathContainer}>
            <MaterialCommunityIcons
              name="skull-outline"
              size={60}
              color={colors.error}
            />
            <Text style={styles.deathTitle}>VOCÊ ESTÁ CAÍDO!</Text>

            {/* --- MONITOR DE MORTE --- */}
            <View style={styles.deathMonitorCard}>
              <View style={styles.deathSaveRow}>
                {/* Sucessos */}
                <View style={styles.deathSaveGroup}>
                  <Text
                    style={[styles.deathSaveLabel, { color: colors.success }]}
                  >
                    Sucessos
                  </Text>
                  <View style={styles.dotsContainer}>
                    {[1, 2, 3].map((i) => (
                      <TouchableOpacity
                        key={`succ-${i}`}
                        style={[
                          styles.deathSaveDot,
                          { borderColor: colors.success },
                          successes >= i && { backgroundColor: colors.success },
                        ]}
                        onPress={() =>
                          updateDeathSaves(
                            "success",
                            successes === i ? i - 1 : i,
                          )
                        }
                      />
                    ))}
                  </View>
                </View>

                {/* Falhas */}
                <View style={styles.deathSaveGroup}>
                  <Text
                    style={[styles.deathSaveLabel, { color: colors.error }]}
                  >
                    Falhas
                  </Text>
                  <View style={styles.dotsContainer}>
                    {[1, 2, 3].map((i) => (
                      <TouchableOpacity
                        key={`fail-${i}`}
                        style={[
                          styles.deathSaveDot,
                          { borderColor: colors.error },
                          failures >= i && { backgroundColor: colors.error },
                        ]}
                        onPress={() =>
                          updateDeathSaves(
                            "failure",
                            failures === i ? i - 1 : i,
                          )
                        }
                      />
                    ))}
                  </View>
                </View>
              </View>
              {successes >= 3 && (
                <Text style={styles.stabilizedText}>ESTABILIZADO</Text>
              )}
              {failures >= 3 && <Text style={styles.deadText}>MORTO</Text>}
            </View>

            {/* BOTÕES DE ROLAGEM (Só mostra se não estabilizou nem morreu ainda) */}
            {successes < 3 && failures < 3 && (
              <>
                <TouchableOpacity
                  style={styles.deathBtn}
                  onPress={() => handleDeathSave()}
                >
                  <MaterialCommunityIcons
                    name="dice-d20"
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.deathBtnText}>ROLAGEM</Text>
                </TouchableOpacity>

                <Text style={styles.dividerText}>— OU —</Text>

                <View style={styles.manualRow}>
                  <TextInput
                    style={styles.manualInput}
                    placeholder="Valor"
                    placeholderTextColor={colors.error + "80"}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={manualDeathInput}
                    onChangeText={setManualDeathInput}
                  />
                  <TouchableOpacity
                    style={styles.manualBtn}
                    onPress={() => handleDeathSave(Number(manualDeathInput))}
                  >
                    <Text style={styles.manualBtnText}>CONFIRMAR</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.endTurnBtnBig}
              onPress={handleEndTurn}
            >
              <Text style={styles.endTurnText}>PULAR / ENCERRAR TURNO</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // --- RENDERIZAÇÃO NORMAL (Combate Ativo) ---
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, marginTop: 10, marginBottom: 5 }}>
        <TouchableOpacity
          style={styles.battlefieldBtn}
          onPress={() => setBattlefieldVisible(true)}
        >
          <MaterialCommunityIcons name="eye" size={20} color={colors.text} />
          <Text style={[styles.battlefieldBtnText, { color: colors.text }]}>
            VER CAMPO DE BATALHA
          </Text>
        </TouchableOpacity>
      </View>
      {/* --- HUD DE COMBATE --- */}
      <View style={styles.combatHud}>
        <View style={styles.topRow}>
          {/* VIDA */}
          <View style={styles.healthContainer}>
            <View style={styles.resourceHeader}>
              <View style={styles.labelGroup}>
                <Ionicons
                  name="heart"
                  size={14}
                  color={colors.hp || "#ef5350"}
                />
                <Text style={styles.hudLabel}>VIDA</Text>
              </View>
              <Text style={styles.resourceValue}>
                <Text
                  style={[
                    styles.resourceCurrent,
                    { color: colors.hp || "#ef5350" },
                  ]}
                >
                  {combatant.hp.current}
                </Text>
                <Text style={styles.resourceMax}>/{combatant.hp.max}</Text>
              </Text>
            </View>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${hpPercent}%`,
                    backgroundColor: colors.hp || "#ef5350",
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.verticalSeparator} />

          {/* CA */}
          <View style={styles.acContainer}>
            <View style={styles.labelGroup}>
              <MaterialCommunityIcons
                name="shield"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.hudLabel}>DEFESA</Text>
            </View>
            <View style={styles.acValueContainer}>
              <Text style={styles.acTotal}>{totalAC}</Text>
              {stanceBonus !== 0 && (
                <View
                  style={[
                    styles.modBadge,
                    {
                      borderColor:
                        stanceBonus > 0 ? colors.success : colors.error,
                    },
                  ]}
                >
                  <Ionicons
                    name={stanceBonus > 0 ? "arrow-up" : "arrow-down"}
                    size={10}
                    color={stanceBonus > 0 ? colors.success : colors.error}
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* FOCO */}
        <View style={styles.bottomRow}>
          <View style={styles.resourceHeader}>
            <View style={styles.labelGroup}>
              <Ionicons name="flash" size={14} color={colors.focus} />
              <Text style={styles.hudLabel}>FOCO</Text>
            </View>
            <Text style={styles.resourceValue}>
              <Text style={[styles.resourceCurrent, { color: colors.focus }]}>
                {combatant.focus.current}
              </Text>
              <Text style={styles.resourceMax}>/{combatant.focus.max}</Text>
            </Text>
          </View>
          <View style={styles.barBackground}>
            <View
              style={[
                styles.barFill,
                { width: `${focusPercent}%`, backgroundColor: colors.focus },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {/* --- SELETOR DE POSTURA --- */}
        {/* LÓGICA: Só exibe o Seletor se existirem posturas cadastradas */}
        {combatant.stances && combatant.stances.length > 0 ? (
          <View style={styles.stanceSelectorContainer}>
            <Text style={styles.sectionLabel}>Postura Atual</Text>

            <View style={styles.stanceToggleGroup}>
              {/* Botão Neutra (Sempre existe se houver posturas para alternar) */}
              <TouchableOpacity
                style={[
                  styles.stanceBtn,
                  isNeutral && styles.stanceBtnNeutralActive,
                ]}
                onPress={() => handleStanceChange(-1)}
              >
                <Text
                  style={[
                    styles.stanceBtnText,
                    isNeutral && styles.stanceBtnTextActive,
                  ]}
                >
                  Neutra
                </Text>
              </TouchableOpacity>

              {/* Botões Dinâmicos (I, II, III...) baseados no array */}
              {combatant.stances.map((stance: any, index: number) => {
                const isThisStanceActive = currentStanceIdx === index;
                // Só pode ativar se for a vez do turno e tiver ação bônus (ou regra da casa)
                const canSwitch = isThisStanceActive || turnActions.bonus;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.stanceBtn,
                      // Estilo condicional para I (idx 0) e II (idx 1)
                      isThisStanceActive &&
                        (index === 0
                          ? styles.stanceBtnP1Active
                          : styles.stanceBtnP2Active),
                      !isThisStanceActive && !canSwitch && { opacity: 0.5 },
                    ]}
                    onPress={() => handleStanceChange(index)}
                    disabled={!isThisStanceActive && !canSwitch}
                  >
                    <Text
                      style={[
                        styles.stanceBtnText,
                        isThisStanceActive && { color: "#fff" },
                      ]}
                    >
                      {index === 0 ? "I" : index === 1 ? "II" : "III"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Card de Detalhes da Postura */}
            <View
              style={[
                styles.stanceCard,
                isNeutral
                  ? styles.stanceNeutralBg
                  : currentStanceIdx === 0
                    ? styles.stanceOneBg
                    : styles.stanceTwoBg,
              ]}
            >
              <Text style={styles.activeStanceName}>
                {isNeutral ? "Postura Neutra" : activeStance?.name}
              </Text>

              <View style={styles.divider} />

              {isNeutral ? (
                <Text style={styles.neutralText}>
                  Combatendo sem foco em técnicas específicas.
                </Text>
              ) : (
                <View style={styles.stanceDetails}>
                  <InfoRow
                    label="Benefício"
                    text={activeStance?.benefit}
                    color={colors.success}
                    styles={styles}
                  />
                  <InfoRow
                    label="Restrição"
                    text={activeStance?.restriction}
                    color={colors.error}
                    styles={styles}
                  />
                  <InfoRow
                    label="Manobra"
                    text={activeStance?.maneuver}
                    color={colors.focus}
                    styles={styles}
                  />
                  {activeStance?.recovery && (
                    <InfoRow
                      label="Recuperação"
                      text={activeStance.recovery}
                      color={colors.primary}
                      styles={styles}
                    />
                  )}
                </View>
              )}
            </View>
          </View>
        ) : // (OPCIONAL) Se não tiver posturas, não renderiza nada ou renderiza algo simples
        null}

        {/* --- RASTREADOR DE AÇÕES --- */}
        <View style={styles.combatSection}>
          <Text style={styles.sectionHeader}>Ações</Text>
          <View style={styles.actionsRow}>
            {["standard", "bonus", "reaction"].map((type) => {
              const key = type as "standard" | "bonus" | "reaction";
              const isActive = turnActions[key];
              const color =
                key === "standard"
                  ? colors.primary
                  : key === "bonus"
                    ? "#fb8c00"
                    : "#8e24aa";
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: isActive ? color : colors.inputBg,
                      opacity: isActive ? 1 : 0.5,
                    },
                  ]}
                  onPress={() => handleToggleAction(key)}
                >
                  <Text style={styles.actionBtnText}>
                    {key === "standard"
                      ? "Padrão"
                      : key === "bonus"
                        ? "Bônus"
                        : "Reação"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.mainAttackBtn,
              !turnActions.standard && { opacity: 0.5 },
            ]}
            onPress={() => {
              if (turnActions.standard) setAttackModalOpen(true);
              else showAlert("Sem Ação", "Você já usou sua ação padrão.");
            }}
          >
            <MaterialCommunityIcons name="sword" size={24} color="#fff" />
            <Text style={styles.mainAttackText}>REALIZAR ATAQUE</Text>
          </TouchableOpacity>
        </View>

        {/* --- SEÇÃO GRIMÓRIO --- */}
        {combatant.spells && combatant.spells.length > 0 && (
          <View style={styles.combatSection}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <MaterialCommunityIcons
                name="auto-fix"
                size={20}
                color="#b39ddb"
              />
              <Text
                style={[
                  styles.sectionHeader,
                  { marginBottom: 0, color: "#b39ddb" },
                ]}
              >
                Grimório
              </Text>
            </View>

            {combatant.spells.map((spell) => {
              const actionKey = getActionKey(spell.actionType || "standard");
              const hasAction = actionKey ? turnActions[actionKey] : true;
              const hasFocus = combatant.focus.current >= spell.cost;
              const canCast = hasAction && hasFocus;

              return (
                <TouchableOpacity
                  key={spell.id}
                  style={[
                    styles.skillRow,
                    { borderColor: "#b39ddb" },
                    !canCast && { opacity: 0.5, borderColor: colors.border },
                  ]}
                  disabled={!canCast}
                  onPress={() => handleCastSpell(spell)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.skillName, { color: "#b39ddb" }]}>
                      {spell.name}
                    </Text>
                    <Text style={styles.detailText}>{spell.description}</Text>
                    {spell.isAttack && (
                      <Text
                        style={{
                          fontSize: 10,
                          color: colors.error,
                          fontWeight: "bold",
                        }}
                      >
                        ATAQUE ({spell.damageFormula})
                      </Text>
                    )}
                    {spell.isHealing && (
                      <Text
                        style={{
                          fontSize: 10,
                          color: colors.success,
                          fontWeight: "bold",
                        }}
                      >
                        Cura ({spell.healFormula})
                      </Text>
                    )}
                  </View>
                  <View style={styles.skillCost}>
                    <Text style={{ fontWeight: "bold", color: colors.text }}>
                      {spell.cost} Foco
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* --- HABILIDADES FÍSICAS --- */}
        {/* LÓGICA: Só exibe a seção se houver habilidades na lista */}
        {combatant.skills && combatant.skills.length > 0 ? (
          <View style={styles.combatSection}>
            <Text style={styles.sectionHeader}>Habilidades</Text>
            {combatant.skills.map((skill: any) => {
              const actionKey = getActionKey(skill.actionType || skill.action);
              const isAvailable = actionKey ? turnActions[actionKey] : true;
              const hasFocus = combatant.focus.current >= skill.cost;
              const canUse = isAvailable && hasFocus;

              return (
                <TouchableOpacity
                  key={skill.id || Math.random()}
                  style={[styles.skillRow, !canUse && { opacity: 0.5 }]}
                  disabled={!canUse}
                  onPress={() => handleUseSkill(skill)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text
                      style={[
                        styles.skillType,
                        { color: getActionColor(skill.actionType, colors) },
                      ]}
                    >
                      {skill.actionType}
                    </Text>
                    <Text style={styles.detailText}>{skill.description}</Text>
                  </View>
                  <View style={styles.skillCost}>
                    <Text style={{ fontWeight: "bold", color: colors.text }}>
                      {skill.cost} Foco
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        <TouchableOpacity style={styles.endTurnBtnBig} onPress={handleEndTurn}>
          <Text style={styles.endTurnText}>ENCERRAR MEU TURNO</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />

      <AttackModal
        visible={attackModalOpen}
        onClose={handleCloseModal}
        attacker={combatant}
        potentialTargets={combatants}
        onConfirmAttack={handleConfirmAttack}
        isGm={isGm}
        initialBonus={spellAttackConfig?.bonus}
        initialDamage={spellAttackConfig?.damage}
      />

      {spellHealConfig && (
        <HealModal
          visible={healModalOpen}
          onClose={() => {
            setHealModalOpen(false);
            setSpellHealConfig(null);
          }}
          healer={combatant}
          potentialTargets={combatants}
          onConfirmHeal={handleConfirmHeal}
          spellName={spellHealConfig.name}
          healFormula={spellHealConfig.formula}
          modifier={spellHealConfig.modifier}
        />
      )}

      {/* --- MODAL DO CAMPO DE BATALHA --- */}
      <Modal
        visible={battlefieldVisible}
        animationType="slide"
        presentationStyle="pageSheet" // Estilo card no iOS
        onRequestClose={() => setBattlefieldVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Header do Modal */}
          <SafeAreaView
            style={[styles.modalHeader, { borderColor: colors.border }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Situação do Combate
            </Text>
            <TouchableOpacity onPress={() => setBattlefieldVisible(false)}>
              <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                Voltar para Ação
              </Text>
            </TouchableOpacity>
          </SafeAreaView>

          {/* Lista Reutilizada */}
          <FlatList
            data={combatants}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <SpectatorCard
                item={item}
                activeTurnId={activeTurnId} // Passa o ID do turno ativo
                colors={colors}
                isGm={isGm} // Passa se é GM ou não
              />
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const InfoRow = ({ label, text, color, styles }: any) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color }]}>{label}:</Text>
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const getStyles = (colors: any, isDark: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    deathContainer: {
      alignItems: "center",
      backgroundColor: isDark ? colors.background : "#ffebee",
      padding: 24,
    },
    deathTitle: {
      fontSize: 32,
      fontWeight: "900",
      color: colors.error,
      marginTop: 16,
      textAlign: "center",
      letterSpacing: 2,
    },
    deathSubtitle: {
      fontSize: 16,
      color: "#ff8a80",
      textAlign: "center",
      marginVertical: 12,
      marginBottom: 40,
    },
    deathBtn: {
      backgroundColor: colors.error,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 50,
      gap: 12,
      elevation: 10,
      shadowColor: colors.error,
      shadowOpacity: 0.5,
      shadowRadius: 10,
    },
    deathBtnText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },

    // HUD ATIVO
    combatHud: {
      backgroundColor: colors.surface,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
      borderBottomWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    healthContainer: { flex: 1, marginRight: 16 },
    verticalSeparator: {
      width: 1,
      height: 40,
      backgroundColor: colors.border,
      marginRight: 16,
    },
    acContainer: { alignItems: "center", minWidth: 60 },
    bottomRow: { width: "100%" },
    resourceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 6,
    },
    labelGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
    hudLabel: { fontSize: 11, fontWeight: "bold", color: colors.textSecondary },
    resourceValue: { fontSize: 12, color: colors.textSecondary },
    resourceCurrent: { fontSize: 16, fontWeight: "900" },
    resourceMax: { fontSize: 12, fontWeight: "600", opacity: 0.7 },
    barBackground: {
      height: 10,
      backgroundColor: colors.inputBg,
      borderRadius: 5,
      overflow: "hidden",
    },
    barFill: { height: "100%", borderRadius: 5 },
    acValueContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 2,
    },
    acTotal: { fontSize: 28, fontWeight: "bold", color: colors.text },
    modBadge: {
      width: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
    },

    // STANCE & SECTIONS
    stanceSelectorContainer: { marginBottom: 16 },
    sectionLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "bold",
      textTransform: "uppercase",
      marginBottom: 8,
    },
    stanceToggleGroup: {
      flexDirection: "row",
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      padding: 2,
      marginBottom: 8,
    },
    stanceBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 6,
    },
    stanceBtnText: { fontWeight: "600", color: colors.textSecondary },
    stanceBtnNeutralActive: { backgroundColor: colors.surface, elevation: 2 },
    stanceBtnP1Active: { backgroundColor: "#1976d2", elevation: 2 },
    stanceBtnP2Active: { backgroundColor: "#f57c00", elevation: 2 },
    stanceBtnTextActive: { color: colors.text },
    stanceCard: {
      borderRadius: 12,
      padding: 16,
      elevation: 2,
      minHeight: 120,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stanceNeutralBg: {
      borderLeftWidth: 5,
      borderLeftColor: colors.textSecondary,
    },
    stanceOneBg: { borderLeftWidth: 5, borderLeftColor: "#1976d2" },
    stanceTwoBg: { borderLeftWidth: 5, borderLeftColor: "#f57c00" },
    activeStanceName: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      color: colors.text,
      marginBottom: 8,
    },
    divider: { height: 1, backgroundColor: colors.border, marginBottom: 12 },
    neutralText: {
      textAlign: "center",
      color: colors.textSecondary,
      fontStyle: "italic",
      marginTop: 10,
    },
    stanceDetails: { gap: 8 },
    infoRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
    },
    infoLabel: { fontWeight: "bold", marginRight: 6, fontSize: 14 },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 20,
    },

    combatSection: { marginBottom: 20 },
    sectionHeader: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.textSecondary,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    actionsRow: { flexDirection: "row", gap: 10 },
    actionBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
    actionBtnText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 11,
      textTransform: "uppercase",
    },
    skillRow: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skillName: { fontWeight: "bold", color: colors.text, fontSize: 14 },
    skillType: { fontSize: 12, color: colors.primary, marginTop: 2 },
    detailText: { color: colors.textSecondary, fontSize: 12 },
    skillCost: {
      justifyContent: "center",
      paddingLeft: 10,
      borderLeftWidth: 1,
      borderColor: colors.border,
    },
    endTurnBtnBig: {
      marginVertical: 16,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.success,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      borderStyle: "dashed",
    },
    endTurnText: {
      color: colors.success,
      fontWeight: "900",
      fontSize: 16,
      letterSpacing: 1,
    },

    // SPECTATOR & COMMON
    spectatorCard: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      marginBottom: 10,
      borderRadius: 8,
      padding: 10,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    initBadge: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.inputBg,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    initText: { fontWeight: "bold", color: colors.text },
    spectatorName: { fontWeight: "bold", fontSize: 16, color: colors.text },
    spectatorStatus: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
      fontStyle: "italic",
    },
    miniBarBg: {
      height: 6,
      backgroundColor: colors.inputBg,
      borderRadius: 3,
      marginTop: 6,
      overflow: "hidden",
    },
    miniBarFill: { height: "100%", borderRadius: 3 },
    empty: { textAlign: "center", marginTop: 50, color: colors.textSecondary },
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

    // CONFIG & MODALS
    configCard: {
      backgroundColor: colors.surface,
      padding: 24,
      borderRadius: 16,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    configTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text,
      marginVertical: 8,
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
    connectBtn: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
    },
    connectBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
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
    modalSubtitle: {
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 20,
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
    mainAttackBtn: {
      backgroundColor: "#d32f2f", // Vermelho sangue
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
      marginTop: 12,
      gap: 8,
      elevation: 3,
    },
    mainAttackText: {
      color: "#fff",
      fontWeight: "900",
      fontSize: 16,
      letterSpacing: 1,
    },
    battlefieldBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
      marginBottom: 8,
    },
    battlefieldBtnText: {
      fontWeight: "bold",
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    modalContainer: { flex: 1 },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      backgroundColor: colors.surface,
    },
    dividerText: {
      color: "#ff8a80",
      fontWeight: "bold",
      marginVertical: 16,
      opacity: 0.7,
    },
    manualRow: {
      flexDirection: "row",
      gap: 10,
      width: "100%",
      marginBottom: 20,
      justifyContent: "center",
    },
    manualInput: {
      backgroundColor: "rgba(255, 0, 0, 0.1)",
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 8,
      color: "#fff",
      width: 80,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "bold",
      padding: 12,
    },
    manualBtn: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 8,
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    manualBtnText: {
      color: colors.error,
      fontWeight: "bold",
      fontSize: 12,
    },

    // Monitor Card
    deathMonitorCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      width: "100%",
      marginBottom: 24,
      borderWidth: 1,
      borderColor: "#5c2b2b",
    },
    deathSaveRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 8,
    },
    deathSaveGroup: { alignItems: "center" },
    deathSaveLabel: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    dotsContainer: { flexDirection: "row", gap: 12 },
    deathSaveDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      backgroundColor: "transparent",
    },
    stabilizedText: {
      color: colors.success,
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 18,
      marginTop: 10,
      letterSpacing: 2,
    },
    deadText: {
      color: "#5c2b2b", // Vermelho morto escuro
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 24,
      marginTop: 10,
      letterSpacing: 4,
    },
  });
