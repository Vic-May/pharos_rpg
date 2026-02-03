import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface DamageNotificationProps {
  visible: boolean;
  attacker: string;
  skill: string;
  damage: number;
  onHide: () => void;
}

export const DamageNotification = ({
  visible,
  attacker,
  skill,
  damage,
  onHide,
}: DamageNotificationProps) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current; // Começa fora da tela (cima)

  useEffect(() => {
    if (visible) {
      // Animação de Entrada
      Animated.spring(slideAnim, {
        toValue: 20, // Posição final (top: 20)
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();

      // Auto-esconder após 4 segundos
      const timer = setTimeout(() => {
        close();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      close();
    }
  }, [visible]);

  const close = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (visible) onHide();
    });
  };

  if (!visible && slideAnim._value < 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.error,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.error }]}>
        <Ionicons name="flash" size={24} color="#fff" />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.error }]}>
          VOCÊ SOFREU DANO!
        </Text>
        <Text style={[styles.message, { color: colors.text }]}>
          <Text style={{ fontWeight: "bold" }}>{attacker}</Text> usou{" "}
          <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
            {skill}
          </Text>
        </Text>
        <Text style={[styles.damageValue, { color: colors.error }]}>
          -{damage} PV
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0, // Será controlado pelo Animated
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
  damageValue: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    position: "absolute",
    right: 12,
    top: 12,
  },
});
