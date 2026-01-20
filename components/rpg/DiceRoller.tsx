import { useTheme } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DICES = [4, 6, 8, 10, 12, 20, 100];

interface DiceRollerProps {
  onRoll: (sides: number, result: number) => void;
  color?: string; // Permite customizar a cor (Ex: Vermelho pro Mestre, Azul pro Jogador)
}

export const DiceRoller = ({ onRoll, color }: DiceRollerProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const btnColor = color || colors.primary;

  const handleRoll = (sides: number) => {
    const result = Math.floor(Math.random() * sides) + 1;
    onRoll(sides, result);
  };

  return (
    <View style={styles.grid}>
      {DICES.map((d) => (
        <TouchableOpacity
          key={d}
          style={[styles.diceBtn, { backgroundColor: btnColor }]}
          onPress={() => handleRoll(d)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={d === 100 ? "decagram-outline" : (`dice-d${d}` as any)}
            size={32}
            color="#fff"
          />
          <Text style={styles.diceText}>D{d}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      justifyContent: "center", // Centraliza os dados
    },
    diceBtn: {
      width: "30%", // 3 por linha aproximadamente
      aspectRatio: 1, // Mantém quadrado
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    diceText: {
      color: "#fff",
      fontWeight: "bold",
      marginTop: 4,
      fontSize: 14,
    },
  });
