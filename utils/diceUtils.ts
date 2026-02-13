// src/utils/diceUtils.ts

export interface RollResult {
  total: number;
  formula: string;
  detailedLog: string;
}

export const rollDiceString = (
  formula: string,
  isCrit: boolean = false,
): RollResult => {
  const cleanFormula = formula.toLowerCase().replace(/\s+/g, "");
  const regex = /([+-]?)(\d+)(d(\d+))?/g;

  let match;
  let total = 0;
  let logParts: string[] = [];

  while ((match = regex.exec(cleanFormula)) !== null) {
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    const signStr = match[1];
    const val1 = parseInt(match[2], 10);
    const isDice = !!match[3];
    const sides = match[4] ? parseInt(match[4], 10) : 0;

    const multiplier = signStr === "-" ? -1 : 1;
    const displaySign = signStr || "+";

    if (isDice) {
      // --- É uma rolagem de dados (Ex: 1d8 ou 2d6) ---
      let subTotal = 0;
      const rolls: number[] = [];
      let maxDamage = 0;

      // REGRA DO CRÍTICO: "Valor máximo do dado + Rolagem normal"
      if (isCrit) {
        maxDamage = val1 * sides; // Ex: 1d8 = 8, 2d6 = 12
        subTotal += maxDamage;
      }

      // Rola os dados normalmente (seja o dado base ou o dado extra do crítico)
      for (let i = 0; i < val1; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        subTotal += roll;
      }

      total += subTotal * multiplier;

      // Log detalhado e bonito
      if (isCrit) {
        logParts.push(
          `${displaySign} ${subTotal} [CRÍTICO! Máx: ${maxDamage} + Rolou: ${rolls.join(", ")}]`,
        );
      } else {
        logParts.push(
          `${displaySign} ${subTotal} [${val1}d${sides}: ${rolls.join(", ")}]`,
        );
      }
    } else {
      // --- É um modificador fixo (Ex: +4) ---
      // Modificadores NUNCA são multiplicados em um crítico
      total += val1 * multiplier;
      logParts.push(`${displaySign} ${val1}`);
    }
  }

  let finalLog = logParts.join(" ");
  if (finalLog.startsWith("+ ")) {
    finalLog = finalLog.substring(2);
  }

  return {
    total: Math.max(0, total),
    formula: formula,
    detailedLog: finalLog,
  };
};
