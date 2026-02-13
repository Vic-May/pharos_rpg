import { useTheme } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Definição dos tipos de ação
export type ActionType = "standard" | "bonus" | "reaction";

interface ActionTrackerProps {
  turnActions: {
    standard: boolean;
    bonus: boolean;
    reaction: boolean;
  };
  onToggle: (type: ActionType) => void;
}

export const ActionTracker = ({
  turnActions,
  onToggle,
}: ActionTrackerProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  // Configuração estática dos botões para manter o código limpo
  const actionsConfig: {
    type: ActionType;
    label: string;
    icon: any;
    color: string;
  }[] = [
    {
      type: "standard",
      label: "Padrão",
      icon: "sword-cross",
      color: colors.primary,
    },
    {
      type: "bonus",
      label: "Bônus",
      icon: "star-four-points",
      color: "#fb8c00", // Laranja
    },
    {
      type: "reaction",
      label: "Reação",
      icon: "shield-alert",
      color: "#8e24aa", // Roxo
    },
  ];

  return (
    <View style={styles.actionsRow}>
      {actionsConfig.map(({ type, label, icon, color }) => {
        const isActive = turnActions[type];

        return (
          <TouchableOpacity
            key={type}
            style={[
              styles.actionBtn,
              {
                backgroundColor: isActive ? color : colors.inputBg,
                opacity: isActive ? 1 : 0.4,
              },
            ]}
            onPress={() => onToggle(type)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={icon}
              size={18}
              color={isActive ? "#fff" : colors.textSecondary}
            />
            <Text
              style={[
                styles.actionBtnText,
                { color: isActive ? "#fff" : colors.textSecondary },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    actionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
      marginBottom: 12,
    },
    actionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 8,
      gap: 4,
      elevation: 2,
      // Sombra suave para iOS
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    actionBtnText: {
      fontWeight: "bold",
      fontSize: 11,
      textTransform: "uppercase",
    },
  });
