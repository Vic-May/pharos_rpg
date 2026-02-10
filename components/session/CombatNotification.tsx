import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface CombatNotificationProps {
  visible: boolean;
  type: "damage" | "heal" | "info"; // <--- Novo: Tipo do evento
  source: string; // Quem causou (atacante ou curador)
  skill: string;
  value: number; // Valor genérico (dano ou cura)
  onHide: () => void;
}

export const CombatNotification = ({
  visible,
  type,
  source,
  skill,
  value,
  onHide,
}: CombatNotificationProps) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const [shouldRender, setShouldRender] = useState(false);

  // --- CONFIGURAÇÃO VISUAL DINÂMICA ---
  const config = useMemo(() => {
    switch (type) {
      case "heal":
        return {
          color: colors.success, // Verde
          icon: "heart" as const,
          title: "VOCÊ FOI CURADO!",
          prefix: "+",
        };
      case "info":
        return {
          color: colors.primary, // Azul/Cor do tema
          icon: "information-circle" as const,
          title: "INFORMAÇÃO",
          prefix: "",
        };
      case "damage":
      default:
        return {
          color: colors.error, // Vermelho
          icon: "flash" as const,
          title: "VOCÊ SOFREU DANO!",
          prefix: "-",
        };
    }
  }, [type, colors]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShouldRender(false);
        onHide();
      }
    });
  };

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      // Reinicia posição para garantir animação fluida se reabrir rápido
      slideAnim.setValue(-100);

      Animated.spring(slideAnim, {
        toValue: 20,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();

      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      handleClose();
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: config.color, // Borda dinâmica
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon} size={24} color="#fff" />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: config.color }]}>
          {config.title}
        </Text>

        <Text style={[styles.message, { color: colors.text }]}>
          <Text style={{ fontWeight: "bold" }}>{source}</Text> usou{" "}
          <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
            {skill}
          </Text>
        </Text>

        {/* Só mostra valor se for maior que 0 (para evitar "+0 PV") */}
        {value > 0 && (
          <Text style={[styles.valueText, { color: config.color }]}>
            {config.prefix}
            {value} PV
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 2,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  iconBox: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    position: "absolute",
    right: 12,
    top: 12,
  },
});
