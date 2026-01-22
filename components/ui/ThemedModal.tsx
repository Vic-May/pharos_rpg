import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  animationType?: "slide" | "fade";
}

export const ThemedModal = ({
  visible,
  onClose,
  title,
  children,
  animationType = "slide",
}: Props) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Header Padrão */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conteúdo */}
          <View>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: "85%",
    overflow: "hidden",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "bold" },
});
