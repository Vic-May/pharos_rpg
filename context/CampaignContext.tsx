import { npcToCombatant, playerToCombatant } from "@/utils/combatantFactory";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { CLASS_DATA } from "../data/classData"; // <--- 1. IMPORTANTE: Importar os dados
import { CharacterClass, Combatant, NpcTemplate } from "../types/rpg";

interface CampaignContextType {
  combatants: Combatant[];
  addCombatant: (
    name: string,
    hp: number,
    init: number,
    type: "player" | "npc",
    details?: Partial<Combatant>,
  ) => void;
  removeCombatant: (id: string) => void;
  updateCombatant: (
    id: string,
    field:
      | "hp"
      | "initiative"
      | "focus"
      | "activeStanceId"
      | "turnActions"
      | "armorClass"
      | "deathSaves",
    value: any,
  ) => void;
  sortCombat: () => void;
  clearCombat: () => void;

  npcLibrary: NpcTemplate[];
  saveNpcToLibrary: (npc: Omit<NpcTemplate, "id">) => void;
  deleteNpcFromLibrary: (id: string) => void;
  updateNpcInLibrary: (id: string, npc: Partial<NpcTemplate>) => void;

  diceHistory: string[];
  addDiceRoll: (roll: string) => void;
  endTurnCombatant: (id: string) => void;

  setCombatants: React.Dispatch<React.SetStateAction<Combatant[]>>;

  activeTurnId: string | null;
  setActiveTurnId: React.Dispatch<React.SetStateAction<string | null>>;

  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  addLog: (message: string) => void;
}

