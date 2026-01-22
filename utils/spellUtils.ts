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
