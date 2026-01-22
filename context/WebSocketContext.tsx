import { playerToCombatant } from "@/utils/rpgUtils";
import { generateSafeId } from "@/utils/stringUtils";
import React, { createContext, useContext, useRef, useState } from "react";
import { Alert } from "react-native";
import { Combatant } from "../types/rpg";
import { useCampaign } from "./CampaignContext";
import { useCharacter } from "./CharacterContext";

interface WebSocketContextType {
  isConnected: boolean;
  disconnect: () => void;
  joinSession: (ip: string, sessionId: string, initiative: number) => void; // Recebe o ID da sala
  sendMessage: (type: string, payload: any) => void;
  connectToRoute: (
    ip: string,
    sessionId: string,
    characterId: string,
    initialData: Combatant | any,
  ) => void;
}

const WebSocketContext = createContext<WebSocketContextType>(
  {} as WebSocketContextType,
);

// --- HELPER: Converter Player em Combatant ---
// (Isso garante que o objeto enviado seja igual ao esperado pelo servidor)

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  // Pegamos os dados do Jogador e da Campanha para manipular
  const { character } = useCharacter();
  const { setCombatants, setActiveTurnId, setLogs } = useCampaign();

  // ENDEREÇO DO SERVIDOR (Ajuste para o IP da sua máquina se usar emulador/celular físico)
  // Ex: "ws://192.168.1.15:8080"

  const connectToRoute = (
    ip: string,
    sessionId: string,
    characterId: string,
    initialData: Combatant | any,
  ) => {
    if (socketRef.current) {
      // Se já tiver conectado em outra, desconecta
      socketRef.current.close();
    }

    // Monta a URL: ws://IP:8000/ws/SESSAO_123/CHAR_456
    const wsUrl = `ws://${ip}:8000/ws/${sessionId}/${characterId}`;
    console.log("Conectando em:", wsUrl);

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket Conectado com Sucesso!");
      setIsConnected(true);

      const eventType =
        initialData.type === "gm" ? "GM_CONNECT" : "JOIN_SESSION";

      const msg = JSON.stringify({
        type: eventType, // <--- GM_CONNECT ou JOIN_SESSION
        payload: {
          roomCode: sessionId,
          combatant: initialData,
        },
      });
      ws.send(msg);
    };

    ws.onclose = () => {
      console.log("WebSocket Desconectado");
      setIsConnected(false);
      socketRef.current = null;
    };

    ws.onerror = (e) => {
      console.log("Erro no WebSocket:", e);
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleServerMessage(message);
      } catch (err) {
        console.error("Erro ao ler mensagem:", err);
      }
    };
  };

  const handleServerMessage = (data: any) => {
    console.log("📥 Payload Recebido:", Object.keys(data)); // Ajuda a debuggar

    if (data.error) {
      Alert.alert("Erro do Servidor", data.error);
      return;
    }

    if (data.combatants && data.turn_order) {
      console.log("✅ Atualizando estado do combate...");

      const sortedCombatants = data.turn_order
        .map((id: string) => data.combatants[id])
        .filter((c: any) => c !== undefined);

      if (typeof data.turn_index === "number") {
        const currentId = data.turn_order[data.turn_index];
        console.log("👉 Vez de:", currentId);
        setActiveTurnId(currentId);
      }

      if (data.logs && Array.isArray(data.logs)) {
        console.log("📜 Atualizando logs...", data.logs.length);
        setLogs(data.logs);
      }

      setCombatants(sortedCombatants);

      return;
    }

    if (data.type) {
      switch (data.type) {
        case "PONG":
          console.log("Pong recebido");
          break;
        default:
          console.log("Tipo de evento ignorado:", data.type);
      }
      return;
    }

    console.warn("⚠️ Formato de mensagem desconhecido:", data);
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const sendMessage = (type: string, payload: any) => {
    if (socketRef.current && isConnected) {
      const msg = JSON.stringify({ type, payload });
      socketRef.current.send(msg);
    } else {
      console.warn("Tentou enviar mensagem sem conexão.");
    }
  };

  const joinSession = (ip: string, sessionId: string, initiative: number) => {
    if (!character.name) {
      Alert.alert("Erro", "Crie seu personagem antes de entrar.");
      return;
    }

    const charId = generateSafeId(character.name) || `char_${Date.now()}`;

    // 1. Prepara os dados AGORA (snapshot atual)
    const combatantData = playerToCombatant(character, charId, initiative);

    // 2. Passa tudo para a conexão
    connectToRoute(ip, sessionId, charId, combatantData);
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        disconnect,
        joinSession,
        sendMessage,
        connectToRoute,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
