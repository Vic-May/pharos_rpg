import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAlert } from "@/context/AlertContext";
import { useCampaign } from "@/context/CampaignContext";
import { useTheme } from "@/context/ThemeContext";
import { Combatant, Skill } from "@/types/rpg";
import { formatMod, getActionKey } from "@/utils/rpgUtils";

export const CombatantCard = ({ item }: { item: Combatant }) => {
  const [expanded, setExpanded] = useState(false);
  const { removeCombatant, updateCombatant, sortCombat } = useCampaign();

  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { showAlert } = useAlert();

  // Garante que turnActions exista (para dados antigos)
  const actions = item.turnActions || {
    standard: true,
    bonus: true,
    reaction: true,
  };

  const activeStance = item.stances?.find((s) => s.id === item.activeStanceId);
  const stanceBonus = activeStance?.acBonus || 0;
  const totalAC = (item.armorClass || 10) + stanceBonus;

  // Função para alternar ação
  const toggleAction = (type: "standard" | "bonus" | "reaction") => {
    const newActions = { ...actions, [type]: !actions[type] };
    updateCombatant(item.id, "turnActions", newActions);
  };

  const handleUseSkill = (skill: Skill) => {
    // 1. Verifica Foco (MANTIDO)
    if (item.currentFocus < skill.cost) {
      showAlert("Sem Foco", `${item.name} precisa de ${skill.cost} foco.`);
      return;
    }

    // 2. Identifica e Verifica a Ação (AJUSTADO)
    const actionKey = getActionKey(skill.actionType); // Usa o helper que você criou

    if (actionKey && !actions[actionKey]) {
      // Se a ação existe (não é null) E já foi gasta (false)
      showAlert(
        "Ação Indisponível",
        `${item.name} já gastou sua ${skill.actionType || "ação"} neste turno.`,
      );
      return;
    }

    // 3. Executa o Gasto (MANTIDO)
    updateCombatant(item.id, "currentFocus", item.currentFocus - skill.cost);

    if (actionKey) {
      // Consome a ação automaticamente
      const newActions = { ...actions, [actionKey]: false };
      updateCombatant(item.id, "turnActions", newActions);
    }

    showAlert(
      "Habilidade Usada",
      `${item.name} usou ${skill.name}!\n\n${skill.description}`,
    );
  };

  const handleStanceChange = (newStanceId: string | null) => {
    if (newStanceId !== null) {
      if (item.activeStanceId === newStanceId) return;

      if (!actions.bonus) {
        showAlert(
          "Ação Indisponível",
          "Mudar de postura requer uma Ação Bônus neste turno.",
        );
        return;
      }

      const newActions = { ...actions, bonus: false };
      updateCombatant(item.id, "turnActions", newActions);
    }

    updateCombatant(item.id, "activeStanceId", newStanceId);
  };

  return (
    <View
      style={[
        styles.cardContainer,
        item.type === "player" && styles.playerBorder,
      ]}
    >
      {/* CABEÇALHO (Sempre visível) */}
      <TouchableOpacity
        style={styles.mainRow}
        activeOpacity={0.8}
        onPress={() => setExpanded(!expanded)}
      >
        {/* Iniciativa */}
        <View style={styles.initBox}>
          <TextInput
            style={styles.initInput}
            keyboardType="numeric"
            value={String(item.initiative)}
            onChangeText={(t) =>
              updateCombatant(item.id, "initiative", Number(t))
            }
            onBlur={sortCombat}
          />
          <Text style={styles.tinyLabel}>INIT</Text>
        </View>

        {/* Info Principal */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name}>{item.name}</Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <Text style={styles.type}>
              {item.type === "player" ? "JOGADOR" : "NPC"}
            </Text>

            {/* Badge de CA Dinâmica */}
            <View
              style={[
                styles.miniBadge,
                stanceBonus !== 0 && {
                  backgroundColor:
                    stanceBonus > 0 ? colors.primary : colors.error,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="shield"
                size={12}
                color={stanceBonus !== 0 ? "#fff" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.miniBadgeText,
                  stanceBonus !== 0 && { color: "#fff" },
                ]}
              >
                {totalAC}
              </Text>
            </View>

            {/* Badge de Foco */}
            {item.maxFocus > 0 && (
              <View style={styles.miniBadge}>
                <Ionicons name="flash" size={12} color={colors.focus} />
                <Text style={styles.miniBadgeText}>
                  {item.currentFocus}/{item.maxFocus}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Controle de HP */}
        <View style={styles.hpCtrl}>
          <TouchableOpacity
            onPress={() => updateCombatant(item.id, "hp", item.hp.current - 1)}
          >
            <Ionicons name="remove-circle" size={32} color={colors.error} />
          </TouchableOpacity>
          <View style={{ alignItems: "center", minWidth: 40 }}>
            <Text
              style={[
                styles.hpVal,
                item.hp.current === 0 && { color: colors.error },
              ]}
            >
              {item.hp.current}
            </Text>
            <Text style={styles.tinyLabel}>HP</Text>
          </View>
          <TouchableOpacity
            onPress={() => updateCombatant(item.id, "hp", item.hp.current + 1)}
          >
            <Ionicons name="add-circle" size={32} color={colors.success} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View
          style={styles.detailsBody}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <View style={styles.divider} />

          {/* --- NOVO: RASTREADOR DE AÇÕES --- */}
          <View style={styles.actionTrackerRow}>
            <Text style={styles.sectionHeaderSmall}>Ações:</Text>

            <TouchableOpacity
              style={[
                styles.miniActionBtn,
                actions.standard
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.border },
              ]}
              onPress={() => toggleAction("standard")}
            >
              <Text style={styles.miniActionText}>Padrão</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.miniActionBtn,
                actions.bonus
                  ? { backgroundColor: "#fb8c00" }
                  : { backgroundColor: colors.border },
              ]}
              onPress={() => toggleAction("bonus")}
            >
              <Text style={styles.miniActionText}>Bônus</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.miniActionBtn,
                actions.reaction
                  ? { backgroundColor: "#8e24aa" }
                  : { backgroundColor: colors.border },
              ]}
              onPress={() => toggleAction("reaction")}
            >
              <Text style={styles.miniActionText}>Reação</Text>
            </TouchableOpacity>

            {/* Botão Resetar (Circular) */}
            <TouchableOpacity
              style={styles.resetTurnBtn}
              onPress={() =>
                updateCombatant(item.id, "turnActions", {
                  standard: true,
                  bonus: true,
                  reaction: true,
                })
              }
            >
              <Ionicons name="refresh" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          {item.stances && item.stances.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Postura Ativa</Text>
              <View style={styles.stanceContainer}>
                {/* Botão Neutra (Geralmente é ação livre 'soltar' a postura) */}
                <TouchableOpacity
                  onPress={() => handleStanceChange(null)}
                  style={[
                    styles.stanceBtn,
                    !item.activeStanceId && styles.activeStanceBtn,
                  ]}
                >
                  <Text
                    style={[
                      styles.stanceBtnText,
                      !item.activeStanceId && { color: "#fff" },
                    ]}
                  >
                    Neutra
                  </Text>
                </TouchableOpacity>

                {/* Botões das Posturas (Custam Ação Bônus) */}
                {item.stances.map((s) => {
                  const isActive = item.activeStanceId === s.id;
                  // Se não tem ação bônus E não é a postura atual, fica apagado
                  const canSwitch = actions.bonus || isActive;

                  return (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => handleStanceChange(s.id)}
                      // Feedback visual: Opacidade se não puder trocar
                      style={[
                        styles.stanceBtn,
                        isActive && styles.activeStanceBtn,
                        !canSwitch && { opacity: 0.5 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stanceBtnText,
                          isActive && { color: "#fff" },
                        ]}
                      >
                        {s.name} (
                        {(s.acBonus || 0) >= 0 ? `+${s.acBonus}` : s.acBonus})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* LISTA DE HABILIDADES */}
          {item.skills && item.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Habilidades</Text>
              {item.skills.map((skill) => {
                const canUseFocus = item.currentFocus >= skill.cost;

                // Verifica ação visualmente para feedback
                const actionKey = getActionKey(skill.actionType);
                const isActionAvailable = actionKey ? actions[actionKey] : true;
                const canUse = canUseFocus && isActionAvailable;

                return (
                  <TouchableOpacity
                    key={skill.id}
                    style={[styles.skillRow, !canUse && { opacity: 0.5 }]}
                    onPress={() => handleUseSkill(skill)}
                    disabled={!canUse} // Desabilita o botão se não puder usar
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.skillName}>{skill.name}</Text>
                      {/* Mostra o tipo de ação se existir */}
                      {skill.actionType && (
                        <Text
                          style={[
                            styles.detailText,
                            {
                              color: colors.primary,
                              fontSize: 10,
                              fontWeight: "bold",
                            },
                          ]}
                        >
                          {skill.actionType.toUpperCase()}
                        </Text>
                      )}
                      <Text style={styles.detailText}>{skill.description}</Text>
                    </View>
                    <View style={styles.skillCost}>
                      <Ionicons name="flash" size={12} color={colors.text} />
                      <Text style={styles.skillCostText}>{skill.cost}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Status Detalhados (Atributos e Foco Manual) */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>FOCO MANUAL</Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <TouchableOpacity
                  onPress={() =>
                    updateCombatant(
                      item.id,
                      "currentFocus",
                      Math.max(0, item.currentFocus - 1),
                    )
                  }
                >
                  <Ionicons
                    name="remove-circle-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                <Text style={styles.statValue}>
                  {item.currentFocus}/{item.maxFocus}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    updateCombatant(
                      item.id,
                      "currentFocus",
                      Math.min(item.maxFocus, item.currentFocus + 1),
                    )
                  }
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {item.attributes && (
            <View style={styles.attrGrid}>
              {Object.entries(item.attributes).map(([key, val]) => (
                <View key={key} style={styles.attrBox}>
                  <Text style={styles.attrLabel}>
                    {key.toUpperCase().slice(0, 3)}
                  </Text>
                  <Text style={styles.attrVal}>{val.value}</Text>
                  <Text style={styles.attrMod}>{formatMod(val.value)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Ações / Equipamento (Texto Simples) */}
          {!!item.actions && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>
                Ações Básicas / Equipamento
              </Text>
              <Text style={styles.detailText}>{item.actions}</Text>
              {!!item.equipment && (
                <Text style={[styles.detailText, { marginTop: 4 }]}>
                  {item.equipment}
                </Text>
              )}
            </View>
          )}

          {/* Botão de Remover */}
          <TouchableOpacity
            onPress={() => removeCombatant(item.id)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={{ color: colors.error, fontWeight: "bold" }}>
              Remover do Combate
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    cardContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    playerBorder: { borderColor: "#2e7d32", borderWidth: 2 },
    mainRow: { flexDirection: "row", alignItems: "center", padding: 10 },
    initBox: {
      backgroundColor: colors.inputBg,
      width: 50,
      height: 50,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    initInput: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      padding: 0,
    },
    tinyLabel: { fontSize: 8, color: colors.textSecondary, fontWeight: "bold" },
    name: { fontSize: 16, fontWeight: "bold", color: colors.text },
    type: { fontSize: 10, color: colors.textSecondary, fontWeight: "bold" },
    miniBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      gap: 4,
    },
    miniBadgeText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "bold",
    },
    hpCtrl: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      borderRadius: 20,
      paddingHorizontal: 5,
    },
    hpVal: { fontSize: 18, fontWeight: "bold", color: colors.text },
    detailsBody: {
      backgroundColor: colors.inputBg + "40",
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    divider: { height: 1, backgroundColor: colors.border, marginBottom: 10 },
    section: { marginBottom: 12 },
    sectionHeader: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#c62828",
      textTransform: "uppercase",
      marginBottom: 6,
    },
    sectionHeaderSmall: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.textSecondary,
      textTransform: "uppercase",
      marginRight: 4,
    },
    detailText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
    stanceContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 6,
    },
    stanceBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeStanceBtn: { backgroundColor: "#c62828", borderColor: "#c62828" },
    stanceBtnText: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.textSecondary,
    },
    skillRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: 8,
      borderRadius: 8,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skillName: { fontWeight: "bold", color: colors.text, fontSize: 14 },
    skillCost: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
      borderLeftWidth: 1,
      borderColor: colors.border,
      marginLeft: 8,
    },
    skillCostText: { fontWeight: "bold", fontSize: 14, color: colors.text },
    deleteBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 10,
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      marginTop: 10,
      gap: 8,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    statItem: { alignItems: "center", flexDirection: "row", gap: 6 },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "bold",
    },
    statValue: { fontSize: 16, fontWeight: "bold", color: colors.text },
    attrGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      padding: 8,
      marginBottom: 12,
    },
    attrBox: { alignItems: "center", width: 40 },
    attrLabel: { fontSize: 9, fontWeight: "bold", color: colors.textSecondary },
    attrVal: { fontSize: 14, fontWeight: "bold", color: colors.text },
    attrMod: { fontSize: 10, color: colors.textSecondary },
    actionTrackerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
      paddingHorizontal: 4,
    },
    miniActionBtn: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,
      minWidth: 50,
      alignItems: "center",
    },
    miniActionText: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#fff",
      textTransform: "uppercase",
    },
    resetTurnBtn: {
      marginLeft: "auto",
      padding: 4,
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
