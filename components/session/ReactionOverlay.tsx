import { useAlert } from "@/context/AlertContext";
import { useCampaign } from "@/context/CampaignContext";
import { useTheme } from "@/context/ThemeContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { Combatant, ResolveActionPayload, Skill } from "@/types/rpg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AttackModal } from "../modals/AttackModal";

interface Props {
  combatant: Combatant;
}

export const ReactionOverlay = ({ combatant }: Props) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { showAlert } = useAlert();
  const { sendMessage } = useWebSocket();
  const { updateCombatant, combatants } = useCampaign(); // Necessário para alvos do ataque

  const [attackModalOpen, setAttackModalOpen] = useState(false);

  // Se já gastou a reação, não mostra nada
  if (!combatant.turnActions?.reaction) return null;

  // Filtra Skills de Reação
  const reactionSkills = combatant.skills.filter((s) => {
    const type = (s.actionType || "").toLowerCase();
    return (
      type.includes("reação") ||
      type.includes("reacao") ||
      type.includes("reaction")
    );
  });

  // --- HANDLERS ---

  // 1. Ataque de Oportunidade
  const handleOpportunityAttack = (
    targetId: string,
    hitTotal: number,
    damageTotal: number,
    isCrit: boolean,
  ) => {
    // Valida alvo
    const target = combatants.find((c) => c.id === targetId);
    if (!target) return;

    // Lógica de Acerto
    const isHit = isCrit || hitTotal >= target.armorClass;
    const finalDamage = isHit ? damageTotal : 0;

    const payload: ResolveActionPayload = {
      attackerId: combatant.id,
      targetId: targetId,
      actionName: isCrit
        ? "Ataque de Oportunidade (Crítico!)"
        : isHit
          ? "Ataque de Oportunidade"
          : "Ataque de Oportunidade (Errou)",

      // O PULO DO GATO: CostType reaction
      costType: "reaction",
      focusCost: 0,
      damageAmount: finalDamage,
      healingAmount: 0,
    };

    sendMessage("RESOLVE_ACTION", payload);
    consumeReaction();

    showAlert(isHit ? "Sucesso" : "Errou", `Reação enviada!`);
  };

  // 2. Uso de Skill Defensiva (ex: Bastião Imóvel)
  const handleUseReactionSkill = (skill: Skill) => {
    if (combatant.focus.current < skill.cost) {
      showAlert("Sem Foco", "Foco insuficiente para esta reação.");
      return;
    }

    // Payload Genérico para Skill
    const payload: ResolveActionPayload = {
      attackerId: combatant.id,
      targetId: null, // Geralmente self ou target do agressor (complexo de pegar auto, melhor deixar genérico)
      actionName: skill.name, // Ex: "Bastião Imóvel"
      costType: "reaction",
      focusCost: skill.cost,
      damageAmount: 0,
      healingAmount: 0,
    };

    sendMessage("RESOLVE_ACTION", payload);

    // Atualiza Foco Local
    updateCombatant(
      combatant.id,
      "focus",
      combatant.focus.current - skill.cost,
    );
    consumeReaction();

    showAlert("Reação", `${skill.name} ativado!`);
  };

  const consumeReaction = () => {
    const newActions = { ...combatant.turnActions, reaction: false };
    updateCombatant(combatant.id, "turnActions", newActions);

    // Avisa server que gastou a reação (opcional se o RESOLVE_ACTION já fizer isso)
    sendMessage("PLAYER_ACTION", {
      character_id: combatant.id,
      action_type: "SPEND_ACTION",
      payload: { action_key: "reaction", value: false },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="flash-alert" size={16} color="#fff" />
        <Text style={styles.headerText}>REAÇÕES DISPONÍVEIS</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* BOTÃO 1: ATAQUE DE OPORTUNIDADE (Sempre visível) */}
        <TouchableOpacity
          style={styles.reactionBtn}
          onPress={() => setAttackModalOpen(true)}
        >
          <MaterialCommunityIcons name="sword-cross" size={20} color="#fff" />
          <View>
            <Text style={styles.btnTitle}>Ataque Oportunidade</Text>
            <Text style={styles.btnSub}>Corpo-a-corpo</Text>
          </View>
        </TouchableOpacity>

        {/* BOTÃO 2+: SKILLS FILTRADAS */}
        {reactionSkills.map((skill) => (
          <TouchableOpacity
            key={skill.id}
            style={[styles.reactionBtn, { backgroundColor: "#6a1b9a" }]} // Roxo mais escuro
            onPress={() => handleUseReactionSkill(skill)}
          >
            <MaterialCommunityIcons name="shield-star" size={20} color="#fff" />
            <View>
              <Text style={styles.btnTitle}>{skill.name}</Text>
              <Text style={styles.btnSub}>{skill.cost} Foco</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal de Ataque (Reutilizado) */}
      <AttackModal
        visible={attackModalOpen}
        onClose={() => setAttackModalOpen(false)}
        attacker={combatant}
        potentialTargets={combatants} // O usuário escolhe em quem vai dar o ataque de oportunidade
        onConfirmAttack={handleOpportunityAttack}
        isGm={false}
      />
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "#4a148c", // Roxo (Reação)
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      elevation: 10,
      paddingBottom: 20, // Área segura inferior
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      gap: 6,
      backgroundColor: "rgba(0,0,0,0.2)",
    },
    headerText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 12,
      letterSpacing: 1,
    },
    scrollContent: {
      padding: 12,
      gap: 12,
    },
    reactionBtn: {
      flexDirection: "row",
      backgroundColor: "rgba(255,255,255,0.15)",
      padding: 10,
      borderRadius: 8,
      alignItems: "center",
      gap: 10,
      minWidth: 160,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.3)",
    },
    btnTitle: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 13,
    },
    btnSub: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 10,
    },
  });
