// src/data/classData.ts
import { CharacterClass, Skill, Stance } from "../types/rpg";
import { DEXTERITY_SKILLS, MARTIAL_SKILLS, ORATORY_SKILLS } from "./skillsData";

// Define a estrutura dos dados padrão de uma classe
interface ClassDefaultData {
  skills: Skill[];
  stances: [Stance, Stance]; // Sempre 2 posturas
}

export const CLASS_DATA: Record<CharacterClass, ClassDefaultData> = {
  Guerreiro: {
    stances: [
      {
        id: "gue_defensor",
        name: "Postura: Defensor",
        benefit:
          "+1 na CA. Se estiver usando escudo, pode usar Reação para impor Desvantagem em um ataque feito contra um aliado adjacente.",
        restriction:
          'Deslocamento reduzido à metade. Não pode realizar a ação de "Correr".',
        maneuver:
          "Como Reação, gaste 2 Focos para reduzir (1d8 + Constituição) o dano de um ataque contra você.",
        acBonus: 1,
      },
      {
        id: "gue_ofensiva",
        name: "Postura: Ofensiva",
        benefit:
          "Ao atacar um oponente, dobra o bônus de Proficiência ao acerto de ataque corpo a corpo.",
        restriction: '-2 na CA. Não pode usar a ação de "Esquivar".',
        maneuver: "Gaste 2 Focos para ganhar Vantagem em um ataque.",
        recovery: "Ao reduzir um inimigo a 0 PV nesta postura, recupera 1d4 de Foco.",
        acBonus: -2,
      },
    ],
    skills: MARTIAL_SKILLS,
  },

  Vanguarda: {
    stances: [
      {
        id: "van_lanceiro",
        name: "Postura: Lanceiro",
        benefit:
          "Ataques corpo a corpo ganham alcance extra (se a arma permitir).",
        restriction:
          "Não pode usar armas de fogo nesta postura e nem se movimentar voluntariamente.",
        maneuver:
          "Como Reação, inimigos que entrarem no seu alcance provocam um Ataque de Oportunidade.",
        recovery:
          "Ao reduzir a 0 PV um inimigo que se aproximou (entrou no alcance), recupera 1d4 de Foco.",
      },
      {
        id: "van_mista",
        name: "Postura: Tática Mista",
        benefit:
          "Sem Desvantagem ao disparar armas de fogo à queima-roupa (adjacente ao inimigo). Pode usar Ação Bônus para recarregar.",
        restriction:
          "Perde o benefício de alcance extra da arma de haste. Desvantagem em ataques corpo a corpo.",
        maneuver:
          "Após acertar um ataque corpo a corpo, gaste 2 Focos para realizar um disparo como Ação Bônus.",
      },
    ],
    skills: MARTIAL_SKILLS,
  },

  Mago: {
    stances: [
      {
        id: "mag_canalizador",
        name: "Postura: Canalizador",
        benefit:
          "Escolha um efeito passivo: +2 na Classe de Dificuldade (CD) ou +1 Dado de Dano em todas as magias lançadas.",
        restriction: "Não consegue recuperar Foco.",
        maneuver:
          "Contra-Magia (Reação): Quando uma criatura a até 18m conjurar uma magia, gaste Foco igual ao Círculo dela (mínimo 2) e faça um teste oposto de Inteligência (Arcanismo). Se vencer, a magia do inimigo falha e o Foco dele é gasto.",
      },
      {
        id: "mag_recuperacao",
        name: "Postura: Recuperação",
        benefit: "Vantagem em testes de Concentração.",
        restriction: "Não pode lançar magias que causem dano direto.",
        maneuver:
          "Gaste sua Ação para regenerar (2d4 + Constituição) de Foco no início do seu turno, caso não tenha sofrido dano.",
      },
    ],
    skills: [],
  },

  Apóstata: {
    stances: [
      {
        id: "apo_caos",
        name: "Postura: Caos Esperado",
        benefit:
          "Ao lançar qualquer magia, role 1d4 adicional para definir a Qualidade do Caos.",
        restriction:
          "Sujeito aos efeitos da Tabela de Caos Arcano (d100) a cada magia lançada.",
        maneuver:
          "Imediatamente após rolar o dado de Caos (1d4) ou o dado da Tabela (d100), gaste 2 Focos para rolar o dado novamente.",
      },
      {
        id: "apo_cacofonia",
        name: "Postura: Cacofonia de Espíritos",
        benefit:
          "Imune a magias de detecção (como Detectar Magia). Vantagem em testes de Furtividade.",
        restriction:
          "Não pode lançar magias. Se lançar qualquer magia, a postura é quebrada imediatamente.",
        maneuver:
          "Como Ação, atribua números de 1 a 4 às quatro criaturas mais próximas em até 9m. Role 1d4 — a criatura correspondente sofre 1d4 de dano necrótico (sem salvaguarda) e você recupera Foco igual ao dano causado.",
      },
    ],
    skills: [],
  },

  Atirador: {
    stances: [
      {
        id: "ati_franco",
        name: "Postura: Franco-atirador",
        benefit:
          "Dobra o bônus de Proficiência nas jogadas de ataque à distância e dobra o alcance da arma.",
        restriction:
          "Deslocamento torna-se 0. Se movido à força ou derrubado, a postura é quebrada imediatamente.",
        maneuver:
          "Antes de realizar um ataque, gaste 4 Focos para ignorar qualquer cobertura (exceto total) e a armadura do inimigo (ataque feito contra CA 10 + Destreza do alvo).",
        recovery: "Ao matar alguém nesta postura, recupera 1d4 de Foco.",
      },
      {
        id: "ati_barragem",
        name: "Postura: Barragem",
        benefit:
          'Ignora a propriedade "Recarga" de armas de fogo e bestas (recarregar torna-se ação livre). Ao realizar a ação de Ataque, pode fazer um ataque adicional como Ação Bônus.',
        restriction: "Perde a Proficiência nas jogadas de ataque.",
        maneuver:
          "Ao realizar a ação de Ataque, gaste 2 Focos para dobrar a quantidade de ataques daquela ação.",
      },
    ],
    skills: DEXTERITY_SKILLS,
  },

  Orador: {
    stances: [
      {
        id: "ora_inspiracao",
        name: "Postura: Inspiração",
        benefit:
          "Como Ação Bônus, escolha um aliado a até 3m. Ele ganha Vantagem em qualquer rolagem (ataque, teste ou resistência) até o início do seu próximo turno.",
        restriction:
          'Deve ser capaz de falar alto e ser ouvido. Se silenciado, a postura é quebrada. Não pode realizar a ação de "Esconder-se".',
        maneuver:
          "Gaste 2 Focos para comandar um aliado que possa ouvi-lo. Esse aliado usa sua Reação imediatamente para realizar um ataque ou se mover até metade do deslocamento.",
        recovery:
          "Se aliados matarem dois ou mais inimigos utilizando a Vantagem concedida pelos seus comandos, recupera 1d4 de Foco.",
      },
      {
        id: "ora_intimidar",
        name: "Postura: Intimidador",
        benefit:
          "Como Ação Bônus, escolha um inimigo a até 3m. Ele sofre Desvantagem em uma rolagem (ataque, teste ou resistência) até o início do seu próximo turno.",
        restriction:
          "Torna-se um alvo prioritário e ostensivo. Não pode se beneficiar de Cobertura enquanto estiver nesta postura.",
        maneuver:
          "Ao atingir um inimigo com um ataque ou interagir socialmente, gaste 2 Focos para forçá-lo a fazer um teste de Sabedoria. Se falhar, o alvo fica Amedrontado.",
      },
    ],
    skills: ORATORY_SKILLS,
  },

  Corsário: {
    stances: [
      {
        id: "cor_danca",
        name: "Postura: Dança",
        benefit:
          '+2 na CA contra ataques corpo a corpo. Pode realizar a ação "Desengajar" como Ação Bônus.',
        restriction:
          "Deve sempre se manter em movimento. Se não se mover no turno, a postura é quebrada.",
        maneuver:
          "Quando atingido por um ataque corpo a corpo, gaste 2 Focos usando Reação para reduzir o dano em 1d8 + Destreza. Se o dano for reduzido a 0, pode fazer um Ataque de Oportunidade contra o atacante.",
        recovery:
          "Caso fique 3 turnos sem ser atingido, recupera 1d4 de Foco ao entrar nesta postura.",
        acBonus: 2,
      },
      {
        id: "cor_explosao",
        name: "Postura: Explosão",
        benefit:
          "O dado de dano de armas de fogo aumenta dois passos (d6→d10, d8→d12, d10→d12+1, d12→d12+2) quando o alvo está a até 6m. Recarregar armas de fogo torna-se Ação Livre. Impacto Explosivo: ao rolar o valor máximo no dado de dano, todas as criaturas a até 1,5m do alvo sofrem 1d6 de dano de fogo sem salvaguarda.",
        restriction:
          "-2 na CA. Inimigos têm Vantagem em Ataques de Oportunidade contra você. Não pode se beneficiar de Cobertura.",
        maneuver:
          "Gaste 3 Focos para usar Carga Dupla: escolha um ponto a até 9m e crie um cone de 4,5m. Criaturas na área fazem Salvaguarda de Destreza (CD = 8 + Proficiência + Destreza): falha = dano total da arma; sucesso = metade. Após a manobra, a arma fica entupida e requer Ação Bônus para limpar.",
        recovery:
          "Se matar 2 ou mais inimigos com um único ataque (via Impacto Explosivo ou Carga Dupla), recupera 1d4 de Foco.",
        acBonus: -2,
      },
    ],
    skills: DEXTERITY_SKILLS,
  },
};
