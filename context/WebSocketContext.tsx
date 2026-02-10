import { playerToCombatant } from "@/utils/combatantFactory";
import React, { createContext, useContext, useRef, useState } from "react";
import { Alert } from "react-native";
import { Combatant } from "../types/rpg";
import { useCampaign } from "./CampaignContext";
import { useCharacter } from "./CharacterContext";

interface WebSocketContextType {
  isConnected: boolean;
  disconnect: () => void;
  joinSession: (ip: string, sessionId: string, initiative: number) => void;
  sendMessage: (type: string, payload: any) => void;
  connectToRoute: (
    ip: string,
    sessionId: string,
    initialData: Combatant | any,
  ) => void;
}

const WebSocketContext = createContext<WebSocketContextType>(
  {} as WebSocketContextType,
);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const { character } = useCharacter();
  const { setCombatants, setActiveTurnId, setLogs, setLastEvent } =
    useCampaign();

  const connectToRoute = (
    inputIp: string,
    sessionId: string,
    initialData: Combatant | any,
  ) => {
    // 1. Limpeza de Conexão Anterior
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    // 2. Tratamento da String do IP (Remove http, https, ws, wss, barras)
    // Ex: "http://192.168.0.5/" vira "192.168.0.5"
    let host = inputIp
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/^wss?:\/\//, "")
      .replace(/\/$/, ""); // Remove barra no final

    // 3. Garante a porta 8000 se o usuário não digitou
    // Se o user digitou "192.168.0.5:8000", mantém. Se digitou só o IP, adiciona.
    if (!host.includes(":")) {
      host = `${host}:8000`;
    }

    // 4. Montagem da URL Padrão (Sem SSL/WSS)
    // Importante: Local deve ser sempre 'ws://'
    const wsUrl = `ws://${host}/ws/${sessionId}`;

    console.log("🔌 Tentando conectar em (LOCAL):", wsUrl);

    try {
      // 5. Conexão Limpa (Sem headers, sem options, sem 'as any')
      // Isso é crucial para o Android não bloquear a conexão cleartext
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket Conectado!");
        setIsConnected(true);

        const eventType =
          initialData.type === "gm" ? "GM_CONNECT" : "JOIN_SESSION";
        const msg = JSON.stringify({
          type: eventType,
          payload: {
            roomCode: sessionId,
            combatant: initialData,
          },
        });
        ws.send(msg);
      };

      ws.onclose = (e) => {
        console.log(`❌ WebSocket Desconectado (Código: ${e.code})`);
        setIsConnected(false);
        socketRef.current = null;
      };

      ws.onerror = (e: any) => {
        // O erro do WebSocket no React Native é meio genérico, mas ajuda saber que ocorreu
        console.log("⚠️ Erro no WebSocket:", e.message || "Erro desconhecido");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleServerMessage(message);
        } catch (err) {
          console.error("Erro ao ler JSON:", err);
        }
      };
    } catch (error) {
      console.error("Erro ao instanciar WebSocket:", error);
      Alert.alert("Erro Interno", "Falha ao criar conexão.");
    }
  };

  const handleServerMessage = (data: any) => {
    // Lógica de manipulação de mensagens (mantida igual)
    if (data.error) {
      Alert.alert("Erro do Servidor", data.error);
      return;
    }

    if (data.combatants && data.turn_order) {
      const sortedCombatants = data.turn_order
        .map((id: string) => data.combatants[id])
        .filter((c: any) => c !== undefined);

      if (typeof data.turn_index === "number") {
        setActiveTurnId(data.turn_order[data.turn_index]);
      }

      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }

      setCombatants(sortedCombatants);

      if (data.last_event) {
        setLastEvent(data.last_event);
      }
      return;
    }
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
    }
  };

  const joinSession = (ip: string, sessionId: string, initiative: number) => {
    if (!character.name) {
      Alert.alert("Erro", "Crie seu personagem antes de entrar.");
      return;
    }
    const combatantData = playerToCombatant(character, initiative);

    // Chama a função simplificada
    connectToRoute(ip, sessionId, combatantData);
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
