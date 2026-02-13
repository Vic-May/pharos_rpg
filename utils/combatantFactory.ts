import {
  Character,
  Combatant,
  CombatWeaponData,
  EquipmentItem,
  NpcTemplate,
} from "@/types/rpg";
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

const extractWeaponData = (
  item: EquipmentItem,
  defaultName: string,
  defaultDamage: string,
): CombatWeaponData => {
  const isFinesse = item.stats?.toLowerCase().includes("finesse");
  const isRanged =
    item.name !== "Desarmado" && item.range && item.range !== "Corpo a Corpo";

  // Lógica de atributo: Ranged/Finesse usa Destreza, resto Força
  let attr: "Força" | "Destreza" = "Força";
  if (isRanged || isFinesse) attr = "Destreza";

  let finalDamage = defaultDamage;

  if (item.damage) {
    // 1. Prioridade: Campo oficial de dano
    finalDamage = item.damage;
  } else if (item.stats && /\d+d\d+/.test(item.stats)) {
    // 2. Fallback: Se 'stats' parecer um dado (ex: "1d8+2"), usa ele
    // Isso resolve o seu caso atual onde o dano está em 'stats'
    finalDamage = item.stats;
  }

  return {
    name: item.name || defaultName,
    damage: finalDamage,
    attribute: attr,
    attackBonus: 0, // Implementar lógica de itens mágicos se houver
    range: item.range || "Corpo a Corpo",
  };
};

// --- CONVERSOR: PLAYER -> COMBATANT ---
export const playerToCombatant = (
  char: Character,
  initiativeRoll: number,
): Combatant => {
  // Cria um resumo do equipamento para mostrar no combate
  console.log("AAAAAAAAAAAA: ", char.equipment.meleeWeapon);
  const meleeData = extractWeaponData(
    char.equipment.meleeWeapon,
    "Soco",
    "1d4", // Dano base desarmado
  );

  const rangedData = extractWeaponData(
    char.equipment.rangedWeapon,
    "Pedra",
    "1d4",
  );

  return {
    id: generateSafeId(char.name), // Player geralmente usa o próprio nome como ID único ou char.id
    name: char.name,
    baseName: char.name,
    type: "player",
    image: char.image,

    // Stats
    hp: { ...char.stats.hp },
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

    weapons: {
      melee: meleeData,
      ranged: rangedData,
    },
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
    id: generateSafeId(uniqueName),
    name: uniqueName,
    image: npc.image,
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
    weapons: {},

    equipmentSummary: npc.equipment, // Já é string no NPC
    actionsDescription: npc.actions,
  };
};
