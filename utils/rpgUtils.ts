import { Character, Combatant } from "@/types/rpg";

export const playerToCombatant = (
  char: Character,
  forcedId: string,
  rolledInitiative: number,
): Combatant => {
  // Calcula CA total (Base + Escudo + Des) - Simplificado
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

  return {
    id: forcedId,
    name: char.name,
    baseName: char.name,
    type: "player",
    hp: { current: char.stats.hp.current, max: char.stats.hp.max },
    initiative: rolledInitiative,
    armorClass: ac,
    currentFocus: char.stats.focus.current,
    maxFocus: char.stats.focus.max,
    attributes: char.attributes,
    equipment: Object.values(char.equipment || {})
      .map((e) => e.name)
      .join(", "), // Resumo
    actions: "", // Pode preencher com ataques básicos se quiser
    stances: char.stances || [],
    skills: char.skills || [],
    activeStanceId: null, // Começa neutro
    turnActions: {
      standard: true,
      bonus: true,
      reaction: true,
    },
    spells: char.grimoire || [],
  };
};

const getMod = (val: number) => Math.floor((val - 10) / 2);
export const formatMod = (val: number) => {
  const mod = getMod(val);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};
export const getActionKey = (
  actionString: string,
): "standard" | "bonus" | "reaction" | null => {
  if (!actionString) return null;
  const lower = actionString.toLowerCase();
  if (lower.includes("bônus") || lower.includes("bonus")) return "bonus";
  if (lower.includes("reação") || lower.includes("reacao")) return "reaction";
  return "standard";
};
