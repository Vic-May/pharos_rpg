import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export const getCircleTheme = (circle: number) => {
  switch (circle) {
    case 1:
      return { primary: "#2e7d32", light: "#e8f5e9" }; // Verde
    case 2:
      return { primary: "#1565c0", light: "#e3f2fd" }; // Azul
    case 3:
      return { primary: "#6a1b9a", light: "#f3e5f5" }; // Roxo
    case 4:
      return { primary: "#c62828", light: "#ffebee" }; // Vermelho
    case 5:
      return { primary: "#ef6c00", light: "#fff3e0" }; // Laranja
    default:
      return { primary: "#455a64", light: "#eceff1" }; // Cinza
  }
};

// Definição das cores para cada escola
const SCHOOL_THEMES: Record<
  string,
  { color: string; icon: string; iconLib: any }
> = {
  // Escolas Elementais
  Fogo: {
    color: "#ef5350", // Vermelho
    icon: "fire",
    iconLib: MaterialCommunityIcons,
  },
  Agua: {
    color: "#29b6f6", // Azul Claro
    icon: "water-outline",
    iconLib: Ionicons,
  },
  Terra: {
    color: "#8d6e63", // Marrom
    icon: "leaf", // Ou 'terrain'
    iconLib: MaterialCommunityIcons,
  },
  Céu: {
    color: "#81d4fa", // Azul Celeste / Ar
    icon: "weather-windy",
    iconLib: MaterialCommunityIcons,
  },

  // Escolas Conceituais
  Luz: {
    color: "#fbc02d", // Dourado/Amarelo
    icon: "sunny",
    iconLib: Ionicons,
  },
  Energia: {
    color: "#ab47bc", // Roxo/Violeta
    icon: "flash",
    iconLib: Ionicons,
  },
  Som: {
    color: "#78909c", // Cinza Azulado
    icon: "music-note",
    iconLib: MaterialCommunityIcons,
  },
  Natureza: {
    color: "#66bb6a", // Verde
    icon: "flower",
    iconLib: MaterialCommunityIcons,
  },
};

// Fallback para escolas desconhecidas ou genéricas
const DEFAULT_THEME = {
  color: "#bdbdbd",
  icon: "auto-fix",
  iconLib: MaterialCommunityIcons,
};

/**
 * Retorna a cor e o ícone baseados no nome da escola.
 * @param schoolName Nome da escola (ex: "Fogo", "Luz")
 */
export const getSchoolTheme = (schoolName?: string) => {
  if (!schoolName) return DEFAULT_THEME;

  // Normaliza para Capitalize (primeira letra maiúscula) caso venha bagunçado
  // Mas tenta buscar direto primeiro
  return SCHOOL_THEMES[schoolName] || DEFAULT_THEME;
};

// Se quiser APENAS a cor simples:
export const getSchoolColor = (schoolName?: string): string => {
  return getSchoolTheme(schoolName).color;
};
