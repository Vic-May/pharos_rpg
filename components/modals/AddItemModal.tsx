import { useTheme } from "@/context/ThemeContext";
import { Item } from "@/types/rpg";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: Omit<Item, "id">) => void;
  initialData?: Item | null;
}

export const AddItemModal = ({
  visible,
  onClose,
  onSave,
  initialData,
}: AddItemModalProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || "");
        setQuantity(String(initialData.quantity || 1));
        setImage(initialData.image || "");
      } else {
        setName("");
        setDescription("");
        setQuantity("1");
        setImage("");
      }
    }
  }, [visible, initialData]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3, // Qualidade baixa para não pesar no banco/socket
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImage(base64Img);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name,
      description,
      quantity: parseInt(quantity) || 1,
      image,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {initialData ? "Editar Item" : "Novo Item"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* --- SELETOR DE IMAGEM --- */}
            <View style={styles.imageRow}>
              <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.itemImage} />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons
                      name="camera"
                      size={30}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.placeholderText}>Foto</Text>
                  </View>
                )}
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={10} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nome do Item</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Poção de Cura"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Quantidade</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Descrição / Efeitos</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Recupera 2d4+2 PV..."
              placeholderTextColor={colors.textSecondary}
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveText}>Salvar Item</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    title: { fontSize: 18, fontWeight: "bold", color: colors.text },
    closeText: { color: colors.primary, fontSize: 16 },
    content: { padding: 20 },

    // Image Styles
    imageRow: { alignItems: "center", marginBottom: 20 },
    imagePicker: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    itemImage: { width: "100%", height: "100%" },
    placeholder: { alignItems: "center" },
    placeholderText: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 4,
    },
    editBadge: {
      position: "absolute",
      bottom: 4,
      right: 4,
      backgroundColor: colors.primary,
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },

    label: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 6,
      marginTop: 12,
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      fontSize: 16,
    },
    textArea: { minHeight: 100, textAlignVertical: "top" },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    saveBtn: {
      backgroundColor: colors.primary, // Pode mudar para a cor que preferir
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  });
