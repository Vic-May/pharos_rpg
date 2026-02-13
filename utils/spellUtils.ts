import { Spell, Character } from "@/types/rpg";

export const getCircleTheme = (circle: number) => {
  switch (circle) {
    case 1:
      return { primary: "#2e7d32", light: "#e8f5e9" }; // Verde
    case 2:
      return { primary: "#1565c0", light: "#e3f2fd" }; // Azul
    case 3:
      return { primary: "#6a1b9a", light: "#f3e5f5" }; // Roxo
    case 4:
      return { primary: "#c62828", light: "#ffebee" }; // Vermelho
    case 5:
      return { primary: "#ef6c00", light: "#fff3e0" }; // Laranja
    default:
      return { primary: "#455a64", light: "#eceff1" }; // Cinza
  }
};

/**
 Little filtro pra ver se pode aprender a maiga
 */
export const canLearnSpell = (character: Character, spell: Spell): boolean => {
  if (!spell.requiredRace) return true;
  const characterRace = character.ancestry?.name?.toLowerCase() || "";
  return characterRace === spell.requiredRace.toLowerCase();
};

/**
 Filtrozinho pra mostrar as magias disponiveis
 */
export const filterAvailableSpells = (character: Character, spells: Spell[]): Spell[] => {
  return spells.filter(spell => canLearnSpell(character, spell));
};

