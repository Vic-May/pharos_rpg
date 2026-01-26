import { Feat, Specialization, Stance } from "@/types/rpg";

// --- DADOS DO CORSÁRIO (POSTURAS NOVAS) ---
const SWORD_PATH_STANCES: Stance[] = [
  {
    id: "duelo",
    name: "Duelo",
    acBonus: 3, // +3 CA vs corpo a corpo (simplificado para geral ou condicional no componente)
    benefit:
      "+3 CA vs Corpo a Corpo. Ação Bônus: Desengajar (atravessa inimigos).",
    restriction: "Mover min 3m/turno. Sem armas de duas mãos.",
    maneuver:
      "Reduzir dano em 1d10+DES. Se 0, contra-ataque com Vantagem. (2 Focos - Reação)",
    recovery: "3 turnos sem ser atingido: recupere 1d4 Focos.",
  },
  {
    id: "corte_fantasma",
    name: "Corte Fantasma",
    acBonus: 0,
    benefit:
      "Ataque adicional na Ação de Ataque. +2 Dano fixo com armas elegantes.",
    restriction:
      "Inimigos têm Vantagem em Ataque de Oportunidade. Apenas 1 arma elegante.",
    maneuver:
      "Redemoinho de Aço: Ataque único contra todos adjacentes. Move 1,5m por acerto. (4 Focos - Ação)",
    recovery: "Reduzir 2+ inimigos a 0 PV no turno: recupere 1d4 Focos.",
  },
];

const GUN_PATH_STANCES: Stance[] = [
  {
    id: "queima_roupa",
    name: "Queima-Roupa",
    acBonus: 0, // O bônus é CON, calculado dinamicamente no componente de combate
    benefit: "Sem desvantagem à distância corpo-a-corpo. Soma CON na CA.",
    restriction: "Movimento máx metade do deslocamento.",
    maneuver:
      "O Troco: Ao ser atingido corpo-a-corpo, atira (sem gastar munição). 1d10 Fogo + Empurrão 1,5m. (2 Focos - Reação)",
    recovery: "Matar inimigo a até 1,5m: recupere 1d4 Focos.",
  },
  {
    id: "terra_arrasada",
    name: "Terra Arrasada",
    acBonus: -2,
    benefit:
      "Ignora Resistência a Perfurante. Bacamarte causa dano total no alcance máximo.",
    restriction: "-2 CA. Empurrado 1,5m para trás a cada disparo.",
    maneuver:
      "Chuva de Chumbo: Cone de 4,5m. Salvaguarda de DES. Falha: Dano da arma + Dano extra. (4 Focos - Ação)",
    recovery: "Atingir 3+ inimigos com um ataque/manobra: recupere 1d4 Focos.",
  },
];

// --- LISTA DE ESPECIALIZAÇÕES ---
export const SPECIALIZATIONS: Specialization[] = [
  // GUERREIRO
  {
    id: "guerreiro_encouracado",
    name: "Encouraçado",
    classRequired: "Guerreiro",
    description: "Foco total em defesa e proteção.",
  },
  {
    id: "guerreiro_encantado",
    name: "Guerreiro Encantado",
    classRequired: "Guerreiro",
    description: "Usa magia para aprimorar armas e armaduras.",
  },
  {
    id: "guerreiro_espada_escudo",
    name: "Espada e Escudo",
    classRequired: "Guerreiro",
    description: "Mestre na combinação clássica.",
  },

  // VANGUARDA
  {
    id: "vanguarda_flanqueador",
    name: "Flanqueador",
    classRequired: "Vanguarda",
    description: "Especialista em punir inimigos fora de posição.",
  },
  {
    id: "vanguarda_lanceiro",
    name: "Lanceiro",
    classRequired: "Vanguarda",
    description: "Mestre em alcance e manter a linha.",
  },
  {
    id: "vanguarda_distraidor",
    name: "Distraidor",
    classRequired: "Vanguarda",
    description: "Atrai a atenção para criar aberturas.",
  },

  // MAGO
  {
    id: "mago_glifista",
    name: "Glifista",
    classRequired: "Mago",
    description: "Especialista em runas e preparo de campo.",
  },
  {
    id: "mago_alquimista",
    name: "Alquimista",
    classRequired: "Mago",
    description: "Poções, elixires e explosivos.",
  },
  {
    id: "mago_artificista",
    name: "Artificista",
    classRequired: "Mago",
    description: "Canaliza magia através de objetos e vapor.",
  },

  // CORSÁRIO (COM LÓGICA ESPECIAL)
  {
    id: "corsario_espada",
    name: "Caminho da Espada",
    classRequired: "Corsário",
    description:
      "Mestre da lâmina, perde proficiência com armas de fogo curtas.",
    newStances: SWORD_PATH_STANCES,
    proficiencyChanges:
      "Perde: Armas de Fogo Curtas. Ganha: Novas Posturas de Espadachim.",
  },
  {
    id: "corsario_bacamarte",
    name: "Caminho do Bacamarte",
    classRequired: "Corsário",
    description: "Artilharia móvel, perde proficiência com armas elegantes.",
    newStances: GUN_PATH_STANCES,
    proficiencyChanges:
      "Perde: Armas Elegantes. Ganha: Recarga como Ação Bônus e Novas Posturas.",
  },

  // ... Adicionar Apóstata, Atirador e Orador conforme o texto ...
];

