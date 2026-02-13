// src/utils/diceUtils.ts (ou adicione ao rpgUtils.ts)

export interface RollResult {
  total: number; // O valor final da soma
  formula: string; // A fórmula original limpa
  detailedLog: string; // Log detalhado (ex: "8 [2d6: 5, 3] + 2")
}

export const rollDiceString = (formula: string): RollResult => {
  // 1. Limpeza: remove espaços e converte para minúsculo
  const cleanFormula = formula.toLowerCase().replace(/\s+/g, "");

  // 2. Regex para capturar partes da fórmula
  // Grupos:
  // 1: Sinal (+ ou - ou vazio)
  // 2: Quantidade (ex: 2 em 2d6) ou valor fixo (ex: 5 em +5)
  // 3: Parte do dado (ex: d6) - opcional
  // 4: Lados do dado (ex: 6) - opcional
  const regex = /([+-]?)(\d+)(d(\d+))?/g;

  let match;
  let total = 0;
  let logParts: string[] = [];

  // Loop para processar cada parte da string (ex: "2d6", "+4")
  while ((match = regex.exec(cleanFormula)) !== null) {
    // Evita loops infinitos em matches vazios (segurança do JS)
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    const signStr = match[1]; // "+" ou "-"
    const val1 = parseInt(match[2], 10); // Quantidade ou valor fixo
    const isDice = !!match[3]; // Se tem "d", é dado
    const sides = match[4] ? parseInt(match[4], 10) : 0; // Lados do dado

    const multiplier = signStr === "-" ? -1 : 1;
    const displaySign = signStr || "+"; // Para o log

    if (isDice) {
      // --- É uma rolagem de dados (Ex: 2d6) ---
      let subTotal = 0;
      const rolls: number[] = [];

      for (let i = 0; i < val1; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        subTotal += roll;
      }

      total += subTotal * multiplier;

      // Adiciona ao log: "+ 8 [2d6: 5, 3]"
      logParts.push(
        `${displaySign} ${subTotal} [${val1}d${sides}: ${rolls.join(", ")}]`,
      );
    } else {
      // --- É um modificador fixo (Ex: +4) ---
      total += val1 * multiplier;
      logParts.push(`${displaySign} ${val1}`);
    }
  }

  // Formatação final do log (remove o primeiro "+" se existir para ficar bonito)
  let finalLog = logParts.join(" ");
  if (finalLog.startsWith("+ ")) {
    finalLog = finalLog.substring(2);
  }

  return {
    total: Math.max(0, total), // Garante que o dano não seja negativo (opcional)
    formula: formula,
    detailedLog: finalLog,
  };
};
