// components/rpg/AvatarPortrait.tsx
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

interface AvatarPortraitProps {
  imageUrl?: string | null;
  size?: number;
  name?: string; // NOVO: Para pegar a inicial do nome
  fallbackBgColor?: string; // NOVO: Cor de fundo customizada
  fallbackTextColor?: string; // NOVO: Cor do texto customizada
}

export const AvatarPortrait = ({
  imageUrl,
  size = 80,
  name,
  fallbackBgColor,
  fallbackTextColor,
}: AvatarPortraitProps) => {
  const { colors } = useTheme();

  // 1. Se tem URL, carrega a imagem da nuvem
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        transition={200}
      />
    );
  }

  // 2. Lógica do Fallback (Se não tem imagem)
  const initial = name ? name.charAt(0).toUpperCase() : "";

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: fallbackBgColor || colors.surface,
          borderColor: fallbackBgColor ? "transparent" : colors.border,
        },
      ]}
    >
      {initial ? (
        // Se passou o nome, exibe a letra inicial
        <Text
          style={{
            color: fallbackTextColor || colors.textSecondary,
            fontSize: size * 0.4, // Tamanho da fonte proporcional ao avatar
            fontWeight: "bold",
          }}
        >
          {initial}
        </Text>
      ) : (
        // Se não passou nome (ex: HomeScreen sem imagem), exibe ícone genérico
        <Ionicons
          name="person"
          size={size * 0.5}
          color={colors.textSecondary}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
});
