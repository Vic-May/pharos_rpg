// src/context/CharacterContext.tsx
import { ANCESTRIES, CULTURAL_ORIGINS } from "@/data/origins";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { CLASS_DATA } from "../data/classData"; // <--- Importe o arquivo novo
import {
  AttributeName,
  Character,
  CharacterClass,
  EquipmentItem,
  Feat,
  Item,
  ItemType,
  MAGIC_CLASSES,
  Specialization,
  Spell,
} from "../types/rpg";

// Chave para salvar no armazenamento do celular
const STORAGE_KEY = "@rpg_sheet_data_v2";

// Dados iniciais (Padrão caso não haja nada salvo)
const INITIAL_CHARACTER: Character = {
  name: "Novo Personagem",
  level: 1,
  image: undefined,
  class: undefined,
  ancestry: undefined,
  culturalOrigin: undefined,
  deathSaves: { successes: 0, failures: 0 },

  stats: {
    hp: { current: 20, max: 20 },
    focus: { current: 10, max: 10 },
  },

  attributes: {
    Força: { name: "Força", value: 10, modifier: 0 },
    Destreza: { name: "Destreza", value: 10, modifier: 0 },
    Constituição: { name: "Constituição", value: 10, modifier: 0 },
    Inteligência: { name: "Inteligência", value: 10, modifier: 0 },
    Sabedoria: { name: "Sabedoria", value: 10, modifier: 0 },
    Carisma: { name: "Carisma", value: 10, modifier: 0 },
  },

  stances: [], // Começa sem posturas de classe
  currentStanceIndex: -1, // Começa em Postura Neutra

  skills: [], // Começa sem habilidades

  // PREENCHIMENTO SEGURO (Evita crash no Inventário)
  equipment: {
    meleeWeapon: {
      name: "Desarmado",
      stats: "1 + FOR",
      defense: 0,
      description: "Punhos.",
      weight: 0,
    },
    rangedWeapon: {
      name: "Nenhuma",
      stats: "-",
      defense: 0,
      description: "",
      weight: 0,
    },
    armor: {
      name: "Roupas Comuns",
      stats: "",
      defense: 0,
      description: "Sem proteção.",
      weight: 1,
    }, // Exemplo: Roupa pesa 1
    shield: {
      name: "Nenhum",
      stats: "",
      defense: 0,
      description: "",
      weight: 0,
    },
  },

  backpack: [],
  grimoire: [],
  silver: 0, // Geralmente começa com 0 e ganha pela Herança (Origem)
  backstory: "",
  trainedSkills: [],

  turnActions: {
    standard: true,
    bonus: true,
    reaction: true,
  },
  spells: [],
  feats: [],
};

interface CharacterContextType {
  character: Character;
  isLoading: boolean;
  updateStat: (stat: "hp" | "focus", value: number) => void;
  setStanceIndex: (index: number) => void;
  updateImage: (base64Image: string) => void;
  resetCharacter: () => void;
  updateMaxStat: (stat: "hp" | "focus", newMax: number) => void;
  updateAttribute: (attr: AttributeName, newValue: number) => void;
  updateNameAndClass: (name: string, className?: CharacterClass) => void;
  updateEquipment: (
    slot: "meleeWeapon" | "rangedWeapon" | "armor" | "shield",
    item: EquipmentItem,
  ) => void;
  updateAncestry: (ancestryId: string) => void;
  updateOrigin: (originId: string) => void;
  updateSilver: (value: number) => void;
  performShortRest: () => void;
  performLongRest: () => void;
  updateBackstory: (text: string) => void;
  toggleTrainedSkill: (skillName: string) => void;
  addItem: (
    name: string,
    type: ItemType,
    quantity: number,
    weight: number,
  ) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, change: number) => void;
  addSpell: (spell: Spell) => void;
  removeSpell: (spellId: string) => void;
  updateDeathSave: (type: "success" | "failure", value: number) => void;
  updateLevel: (newLevel: number) => void;
  updateCurrentStat: (stat: "hp" | "focus", newValue: number) => void;
  updateItem: (itemId: string, data: Partial<Item>) => void;
  importCharacter: (data: any) => void;
  getLoadMetrics: () => {
    currentLoad: number;
    maxLoad: number;
    isOverloaded: boolean;
  };
  toggleAction: (type: "standard" | "bonus" | "reaction") => void;
  endTurn: () => void;
  applySpecialization: (spec: Specialization) => void;
  addFeat: (feat: Feat) => void;
  removeFeat: (featId: string) => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(
  undefined,
);

