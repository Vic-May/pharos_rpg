// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

// Contextos
import { useTheme } from "@/context/ThemeContext"; // <--- Importe o Tema

export default function TabLayout() {
  // Pegamos as cores e a função de trocar tema aqui no Layout
  const { colors, isDark, toggleTheme } = useTheme();

  // Lógica para esconder Grimório (mantida)
  // const canUseMagic = MAGIC_CLASSES.includes(character.class);
  const canUseMagic = true;

  return (
    <Tabs
      screenOptions={{
        // --- CORES DA TAB BAR (Inferior) ---
        tabBarStyle: {
          backgroundColor: colors.surface, // Fundo da barra
          borderTopColor: colors.border, // Borda fina no topo da barra
        },
        tabBarActiveTintColor: colors.primary, // Cor do ícone ativo
        tabBarInactiveTintColor: colors.textSecondary, // Cor do ícone inativo

        // --- CORES DO HEADER (Superior) ---
        headerStyle: {
          backgroundColor: colors.background, // Fundo do cabeçalho
          // No Android, remove a sombra "feia" padrão se quiser um visual flat:
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text, // Cor do Título e botões de voltar
        headerTitleStyle: {
          fontWeight: "bold",
        },

        // --- BOTÃO DE TEMA NO TOPO (Direita) ---
        headerRight: () => (
          <TouchableOpacity
            onPress={toggleTheme}
            style={{ marginRight: 15 }} // Espaçamento da margem direita
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? "sunny" : "moon"} // Muda o ícone
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Geral",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="combat"
        options={{
          title: "Combate",
          tabBarIcon: ({ color }) => (
            <Ionicons name="shield-half" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventário",
          tabBarIcon: ({ color }) => (
            <Ionicons name="briefcase" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="biography"
        options={{
          title: "Biografia",
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="grimoire"
        options={{
          title: "Grimório",
          href: canUseMagic ? "/grimoire" : null,
          tabBarIcon: ({ color }) => (
            <Ionicons name="book" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dices"
        options={{
          title: "Dados",
          tabBarIcon: ({ color }) => (
            <Ionicons name="dice" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="session-combat"
        options={{
          title: "Turnos",
          tabBarIcon: ({ color }) => (
            <Ionicons name="wifi" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
