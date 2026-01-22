import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  onConnect: (ip: string, code: string) => void;
  title?: string;
  btnLabel?: string;
  extraButton?: React.ReactNode; // Para o botão de "Reconectar" ou "Entrar como GM"
}

export const ConnectionForm = ({
  onConnect,
  title = "Conectar",
  btnLabel = "ENTRAR",
  extraButton,
}: Props) => {
  const { colors } = useTheme();
  const [ip, setIp] = useState("");
  const [code, setCode] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.center}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Ionicons name="wifi" size={40} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          IP do Servidor
        </Text>
        <TextInput
          value={ip}
          onChangeText={setIp}
          placeholder="Ex: 192.168.0.10"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          ID da Sala
        </Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Ex: MESA_01"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="characters"
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
        />

        <TouchableOpacity
          onPress={() => onConnect(ip, code)}
          style={[styles.btn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.btnText}>{btnLabel}</Text>
        </TouchableOpacity>

        {extraButton}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", padding: 20 },
  card: { padding: 24, borderRadius: 16, borderWidth: 1, elevation: 4 },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 8 },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  btn: { padding: 16, borderRadius: 8, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
