// src/data/skillData.ts
import { Skill } from "../types/rpg";

// 1. FORÇA / CONSTITUIÇÃO (Guerreiro, Vanguarda)
export const MARTIAL_SKILLS: Skill[] = [
  // Nível 1
  {
    id: "golpe_demolidor",
    name: "Golpe Demolidor",
    cost: 2,
    actionType: "Padrão",
    level: 1,
    description: "Ataque corpo a corpo. Adiciona 1 dado de dano extra2...",
    usesWeaponDamage: true, // Usa o dano da espada/machado
    weaponType: "melee", // <--- Usa a espada/machado
    bonusDamage: "1d6", // O dado extra (pode ser fixo ou dinâmico na lógica)
    damageType: "Físico",
  },
  {
    id: "vigor_ferro",
    name: "Vigor de Ferro",
    cost: 3,
    actionType: "Ação Bônus",
    level: 1,
    description: "Ignora a dor e recupera PV igual a 1d10 + Constituição.",
    isHealing: true,
    healFormula: "1d10 + @CON", // @CON será substituído pelo modificador
  },
  {
    id: "varrer_linha",
    name: "Varrer a Linha",
    cost: 4,
    actionType: "Padrão",
    weaponType: "melee", // <--- Usa a espada/machado
    level: 1,
    description: "Ataque em cone de 3m...",
    usesWeaponDamage: true,
    damageType: "Físico",
    // Cone e área geralmente são tratados manualmente ou via grid, mas o dano é calculado aqui
  },
  {
    id: "bastiao_imovel",
    name: "Bastião Imóvel",
    cost: 3,
    actionType: "Reação",
    level: 1,
    description: "Reduz o dano pela metade...",
    // Skills de reação defensiva geralmente não tem fórmula de dano
  },
  // Nível 2
  {
    id: "investida_ariete",
    name: "Investida de Aríete",
    cost: 5,
    actionType: "Padrão",
    level: 2,
    description: "Mova o dobro... Dano normal + Teste de Força...",
    weaponType: "melee", // <--- Usa a espada/machado
    usesWeaponDamage: true,
    saveRequest: {
      attribute: "Força",
      effect: "Derrubado (Prostrado)",
    },
  },
  {
    id: "concussao",
    name: "Concussão",
    cost: 3,
    actionType: "Padrão",
    level: 2,
    description:
      "Ataque focado na cabeça. Dano normal e alvo faz Salvaguarda...",
    usesWeaponDamage: true,
    weaponType: "melee", // <--- Usa a espada/machado
    saveRequest: {
      attribute: "Constituição",
      effect: "Confuso",
    },
  },
  {
    id: "martir",
    name: "Mártir",
    cost: 4,
    actionType: "Reação",
    description:
      "Quando aliado a 3m sofreria dano: Troque de lugar com ele e receba o ataque. O dano é reduzido pela metade (não acumulável com outras reduções).",
    level: 2,
  },
  {
    id: "ataque_redemoinho",
    name: "Ataque Redemoinho",
    cost: 4,
    actionType: "Padrão",
    description:
      "Realize uma única jogada de ataque e compare com a CA de todos os inimigos adjacentes (1,5m). Acerto causa dano normal da arma.",
    level: 2,
  },
];

// 2. DESTREZA (Corsário, Atirador)
export const DEXTERITY_SKILLS: Skill[] = [
  // Nível 1
  {
    id: "truque_sujo",
    name: "Truque Sujo",
    cost: 2,
    actionType: "Ação Bônus",
    description:
      "Alvo a 3m faz Salvaguarda de CON. Falha = Cego ou Prostrado até fim do próximo turno dele.",
    level: 1,
  },
  {
    id: "disparo_incapacitante",
    name: "Disparo Incapacitante",
    cost: 2,
    actionType: "Padrão",
    level: 1,
    description: "Ataque à distância. Dano normal + Efeito...",
    usesWeaponDamage: true,
    weaponType: "ranged", // <--- Usa a espada/machado
  },
  {
    id: "reflexo_relampago",
    name: "Reflexo Relâmpago",
    cost: 2,
    actionType: "Reação",
    description:
      "Ao ser alvo: Adiciona Proficiência na CA contra o ataque OU ganha Vantagem em teste de Destreza.",
    level: 1,
  },
  {
    id: "passo_esgueiro",
    name: "Passo Esgueiro",
    cost: 1,
    actionType: "Ação Bônus",
    description: "Move-se 1,5m sem provocar ataque de oportunidade.",
    level: 1,
  },
  // Nível 2
  {
    id: "movimento_dancante",
    name: "Movimento Dançante",
    cost: 3,
    actionType: "Reação",
    description:
      "Quando inimigo erra ataque corpo a corpo: Mova 3m sem atq. oportunidade. Ganha Vantagem em Furtividade ou Acrobacia até fim do turno.",
    level: 2,
  },
  {
    id: "granada_fumaca",
    name: "Granada de Fumaça",
    cost: 3,
    actionType: "Padrão",
    description:
      "Gera área de fumaça de 6m. Todos dentro ficam Cegos e invisíveis para quem está fora. Requer: 1 uso de Kit de Explosivos.",
    level: 2,
  },
  {
    id: "mira_calculada",
    name: "Mira Calculada",
    cost: 3,
    actionType: "Ação Bônus",
    level: 2,
    description: "Próximo ataque... causa +1 dado de dano da arma.",
    // Isso é um BUFF, não um ataque direto.
    // Lógica sugerida: Adiciona um status "Mira Calculada" no personagem que altera o próximo ataque.
  },
];

// 3. ORATÓRIA / CARISMA (Orador)
export const ORATORY_SKILLS: Skill[] = [
  // Nível 1
  {
    id: "comando_tatico",
    name: "Comando Tático",
    cost: 3,
    actionType: "Ação Bônus",
    description:
      "Escolha um aliado. Ele usa a Reação dele para realizar um Ataque imediatamente.",
    level: 1,
  },
  {
    id: "ultimato",
    name: "Ultimato",
    cost: 3,
    actionType: "Padrão",
    level: 1,
    description: "Inimigos em cone fazem Salvaguarda de Sabedoria...",
    saveRequest: {
      attribute: "Sabedoria",
      effect: "Intimidado",
    },
  },
  {
    id: "voz_autoridade",
    name: "A Voz da Autoridade",
    cost: 4,
    actionType: "Padrão",
    description:
      "Até 3 aliados (que possam ouvir) ganham +2 no próximo ataque ou teste de resistência.",
    level: 1,
  },
  {
    id: "palavra_coragem",
    name: "Palavra de Coragem",
    cost: 2,
    actionType: "Padrão",
    level: 1,
    description: "Um aliado recupera 1d6 + Carisma de PV.",
    isHealing: true,
    healFormula: "1d6 + @CHA",
  },
  // Nível 2
  {
    id: "intervencao_retorica",
    name: "Intervenção Retórica",
    cost: 3,
    actionType: "Reação",
    description:
      "Quando aliado a 9m sofrer dano: Reduz o dano sofrido em 1d10 + Carisma.",
    level: 2,
  },
  {
    id: "coordenacao_aliada",
    name: "Coordenação Aliada",
    cost: 5,
    actionType: "Padrão",
    description:
      "Escolha um inimigo. Dois aliados ao alcance usam Reação para atacar imediatamente. Se o 1º causar condição, o 2º tem benefício.",
    level: 2,
  },
];
