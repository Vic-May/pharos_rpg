import { Character, Combatant, NpcTemplate } from "@/types/rpg";
import { generateSafeId } from "@/utils/stringUtils";

const playerArmor = (char: Character) => {
  const dexMod = char.attributes["Destreza"].modifier || 0;
  const armorDef = char.equipment?.armor?.defense || 0;
  const shieldDef = char.equipment?.shield?.defense || 0;

  let ac = 0;
  if (armorDef === 0) {
    ac = 10 + dexMod;
  } else if (armorDef >= 16) {
    ac = armorDef;
  } else if (armorDef >= 13) {
    ac = armorDef + Math.min(dexMod, 2);
  } else {
    ac = armorDef + dexMod;
  }
  ac += shieldDef;

  return ac;
};
// --- CONVERSOR: PLAYER -> COMBATANT ---
export const playerToCombatant = (
  char: Character,
  initiativeRoll: number,
): Combatant => {
  // Cria um resumo do equipamento para mostrar no combate
  const equipSummary = [
    char.equipment.meleeWeapon?.name,
    char.equipment.rangedWeapon?.name,
    char.equipment.armor?.name,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: char.name, // Player geralmente usa o próprio nome como ID único ou char.id
    name: char.name,
    baseName: char.name,
    type: "player",
    image: char.image,

    // Stats
    hp: { ...char.stats.hp }, // Copia para não alterar o original por referência
    focus: { ...char.stats.focus },
    armorClass: playerArmor(char),
    initiative: initiativeRoll,

    // Listas
    attributes: char.attributes,
    stances: char.stances,
    activeStanceId: null, // Player começa sem postura ou usa char.currentStanceIndex se quiser persistir

    // Mapeamentos importantes
    skills: char.skills,
    spells: char.grimoire || [], // Mapeia Grimório para Spells

    // Inicializa estado de turno
    turnActions: { standard: true, bonus: true, reaction: true },
    deathSaves: { successes: 0, failures: 0 },

    equipmentSummary: equipSummary,
    // actionsDescription: "Ações do Jogador...", // Pode deixar vazio ou automatizar
  };
};

// --- CONVERSOR: NPC -> COMBATANT ---
export const npcToCombatant = (
  npc: NpcTemplate,
  initiativeRoll: number,
  instanceId: number = 1,
): Combatant => {
  // Gera nome único: "Goblin #1", "Goblin #2"
  const uniqueName = `${npc.name} #${instanceId}`;

  return {
    id: generateSafeId(uniqueName), // Gera ID único para o combate
    name: uniqueName,
    baseName: npc.name,
    type: "npc",

    // Stats (Copia direta do Template)
    hp: { current: npc.maxHp, max: npc.maxHp },
    focus: { current: npc.maxFocus, max: npc.maxFocus },
    armorClass: npc.armorClass,
    initiative: initiativeRoll,

    attributes: npc.attributes,
    stances: npc.stances,
    activeStanceId: null, // NPCs geralmente começam neutros

    skills: npc.skills,
    spells: npc.spells,

    turnActions: { standard: true, bonus: true, reaction: true },
    deathSaves: { successes: 0, failures: 0 },

    equipmentSummary: npc.equipment, // Já é string no NPC
    actionsDescription: npc.actions,
  };
};
