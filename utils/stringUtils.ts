export function generateSafeId(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

export function formatModString(mod: number) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