const CampaignContext = createContext<CampaignContextType>(
  {} as CampaignContextType,
);

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [npcLibrary, setNpcLibrary] = useState<NpcTemplate[]>([]);
  const [diceHistory, setDiceHistory] = useState<string[]>([]);
  const [activeTurnId, setActiveTurnId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- 2. CARREGAR DADOS AO INICIAR ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedNpcs = await AsyncStorage.getItem("@rpg_npc_library");
        if (savedNpcs) {
          setNpcLibrary(JSON.parse(savedNpcs));
        }
      } catch (error) {
        console.error("Erro ao carregar NPCs:", error);
      } finally {
        setIsLoaded(true); // Marca que o carregamento terminou
      }
    };
    loadData();
  }, []);

  // --- 3. SALVAR AUTOMATICAMENTE QUANDO MUDAR ---
  useEffect(() => {
    const saveData = async () => {
      if (isLoaded) {
        // Só salva se já tiver carregado os dados iniciais
        try {
          await AsyncStorage.setItem(
            "@rpg_npc_library",
            JSON.stringify(npcLibrary),
          );
        } catch (error) {
          console.error("Erro ao salvar NPCs:", error);
        }
      }
    };
    saveData();
  }, [npcLibrary, isLoaded]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message].slice(-50)); // Mantém apenas os últimos 50
  };

  const populateClassData = (npc: Partial<NpcTemplate>) => {
    if (npc.class && CLASS_DATA[npc.class as CharacterClass]) {
      const classInfo = CLASS_DATA[npc.class as CharacterClass];
      const npcLevel = npc.level || 1;

      const autoSkills = classInfo.skills.filter(
        (s) => (s.level || 1) <= npcLevel,
      );
      const autoStances = classInfo.stances;

      return {
        ...npc,
        skills: autoSkills,
        stances: autoStances,
      };
    }
    return npc;
  };

  // --- Lógica de Combate ---
  // const addCombatant = (
  //   baseName: string,
  //   hp: number,
  //   initiative: number,
  //   type: "player" | "npc",
  //   details?: Partial<Combatant> & { maxFocus?: number },
  // ) => {
  //   setCombatants((prev) => {
  //     const count = prev.filter((c) => c.baseName === baseName).length;
  //     const name = type === "npc" ? `${baseName} #${count + 1}` : baseName;

  //     // DEFINIÇÃO CORRETA DO FOCO
  //     // Tenta pegar do objeto 'focus' estruturado ou da propriedade 'maxFocus' antiga
  //     const maxFocusVal = details?.focus?.max || details?.maxFocus || 0;
  //     const currentFocusVal = details?.focus?.current ?? maxFocusVal;

  //     const newCombatant: Combatant = {
  //       id: Date.now().toString() + Math.random(),
  //       name,
  //       baseName,
  //       initiative,
  //       hp: { current: hp, max: hp },
  //       // AQUI ESTAVA O ERRO: Agora usamos as variáveis calculadas acima
  //       focus: { current: currentFocusVal, max: maxFocusVal },
  //       type,
  //       armorClass: details?.armorClass || 10,
  //       attributes: details?.attributes || {
  //         Força: { name: "Força", value: 10, modifier: 0 },
  //         Destreza: { name: "Destreza", value: 10, modifier: 0 },
  //         Constituição: { name: "Constituição", value: 10, modifier: 0 },
  //         Inteligência: { name: "Inteligência", value: 10, modifier: 0 },
  //         Sabedoria: { name: "Sabedoria", value: 10, modifier: 0 },
  //         Carisma: { name: "Carisma", value: 10, modifier: 0 },
  //       },
  //       equipment: details?.equipment,
  //       actions: details?.actions,
  //       stances: details?.stances || [],
  //       skills: details?.skills || [],
  //       spells: details?.spells || [],
  //       activeStanceId: null,
  //       turnActions: { standard: true, bonus: true, reaction: true },
  //       deathSaves: { successes: 0, failures: 0 }, // Inicializa death saves
  //     };

  //     return [...prev, newCombatant].sort(
  //       (a, b) => b.initiative - a.initiative,
  //     );
  //   });
  // };
  const addCombatant = (
    baseName: string,
    hp: number,
    init: number,
    type: "player" | "npc",
    details?: any,
  ) => {
    setCombatants((prev) => {
      let newCombatant: Combatant;

      if (type === "player" && details && details.stats) {
        newCombatant = playerToCombatant(details, init);
      } else if (type === "npc" && details && details.maxHp) {
        const count = prev.filter((c) => c.baseName === baseName).length;
        newCombatant = npcToCombatant(details, init, count + 1);
      } else {
        const maxFocusVal = details?.focus?.max || details?.maxFocus || 0;
        const currentFocusVal = details?.focus?.current ?? maxFocusVal;

        newCombatant = {
          id: Date.now().toString() + Math.random(),
          name: baseName, // Usa o nome passado no argumento
          baseName: baseName,
          type,
          initiative: init,
          hp: { current: hp, max: hp }, // Usa o HP passado no argumento
          focus: { current: currentFocusVal, max: maxFocusVal },
          armorClass: details?.armorClass || 10,
          attributes: details?.attributes || {
            Força: { name: "Força", value: 10, modifier: 0 },
            Destreza: { name: "Destreza", value: 10, modifier: 0 },
            Constituição: { name: "Constituição", value: 10, modifier: 0 },
            Inteligência: { name: "Inteligência", value: 10, modifier: 0 },
            Sabedoria: { name: "Sabedoria", value: 10, modifier: 0 },
            Carisma: { name: "Carisma", value: 10, modifier: 0 },
          },
          stances: details?.stances || [],
          skills: details?.skills || [],
          spells: details?.spells || [],
          activeStanceId: null,
          turnActions: { standard: true, bonus: true, reaction: true },
          deathSaves: { successes: 0, failures: 0 },
          equipmentSummary: details?.equipment || "",
          actionsDescription: details?.actions || "",
        };
      }

      return [...prev, newCombatant].sort(
        (a, b) => b.initiative - a.initiative,
      );
    });
  };

  const updateCombatant = (id: string, field: string, value: any) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        if (field === "hp") {
          // Se value for objeto {current, max}, usa. Se for número, atualiza só current.
          if (typeof value === "number") {
            return { ...c, hp: { ...c.hp, current: value } };
          }
          return { ...c, hp: value };
        }

        if (field === "initiative") {
          return { ...c, initiative: value };
        }

        if (field === "focus") {
          if (value && typeof value === "object" && "current" in value) {
            return { ...c, focus: value };
          }
          const newCurrent = Math.max(0, Math.min(Number(value), c.focus.max));
          return { ...c, focus: { ...c.focus, current: newCurrent } };
        }

        if (field === "activeStanceId") {
          return { ...c, activeStanceId: value };
        }
        if (field === "turnActions") {
          return { ...c, turnActions: value };
        }
        if (field === "armorClass") {
          return { ...c, armorClass: value };
        }
        if (field === "deathSaves") {
          return { ...c, deathSaves: value };
        }

        return c;
      }),
    );
  };

  const endTurnCombatant = (id: string) => {
    updateCombatant(id, "turnActions", {
      standard: true,
      bonus: true,
      reaction: true,
    });
  };

  const removeCombatant = (id: string) => {
    setCombatants((prev) => prev.filter((c) => c.id !== id));
  };

  const sortCombat = () => {
    setCombatants((prev) => prev.sort((a, b) => b.initiative - a.initiative));
  };

  const clearCombat = () => setCombatants([]);

  // --- Lógica de Bestiário ---

  const saveNpcToLibrary = (npcRaw: Omit<NpcTemplate, "id">) => {
    // Aplica a lógica de classe antes de salvar
    const npcWithClassData = populateClassData(npcRaw);

    setNpcLibrary((prev) => [
      ...prev,
      { ...npcWithClassData, id: Date.now().toString() } as NpcTemplate,
    ]);
  };

  const deleteNpcFromLibrary = (id: string) => {
    setNpcLibrary((prev) => prev.filter((n) => n.id !== id));
  };

  const updateNpcInLibrary = (id: string, updates: Partial<NpcTemplate>) => {
    // Se a atualização mudar classe ou nível, precisamos recalcular
    // Mas cuidado: 'updates' pode não ter todos os campos.
    // A melhor estratégia é pegar o antigo, aplicar o update, e repopular.

    setNpcLibrary((prev) =>
      prev.map((npc) => {
        if (npc.id === id) {
          const merged = { ...npc, ...updates };
          // Se classe ou nível mudaram no update, repopula skills
          if (updates.class || updates.level) {
            return populateClassData(merged) as NpcTemplate;
          }
          return merged;
        }
        return npc;
      }),
    );
  };

  const addDiceRoll = (roll: string) => {
    setDiceHistory((prev) => [roll, ...prev].slice(0, 20));
  };

  return (
    <CampaignContext.Provider
      value={{
        combatants,
        setCombatants,
        addCombatant,
        removeCombatant,
        updateCombatant,
        sortCombat,
        clearCombat,
        npcLibrary,
        saveNpcToLibrary,
        deleteNpcFromLibrary,
        diceHistory,
        addDiceRoll,
        updateNpcInLibrary,
        endTurnCombatant,
        activeTurnId,
        setActiveTurnId,
        logs,
        setLogs,
        addLog,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaign = () => useContext(CampaignContext);