// --- LISTA DE FAÇANHAS ---
export const FEATS_DATA: Feat[] = [
  // GERAIS
  {
    id: "habilidoso",
    name: "Habilidoso",
    category: "Geral",
    objective: "Treinamento rigoroso ou Crítico decisivo com atributo.",
    benefit: "+1 em dois Atributos (máx 18).",
  },
  {
    id: "competente",
    name: "Competente",
    category: "Geral",
    objective: "Mentor, livro raro ou feito notável com perícia.",
    benefit: "Nova Perícia e o Dobro de Proficiência em uma já conhecida.",
  },
  {
    id: "vigoroso",
    name: "Vigoroso",
    category: "Geral",
    objective: "Sobreviver a 0 PV ou doença potente.",
    benefit: "+1 CON (máx 18). +1 PV por nível.",
  },
  {
    id: "iniciativa",
    name: "Iniciativa Aprimorada",
    category: "Geral",
    objective: "Frustrar emboscada ou reagir primeiro em surpresa.",
    benefit: "Soma SAB na Iniciativa. Não pode ser Surpreendido.",
  },
  {
    id: "sortudo",
    name: "Sortudo",
    category: "Geral",
    objective: "Escapar da morte por acaso ou vencer aposta de alto risco.",
    benefit: "Gastar 3 Focos para re-rolar um d20 (1/descanso).",
  },

  // MARCIAIS
  {
    id: "matador_mago",
    name: "Matador de Mago",
    category: "Marcial",
    objective: "Derrotar conjurador sozinho ou destruir foco.",
    benefit: "Reação para atacar quem conjura a 1,5m (impõe Desvantagem).",
  },
  {
    id: "fortemente_armadurado",
    name: "Fortemente Armadurado",
    category: "Marcial",
    objective: "Sofrer dano massivo (75% PV) de armadura pesada e ficar de pé.",
    benefit:
      "Resistência a corte/perfuro/concussão (não-mágico) com Armadura Pesada.",
  },
  {
    id: "guerreiro_montado",
    name: "Guerreiro Montado",
    category: "Marcial",
    objective: "Adestrar montaria e lutar sem cair.",
    benefit: "Comandar montarias e vantagem tática montada.",
  },
  {
    id: "medico_campo",
    name: "Médico de Campo",
    category: "Marcial",
    objective: "Estabilizar aliado (0 PV) em combate sem magia.",
    benefit: "Ação: Kit Médico cura 1d6+Medicina. Estabiliza e cura 1 PV auto.",
  },
  {
    id: "especialista_polvora",
    name: "Especialista em Pólvora",
    category: "Marcial",
    objective: "Fabricar munição precária ou consertar arma em luta.",
    benefit: "Ignora 'Recarga'. 1 Foco (Bônus): Destravar ou criar munição.",
  },

  // SOCIAIS
  {
    id: "ator",
    name: "Ator",
    category: "Social",
    objective: "Infiltração com identidade falsa ou performance pública.",
    benefit: "+1 CAR (máx 18). Vantagem em Enganação/Atuação disfarçado.",
  },
  {
    id: "lider",
    name: "Líder",
    category: "Social",
    objective: "Reanimar grupo, resolver conflito interno ou liderar vitória.",
    benefit: "Discurso (Descanso Longo): PV Temp (CAR + Nível) aos aliados.",
  },
  {
    id: "negociador",
    name: "Negociador",
    category: "Social",
    objective: "Contrato vantajoso, lucro alto ou suborno de autoridade.",
    benefit:
      "Compra -20%, Venda +20%. Habilidade: Suborno automático (1/descanso).",
  },

  // MÁGICOS
  {
    id: "poliglota",
    name: "Poliglota",
    category: "Mágico",
    objective: "Tradutor em crise, decifrar texto antigo ou imersão.",
    benefit: "2 idiomas, +1 INT (máx 18), comunicação rudimentar universal.",
  },
  {
    id: "mente_ferro",
    name: "Mente de Ferro",
    category: "Mágico",
    objective: "Manter concentração após muito dano.",
    benefit:
      "Vantagem em CON para Concentração. Pode manter 2 magias (falha perde ambas).",
  },
  {
    id: "especialista_elemental",
    name: "Especialista Elemental",
    category: "Mágico",
    objective: "Estudo obsessivo ou sobreviver a dano elemental massivo.",
    benefit:
      "Ignora Resistência ao elemento escolhido. Rola novamente dados '1' de dano.",
  },
];
