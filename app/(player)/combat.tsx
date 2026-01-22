import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Contextos
import { useAlert } from "@/context/AlertContext";
import { useCharacter } from "@/context/CharacterContext";
import { useTheme } from "@/context/ThemeContext";
import { Skill } from "@/types/rpg";

// Componentes Reutilizáveis
import { InfoRow } from "@/components/rpg/InfoRow"; // Extraia se ainda não tiver
import { StatBar } from "@/components/ui/StatBar";
import { getActionKey } from "@/utils/rpgUtils";

// Sub-componentes locais (poderiam ser extraídos para components/rpg/SkillCard.tsx)
const SkillCard = ({
  skill,
  styles,
  updateStat,
  character,
  toggleAction,
  showAlert,
}: any) => {
  const [expanded, setExpanded] = React.useState(false);

  const actionKey = getActionKey(skill.action || skill.actionType);
  const hasEnoughFocus = character.stats.focus.current >= skill.cost;
  const isActionAvailable = actionKey ? character.turnActions[actionKey] : true;

  const handleUseSkill = () => {
    if (!hasEnoughFocus) {
      showAlert(
        "Foco Insuficiente",
        "Você não tem foco para usar esta habilidade.",
      );
      return;
    }
    if (!isActionAvailable) {
      showAlert(
        "Ação Indisponível",
        `Você já gastou sua ${skill.action || "ação"} neste turno.`,
      );
      return;
    }
    updateStat("focus", -skill.cost);
    if (actionKey) toggleAction(actionKey);
  };

  return (
    <TouchableOpacity
      style={styles.skillCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.skillHeader}>
        <View>
          <Text style={styles.skillName}>{skill.name}</Text>
          <Text style={styles.skillType}>{skill.actionType}</Text>
        </View>
        <View
          style={[
            styles.costBadge,
            !hasEnoughFocus && styles.costBadgeDisabled,
          ]}
        >
          <Text
            style={[
              styles.costText,
              !hasEnoughFocus && styles.costTextDisabled,
            ]}
          >
            {skill.cost} Foco
          </Text>
        </View>
      </View>
      {expanded && (
        <View style={styles.skillBody}>
          <Text style={styles.description}>{skill.description}</Text>
          <TouchableOpacity
            style={[
              styles.useButton,
              (!hasEnoughFocus || !isActionAvailable) &&
                styles.useButtonDisabled,
            ]}
            onPress={handleUseSkill}
            disabled={!hasEnoughFocus}
          >
            <Text style={styles.useButtonText}>
              {hasEnoughFocus ? "USAR HABILIDADE" : "FOCO INSUFICIENTE"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function CombatScreen() {
  const { character, setStanceIndex, updateStat, toggleAction, endTurn } =
    useCharacter();
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const turnActions = character.turnActions || {
    standard: true,
    bonus: true,
    reaction: true,
  };
  const currentStanceIdx = character.currentStanceIndex ?? -1;
  const isNeutral = currentStanceIdx === -1;
  const activeStance = isNeutral ? null : character.stances[currentStanceIdx];
  const focus = character.stats.focus;
  const health = character.stats.hp;

  // Cálculo de CA (Lógica mantida)
  const armorClassInfo = useMemo(() => {
    const armorDef = character.equipment.armor.defense || 0;
    const shieldDef = character.equipment.shield.defense || 0;
    const dexMod =
      Object.values(character.attributes).find(
        (attr) => attr.name === "Destreza",
      )?.modifier || 0;

    let baseAC = 0;
    if (armorDef === 0) baseAC = 10 + dexMod;
    else if (armorDef >= 16) baseAC = armorDef;
    else if (armorDef >= 13) baseAC = armorDef + Math.min(dexMod, 2);
    else baseAC = armorDef + dexMod;

    baseAC += shieldDef;
    let stanceMod = activeStance?.acBonus || 0;

    return { total: baseAC + stanceMod, stanceMod, base: baseAC };
  }, [character.equipment, character.attributes, activeStance]);

  const handleStanceChange = (newIndex: number) => {
    if (newIndex === -1) {
      setStanceIndex(-1);
      return;
    }
    if (character.currentStanceIndex === newIndex) return;
    if (!turnActions.bonus) {
      showAlert(
        "Ação Indisponível",
        "Entrar em uma postura requer uma Ação Bônus neste turno.",
      );
      return;
    }
    setStanceIndex(newIndex);
    toggleAction("bonus");
  };

  const renderSkill = ({ item }: { item: Skill }) => (
    <SkillCard
      skill={item}
      styles={styles}
      updateStat={updateStat}
      character={character}
      toggleAction={toggleAction}
      showAlert={showAlert}
    />
  );

  const level1Skills = character.skills.filter((s) => (s.level || 1) === 1);
  const level2Skills = character.skills.filter((s) => s.level === 2);
  const showLevel2 = (character.level || 1) >= 2 && level2Skills.length > 0;

  return (
    <View style={styles.container}>
      {/* HUD DE COMBATE */}
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
                  {health.current}
                </Text>
                <Text style={styles.resourceMax}>/{health.max}</Text>
              </Text>
            </View>
            <StatBar
              current={health.current}
              max={health.max}
              color={colors.hp || "#ef5350"}
              backgroundColor={colors.inputBg}
              height={10}
            />
          </View>

          <View style={styles.verticalSeparator} />

          {/* DEFESA */}
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
              <Text style={styles.acTotal}>{armorClassInfo.total}</Text>
              {armorClassInfo.stanceMod !== 0 && (
                <View
                  style={[
                    styles.modBadge,
                    {
                      borderColor:
                        armorClassInfo.stanceMod > 0
                          ? colors.success
                          : colors.error,
                      backgroundColor:
                        armorClassInfo.stanceMod > 0
                          ? colors.success + "20"
                          : colors.error + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      armorClassInfo.stanceMod > 0 ? "arrow-up" : "arrow-down"
                    }
                    size={10}
                    color={
                      armorClassInfo.stanceMod > 0
                        ? colors.success
                        : colors.error
                    }
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
                {focus.current}
              </Text>
              <Text style={styles.resourceMax}>/{focus.max}</Text>
            </Text>
          </View>
          <StatBar
            current={focus.current}
            max={focus.max}
            color={colors.focus}
            backgroundColor={colors.inputBg}
            height={10}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* SELETOR DE POSTURA */}
        <View style={styles.stanceSelectorContainer}>
          <Text style={styles.sectionLabel}>Postura Atual</Text>
          <View style={styles.stanceToggleGroup}>
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
            <TouchableOpacity
              style={[
                styles.stanceBtn,
                currentStanceIdx === 0 && styles.stanceBtnP1Active,
                currentStanceIdx !== 0 &&
                  !turnActions.bonus && { opacity: 0.5 },
              ]}
              onPress={() => handleStanceChange(0)}
            >
              <Text
                style={[
                  styles.stanceBtnText,
                  currentStanceIdx === 0 && { color: "#fff" },
                ]}
              >
                I
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.stanceBtn,
                currentStanceIdx === 1 && styles.stanceBtnP2Active,
                currentStanceIdx !== 1 &&
                  !turnActions.bonus && { opacity: 0.5 },
              ]}
              onPress={() => handleStanceChange(1)}
            >
              <Text
                style={[
                  styles.stanceBtnText,
                  currentStanceIdx === 1 && { color: "#fff" },
                ]}
              >
                II
              </Text>
            </TouchableOpacity>
          </View>

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
                Você não está focado em nenhuma técnica específica.
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
                    text={activeStance?.recovery}
                    color={colors.primary}
                    styles={styles}
                  />
                )}
              </View>
            )}
          </View>
        </View>

        {/* RASTREADOR DE AÇÕES */}
        <View style={styles.combatSection}>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>
            Turno & Ações
          </Text>
          <View style={styles.actionsRow}>
            {["standard", "bonus", "reaction"].map((type) => {
              const key = type as keyof typeof turnActions;
              const isActive = turnActions[key];
              const color =
                key === "standard"
                  ? colors.primary
                  : key === "bonus"
                    ? "#fb8c00"
                    : "#8e24aa";
              const label =
                key === "standard"
                  ? "Padrão"
                  : key === "bonus"
                    ? "Bônus"
                    : "Reação";
              const icon =
                key === "standard"
                  ? "sword-cross"
                  : key === "bonus"
                    ? "star-four-points"
                    : "shield-alert";

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: isActive ? color : colors.inputBg,
                      opacity: isActive ? 1 : 0.4,
                    },
                  ]}
                  onPress={() => toggleAction(key)}
                >
                  <MaterialCommunityIcons
                    name={icon}
                    size={18}
                    color={isActive ? "#fff" : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: isActive ? "#fff" : colors.textSecondary },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={styles.endTurnBtn} onPress={endTurn}>
            <Text style={styles.endTurnText}>ENCERRAR TURNO ↻</Text>
          </TouchableOpacity>
        </View>

        {/* LISTA DE HABILIDADES */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Habilidades</Text>

          <Text style={styles.subHeader}>Nível 1</Text>
          <View style={styles.listContent}>
            {level1Skills.length > 0 ? (
              level1Skills.map((item) => (
                <React.Fragment key={item.id}>
                  {renderSkill({ item })}
                </React.Fragment>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhuma habilidade.</Text>
            )}
          </View>

          {showLevel2 && (
            <>
              <Text style={[styles.subHeader, { marginTop: 16 }]}>Nível 2</Text>
              <View style={styles.listContent}>
                {level2Skills.map((item) => (
                  <React.Fragment key={item.id}>
                    {renderSkill({ item })}
                  </React.Fragment>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Styles reduzidos mantendo os específicos de layout
const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    // HUD
    combatHud: {
      backgroundColor: colors.surface,
      paddingVertical: 12,
      paddingHorizontal: 16,
      elevation: 4,
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    healthContainer: { flex: 1, marginRight: 16 },
    bottomRow: { width: "100%" },
    verticalSeparator: {
      width: 1,
      height: 40,
      backgroundColor: colors.border,
      marginRight: 16,
    },
    acContainer: { alignItems: "center", minWidth: 60 },
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
    // Stance & Actions
    stanceSelectorContainer: { marginHorizontal: 16, marginBottom: 16 },
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
    combatSection: { marginHorizontal: 16, marginTop: 12, marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
    actionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
      marginBottom: 12,
    },
    actionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 8,
      gap: 4,
      elevation: 2,
    },
    actionBtnText: {
      fontWeight: "bold",
      fontSize: 11,
      textTransform: "uppercase",
    },
    endTurnBtn: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      borderStyle: "dashed",
    },
    endTurnText: {
      color: colors.primary,
      fontWeight: "bold",
      fontSize: 14,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    // Skill List
    section: { borderRadius: 12, marginBottom: 24, borderColor: colors.border },
    sectionHeader: {
      fontSize: 18,
      fontWeight: "bold",
      marginLeft: 16,
      marginBottom: 8,
      color: colors.text,
    },
    subHeader: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 8,
      marginLeft: 16,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    listContent: { paddingHorizontal: 16, paddingBottom: 20 },
    emptyText: { color: colors.textSecondary, fontStyle: "italic" },
    // Skill Card Local Styles
    skillCard: {
      backgroundColor: colors.surface,
      marginBottom: 10,
      borderRadius: 8,
      padding: 16,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skillHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    skillName: { fontSize: 16, fontWeight: "bold", color: colors.text },
    skillType: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    costBadge: {
      backgroundColor: colors.inputBg,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    costBadgeDisabled: {
      backgroundColor: colors.error + "15",
      borderWidth: 1,
      borderColor: colors.error,
    },
    costText: { fontSize: 12, fontWeight: "bold", color: colors.text },
    costTextDisabled: { color: colors.error },
    skillBody: {
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
    },
    description: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
    useButton: {
      marginTop: 12,
      backgroundColor: colors.primary,
      paddingVertical: 10,
      borderRadius: 6,
      alignItems: "center",
    },
    useButtonDisabled: { backgroundColor: colors.border },
    useButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
    // Info Row
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
  });
