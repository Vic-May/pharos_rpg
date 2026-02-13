import { useTheme } from "@/context/ThemeContext";
import { Item } from "@/types/rpg";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ItemCardProps {
  item: Item;
  onUse?: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

export const ItemCard = ({ item, onUse, onEdit, onDelete }: ItemCardProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      {/* IMAGEM DO ITEM */}
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name="cube-outline"
              size={24}
              color={colors.textSecondary}  
            />
          </View>
        )}
      </View>

      {/* INFO */}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.quantity}>Qtd: {item.quantity}</Text>
        {item.description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>

      {/* AÇÕES */}
      <View style={styles.actions}>
        {onUse && (
          <TouchableOpacity
            onPress={() => onUse(item)}
            style={styles.actionBtn}
          >
            <Ionicons name="play" size={18} color={colors.success} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
          <Ionicons name="pencil" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={styles.actionBtn}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      elevation: 2,
    },
    imageContainer: {
      width: 50,
      height: 50,
      borderRadius: 8,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      marginRight: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    image: { width: "100%", height: "100%" },
    placeholder: { opacity: 0.5 },

    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: "bold", color: colors.text },
    quantity: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "bold",
      marginTop: 2,
    },
    desc: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },

    actions: { flexDirection: "row", gap: 8 },
    actionBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.inputBg,
      justifyContent: "center",
      alignItems: "center",
    },
  });