export const CharacterProvider = ({ children }: { children: ReactNode }) => {
  const [character, setCharacter] = useState<Character>(INITIAL_CHARACTER);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Efeito para CARREGAR os dados ao iniciar o app
  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          setCharacter(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 2. Efeito para SALVAR os dados automaticamente sempre que 'character' mudar
  useEffect(() => {
    // Só salva se NÃO estiver carregando (para evitar sobrescrever dados salvos com o inicial)
    if (!isLoading) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(character));
        } catch (e) {
          console.error("Erro ao salvar dados:", e);
        }
      };
      saveData();
    }
  }, [character, isLoading]);

  // Função para atualizar HP/Foco
  const updateStat = (stat: "hp" | "focus", change: number) => {
    setCharacter((prev) => {
      const currentVal = prev.stats[stat].current;
      const maxVal = prev.stats[stat].max;
      const newValue = Math.min(Math.max(currentVal + change, 0), maxVal);

      // Lógica de Reset de Death Saves
      let newDeathSaves = prev.deathSaves;
      if (stat === "hp" && newValue > 0) {
        newDeathSaves = { successes: 0, failures: 0 };
      }

      return {
        ...prev,
        stats: {
          ...prev.stats,
          [stat]: { ...prev.stats[stat], current: newValue },
        },
        deathSaves: newDeathSaves, // Atualiza ou reseta
      };
    });
  };

  // Nova função para controlar os Death Saves
  const updateDeathSave = (type: "success" | "failure", value: number) => {
    setCharacter((prev) => ({
      ...prev,
      deathSaves: {
        ...prev.deathSaves,
        [type === "success" ? "successes" : "failures"]: value,
      },
    }));
  };

  const setStanceIndex = (index: number) => {
    setCharacter((prev) => ({
      ...prev,
      currentStanceIndex: index as any, // Cast para any ou atualize a tipagem de Character para aceitar -1
    }));
  };

  const resetCharacter = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setCharacter(INITIAL_CHARACTER);
    } catch (e) {
      console.error("Erro ao resetar:", e);
    }
  };

  const updateImage = (uri: string) => {
    setCharacter((prev) => ({ ...prev, image: uri }));
  };

  // 1. Função para atualizar Vida/Foco MÁXIMOS
  const updateMaxStat = (stat: "hp" | "focus", newMax: number) => {
    setCharacter((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: {
          ...prev.stats[stat], // Mantém o 'current' que já estava
          max: newMax, // Altera SÓ o máximo
        },
      },
    }));
  };

  // 2. Função para atualizar Atributos e Recalcular Modificador
  const updateAttribute = (attr: AttributeName, newValue: number) => {
    // LÓGICA DE LIMITE:
    // Math.max(0, ...) garante que não seja menor que 0
    // Math.min(..., 20) garante que não seja maior que 20
    const clampedValue = Math.max(0, Math.min(newValue, 20));

    // Calcula o modificador com base no valor limitado
    const newModifier = Math.floor((clampedValue - 10) / 2);

    setCharacter((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attr]: {
          ...prev.attributes[attr],
          value: clampedValue, // Usa o valor limitado
          modifier: newModifier,
        },
      },
    }));
  };

  // 3. Função para atualizar Nome e Classe
  const updateNameAndClass = (name: string, className?: CharacterClass) => {
    // 1. Busca os dados padrão da nova classe selecionada

    if (!className) {
      setCharacter((prev) => ({ ...prev, name }));
      return;
    }

    const newClassData = CLASS_DATA[className];

    // Segurança: Caso você ainda não tenha preenchido os dados daquela classe no arquivo
    if (!newClassData || !newClassData.skills || !newClassData.stances) {
      console.warn(`Dados faltantes para a classe ${className}`);
      // Atualiza só o nome e classe para não quebrar o app
      setCharacter((prev) => ({ ...prev, name, class: className }));
      return;
    }

    // 2. Atualiza o personagem substituindo Habilidades e Posturas
    setCharacter((prev) => ({
      ...prev,
      name,
      class: className,
      // Substituição Automática:
      skills: newClassData.skills,
      stances: newClassData.stances,
      currentStanceIndex: -1, // Reseta para a primeira postura

      // Opcional: Se a nova classe NÃO for mágica, você pode querer limpar o grimório
      grimoire: MAGIC_CLASSES.includes(className) ? prev.grimoire : [],
    }));
  };

  const updateEquipment = (
    slot: "meleeWeapon" | "rangedWeapon" | "armor" | "shield",
    item: EquipmentItem,
  ) => {
    setCharacter((prev) => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [slot]: item,
      },
    }));
  };

  const updateAncestry = (ancestryId: string) => {
    const ancestryData = ANCESTRIES.find((a) => a.id === ancestryId);
    if (!ancestryData) return;

    // Acha a primeira origem compatível com essa ancestralidade para ser o padrão
    const defaultOrigin = CULTURAL_ORIGINS.find(
      (o) => o.ancestryId === ancestryId,
    );

    setCharacter((prev) => ({
      ...prev,
      ancestry: {
        id: ancestryData.id,
        name: ancestryData.name,
        traitName: ancestryData.trait.name,
        traitDescription: ancestryData.trait.description,
      },
      // Reseta a origem para a primeira compatível (ou vazio se não achar)
      culturalOrigin: defaultOrigin
        ? {
            id: defaultOrigin.id,
            name: defaultOrigin.name,
            culturalTrait: defaultOrigin.culturalTrait,
            heritage: defaultOrigin.heritage,
            languages: defaultOrigin.languages,
          }
        : prev.culturalOrigin,
    }));
  };

  // Função para mudar apenas a Origem (dentro da mesma ancestralidade)
  const updateOrigin = (originId: string) => {
    const originData = CULTURAL_ORIGINS.find((o) => o.id === originId);
    if (!originData) return;

    setCharacter((prev) => ({
      ...prev,
      culturalOrigin: {
        id: originData.id,
        name: originData.name,
        culturalTrait: originData.culturalTrait,
        heritage: originData.heritage,
        languages: originData.languages,
      },
    }));
  };

  const updateSilver = (value: number) => {
    setCharacter((prev) => ({ ...prev, silver: Math.max(0, value) }));
  };

  const performShortRest = () => {
    setCharacter((prev) => {
      const hpMax = prev.stats.hp.max;
      const focusMax = prev.stats.focus.max;

      // Calcula a cura (metade do total)
      const hpHeal = Math.floor(hpMax / 2);
      const focusHeal = Math.floor(focusMax / 2);

      // Soma ao atual, mas não deixa passar do máximo
      const newHp = Math.min(hpMax, prev.stats.hp.current + hpHeal);
      const newFocus = Math.min(focusMax, prev.stats.focus.current + focusHeal);

      return {
        ...prev,
        stats: {
          hp: { ...prev.stats.hp, current: newHp },
          focus: { ...prev.stats.focus, current: newFocus },
        },
      };
    });
  };

  const performLongRest = () => {
    setCharacter((prev) => ({
      ...prev,
      stats: {
        hp: { ...prev.stats.hp, current: prev.stats.hp.max },
        focus: { ...prev.stats.focus, current: prev.stats.focus.max },
      },
    }));
  };

  const updateBackstory = (text: string) => {
    setCharacter((prev) => ({ ...prev, backstory: text }));
  };

  const toggleTrainedSkill = (skillName: string) => {
    setCharacter((prev) => {
      const skills = prev.trainedSkills || []; // Segurança caso seja undefined
      const exists = skills.includes(skillName);

      let newSkills;
      if (exists) {
        // Remove se já existir
        newSkills = skills.filter((s) => s !== skillName);
      } else {
        // Adiciona se não existir
        newSkills = [...skills, skillName];
      }

      return { ...prev, trainedSkills: newSkills };
    });
  };

  // 1. Adicionar novo item
  const addItem = (
    name: string,
    type: ItemType,
    quantity: number,
    weight: number,
  ) => {
    const newItem: Item = {
      id: Date.now().toString(), // Gera um ID único simples
      name,
      type,
      quantity,
      weight,
      // isKeyItem: type === "key", // Mantendo compatibilidade legado se necessário
    };

    setCharacter((prev) => ({
      ...prev,
      backpack: [...prev.backpack, newItem],
    }));
  };

  // 2. Remover item completamente
  const removeItem = (itemId: string) => {
    setCharacter((prev) => ({
      ...prev,
      backpack: prev.backpack.filter((item) => item.id !== itemId),
    }));
  };

  // 3. Alterar quantidade (Usar item ou achar mais)
  const updateItemQuantity = (itemId: string, change: number) => {
    setCharacter((prev) => ({
      ...prev,
      backpack: prev.backpack
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + change;
            return { ...item, quantity: Math.max(0, newQty) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0), // Remove automaticamente se chegar a 0
    }));
  };

  const addSpell = (spell: Spell) => {
    // Evita duplicatas
    const exists = character.grimoire?.some((s) => s.id === spell.id);
    if (exists) return;

    setCharacter((prev) => ({
      ...prev,
      grimoire: [...(prev.grimoire || []), spell],
    }));
  };

  const removeSpell = (spellId: string) => {
    setCharacter((prev) => ({
      ...prev,
      grimoire: (prev.grimoire || []).filter((s) => s.id !== spellId),
    }));
  };

  const updateLevel = (newLevel: number) => {
    const validLevel = Math.max(1, Math.min(newLevel, 20));

    setCharacter((prev) => {
      let updatedSkills = prev.skills;

      // 1. Verifica se o personagem tem classe
      if (prev.class && CLASS_DATA[prev.class]) {
        // Pega TODAS as skills possíveis da classe (do arquivo de dados)
        const allClassSkills = CLASS_DATA[prev.class].skills;

        // 2. Filtra skills que:
        // A) São do nível novo (ou menor)
        // B) O personagem AINDA NÃO TEM na ficha
        const newSkillsToAdd = allClassSkills.filter(
          (refSkill) =>
            (refSkill.level || 1) <= validLevel && // Disponível no nível atual ou inferior
            !prev.skills.some((s) => s.id === refSkill.id), // Evita duplicatas (já aprendida)
        );

        // 3. Se tiver novidade, adiciona à lista
        if (newSkillsToAdd.length > 0) {
          // Mantém as antigas e adiciona as novas no final
          updatedSkills = [...prev.skills, ...newSkillsToAdd];
        }
      }

      return {
        ...prev,
        level: validLevel,
        skills: updatedSkills, // Salva a lista atualizada
      };
    });
  };

  const updateCurrentStat = (stat: "hp" | "focus", newValue: number) => {
    setCharacter((prev) => {
      const maxVal = prev.stats[stat].max;
      // Garante que não seja menor que 0 nem maior que o Máximo
      const validValue = Math.max(0, Math.min(newValue, maxVal));

      return {
        ...prev,
        stats: {
          ...prev.stats,
          [stat]: { ...prev.stats[stat], current: validValue },
        },
      };
    });
  };

  const updateItem = (itemId: string, data: Partial<Item>) => {
    setCharacter((prev) => ({
      ...prev,
      backpack: prev.backpack.map((item) =>
        item.id === itemId ? { ...item, ...data } : item,
      ),
    }));
  };

  const importCharacter = (importedData: any) => {
    setCharacter((prev) => {
      // Pega a estrutura zerada (com campos novos) e joga os dados importados por cima
      const migratedCharacter: Character = {
        ...INITIAL_CHARACTER, // Garante level, deathSaves, etc
        ...importedData, // Sobrescreve com nome, itens, xp antigos

        // Garante que objetos aninhados não quebrem
        stats: {
          ...INITIAL_CHARACTER.stats,
          ...(importedData.stats || {}),
        },
        attributes: {
          ...INITIAL_CHARACTER.attributes,
          ...(importedData.attributes || {}),
        },

        // Garante os campos novos explicitamente se vierem nulos
        level: importedData.level || 1,
        deathSaves: importedData.deathSaves || { successes: 0, failures: 0 },
      };

      return migratedCharacter;
    });
  };

  const getLoadMetrics = () => {
    // A. Calcula peso da Mochila (Peso * Quantidade)
    const backpackWeight = character.backpack.reduce((total, item) => {
      return total + (item.weight || 0) * item.quantity;
    }, 0);

    // B. Calcula peso do Equipamento (Arma, Armadura, etc que estão equipados)
    const equipmentWeight = Object.values(character.equipment).reduce(
      (total, item) => {
        return total + (item.weight || 0);
      },
      0,
    );

    const currentLoad = parseFloat(
      (backpackWeight + equipmentWeight).toFixed(1),
    ); // Arredonda para 1 casa decimal

    // C. Calcula Carga Máxima (5x Força)
    const strength = character.attributes["Força"]?.value || 0;
    const maxLoad = strength * 5;

    return {
      currentLoad,
      maxLoad,
      isOverloaded: currentLoad > maxLoad,
    };
  };

  const toggleAction = (type: "standard" | "bonus" | "reaction") => {
    setCharacter((prev) => {
      // 1. CRIA A REDE DE SEGURANÇA
      // Se prev.turnActions não existir, usa um objeto padrão "tudo disponível"
      const currentActions = prev.turnActions || {
        standard: true,
        bonus: true,
        reaction: true,
      };

      return {
        ...prev,
        turnActions: {
          ...currentActions, // Espalha o atual (ou o padrão criado agora)
          [type]: !currentActions[type], // Inverte o valor com segurança
        },
      };
    });
  };

  // Função para encerrar o turno (Reseta tudo para true)
  const endTurn = () => {
    setCharacter((prev) => ({
      ...prev,
      turnActions: {
        standard: true,
        bonus: true,
        reaction: true,
      },
    }));
  };

  const applySpecialization = (spec: Specialization) => {
    let updatedCharacter = { ...character, specialization: spec };

    if (spec.classRequired === "Corsário" && spec.newStances) {
      updatedCharacter.stances = spec.newStances;
      updatedCharacter.currentStanceIndex = -1;
      // updatedCharacter.activeStanceId = null;
    }

    // Garante que feats exista no objeto salvo, mesmo que vazio
    if (!updatedCharacter.feats) {
      updatedCharacter.feats = [];
    }

    setCharacter(updatedCharacter);
    // saveCharacter(updatedCharacter);
  };

  const addFeat = (feat: Feat) => {
    // PROTEÇÃO: Usa ?. para não quebrar se feats for undefined
    // E usa ?? [] para garantir que seja um array na verificação
    if (character.feats?.some((f) => f.id === feat.id)) return;

    const updatedCharacter = {
      ...character,
      // Se character.feats for undefined, usa [] como base
      feats: [...(character.feats || []), feat],
    };

    setCharacter(updatedCharacter);
    // saveCharacter(updatedCharacter); // Se você tiver função de salvar persistente
  };

  const removeFeat = (featId: string) => {
    const updatedCharacter = {
      ...character,
      // Filtra mantendo apenas os que NÃO são o ID passado
      feats: character.feats?.filter((f) => f.id !== featId) || [],
    };

    setCharacter(updatedCharacter);
    // saveCharacter(updatedCharacter); // Se você usa persistência
  };

  return (
    <CharacterContext.Provider
      value={{
        character,
        isLoading,
        updateStat,
        updateImage,
        setStanceIndex,
        resetCharacter,
        updateMaxStat,
        updateAttribute,
        updateNameAndClass,
        updateEquipment,
        updateAncestry,
        updateOrigin,
        updateSilver,
        performShortRest,
        performLongRest,
        updateBackstory,
        toggleTrainedSkill,
        addItem,
        removeItem,
        updateItemQuantity,
        addSpell,
        removeSpell,
        updateDeathSave,
        updateLevel,
        updateCurrentStat,
        updateItem,
        importCharacter,
        getLoadMetrics,
        toggleAction,
        endTurn,
        applySpecialization,
        addFeat,
        removeFeat,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context)
    throw new Error("useCharacter must be used within a CharacterProvider");
  return context;
};
