// src/types/rpg.ts

export type AttributeName =
  | "Constituição"
  | "Força"
  | "Carisma"
  | "Sabedoria"
  | "Inteligência"
  | "Destreza";

export type CharacterClass =
  | "Guerreiro"
  | "Corsário"
  | "Vanguarda"
  | "Mago"
  | "Apóstata"
  | "Atirador"
  | "Orador";

export const MAGIC_CLASSES: CharacterClass[] = ["Mago", "Apóstata", "Orador"];

export const ALL_CLASSES: CharacterClass[] = [
  "Guerreiro",
  "Corsário",
  "Vanguarda",
  "Mago",
  "Apóstata",
  "Atirador",
  "Orador",
];

export interface Attribute {
  name: AttributeName;
  value: number;
  modifier: number; // Ex: (Valor - 10) / 2
}

export type ActionType =
  | "Padrão"
  | "Movimento"
  | "Reação"
  | "Completa"
  | "Livre"
  | "Ação Bônus";

export interface Skill {
  id: string;
  name: string;
  cost: number;
  actionType: ActionType;
  description: string;
  level: number;
}

export interface Stance {
  id: string;
  name: string;
  benefit: string; // Benefício
  restriction: string; // Restrição
  maneuver: string; // Manobra de Postura
  recovery?: string; // Recuperação (Opcional)
  acBonus?: number;
}

export type ItemType = "consumable" | "equipment" | "key";

export interface Item {
  id: string;
  name: string;
  image?: string;
  description?: string;
  quantity: number;
  type: ItemType;
  weight: number;
}

export interface EquipmentItem {
  name: string;
  stats: string;
  defense?: number;
  description?: string;
  weight: number;
}

export interface Spell {
  id: string;
  name: string;
  school: string;
  circle: number;
  description: string;
  effect: string;
  cost: number;

  // Novos campos para automação:
  isAttack: boolean; // Abre modal de ataque?
  damageFormula?: string; // Ex: "2d6"
  actionType: "standard" | "bonus" | "reaction";

  isHealing?: boolean; // Identifica se é magia de cura
  healFormula?: string; // Ex: "1d8", "2d4+2"
}

interface Ancestry {
  id: string;
  name: string;
  traitName: string;
  traitDescription: string;
}

interface Origin {
  id: string;
  name: string;
  culturalTrait: string;
  heritage: string;
  languages: string[];
}

export interface Specialization {
  id: string;
  name: string;
  classRequired: CharacterClass;
  description: string;
  // Para o Corsário, a especialização altera as posturas
  newStances?: Stance[];
  proficiencyChanges?: string; // Texto descrevendo a mudança
}

export type FeatCategory = "Geral" | "Marcial" | "Social" | "Mágico";

export interface Feat {
  id: string;
  name: string;
  category: FeatCategory;
  objective: string; // O que o jogador tem que fazer
  benefit: string; // A recompensa mecânica
  prerequisite?: string;
}

export interface Character {
  name: string;
  level: number;
  image?: string;

  class?: CharacterClass;

  ancestry?: Ancestry;

  culturalOrigin?: Origin;

  stats: {
    hp: { current: number; max: number };
    focus: { current: number; max: number };
  };

  attributes: Record<AttributeName, Attribute>;

  stances: Stance[];

  currentStanceIndex: number;

  skills: Skill[];
  spells: Spell[];

  equipment: {
    meleeWeapon: EquipmentItem;
    rangedWeapon: EquipmentItem;
    armor: EquipmentItem;
    shield: EquipmentItem;
  };

  backpack: Item[];
  grimoire?: Spell[];
  silver: number;
  backstory: string;
  trainedSkills: string[];

  deathSaves: {
    successes: number;
    failures: number;
  };

  turnActions: {
    standard: boolean;
    bonus: boolean;
    reaction: boolean;
  };
  specialization?: Specialization | null;
  feats: Feat[]; // Façanhas já desbloqueadas
}

export interface Combatant {
  // Identificação
  id: string; // ID único na sessão de combate
  templateId?: string; // ID original (do Character ou NpcTemplate)
  name: string;
  baseName?: string;
  type: "player" | "npc" | "gm";
  image?: string; // Útil para o avatar no combate

  // Stats Vitais (Obrigatórios para o combate)
  hp: { current: number; max: number };
  focus: { current: number; max: number };
  armorClass: number;
  initiative: number;
  speed?: string; // Adicionado (NPC tem, Player precisa ter)

  // Ações e Recursos
  turnActions: {
    standard: boolean;
    bonus: boolean;
    reaction: boolean;
  };
  deathSaves: {
    successes: number;
    failures: number;
  };

  // Dados de Combate
  attributes: Record<AttributeName, Attribute>;
  stances: Stance[];
  activeStanceId?: string | null; // Padronizado para ID

  skills: Skill[];
  spells: Spell[]; // Padronizado (Player.grimoire vira Combatant.spells)

  // Equipamento/Ações: Aqui aceitamos string (NPC) ou Detalhado (Player)
  // Ou simplificamos tudo para string para o combate ficar leve
  equipmentSummary?: string;
  actionsDescription?: string;
}

export interface NpcTemplate {
  id: string;
  name: string;
  image?: string;

  level: number;
  class: CharacterClass | string;
  ancestry: string;

  maxHp: number;
  hpFormula?: string;
  armorClass: number;
  acDetail?: string;
  maxFocus: number;

  attributes: Record<AttributeName, Attribute>;

  stances: Stance[];
  skills: Skill[];
  spells: Spell[];

  equipment: string;
  actions: string;

  initiativeBonus: number;
  speed: string;
}

// Exemplo de tipos para o futuro WebSocket

export type WebSocketEvent =
  | {
      type: "JOIN_SESSION";
      payload: { sessionId: string; character: Character };
    }
  | { type: "UPDATE_HP"; payload: { combatantId: string; newHp: number } }
  | {
      type: "CHANGE_STANCE";
      payload: { combatantId: string; stanceId: string; newAC: number };
    }
  | { type: "NEXT_TURN"; payload: { currentInitiative: number } };

export type ActionCostType = "standard" | "bonus" | "reaction" | "free";

export interface ResolveActionPayload {
  attackerId: string;
  targetId?: string | null;
  actionName: string;

  // Custos
  costType: ActionCostType;
  focusCost: number;

  // Efeitos
  damageAmount: number;
  healingAmount: number;
}
