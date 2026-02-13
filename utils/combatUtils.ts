import { Combatant, Skill } from "../types/rpg";
import { rollDiceString } from "./diceUtils"; // Certifique-se de importar sua função de dados

export const calculateSkillDamage = (
  skill: Skill,
  attacker: Combatant,
  // O argumento 'equippedWeapon' foi removido pois já está dentro de 'attacker.weapons'
): { total: number; formula: string; log: string } => {
  let totalDamage = 0;
  let formulaParts: string[] = [];
  let logDetails: string[] = [];

  // 1. Dano Base da Arma (se a skill usar)
  if (skill.usesWeaponDamage) {
    // A. Seleciona a arma correta baseada na Skill
    let selectedWeapon = attacker.weapons?.melee; // Padrão: Melee

    if (skill.weaponType === "ranged") {
      // Se a skill exige ataque à distância, tenta pegar a arma ranged
      // Se não tiver (undefined), mantém undefined para cair no fallback ou erro
      selectedWeapon = attacker.weapons?.ranged;
    }

    // B. Calcula o Dano se houver arma válida
    if (selectedWeapon) {
      // Rola o dado da arma (ex: "1d8")
      const weaponRoll = rollDiceString(selectedWeapon.damage);

      // Pega o modificador do atributo que JÁ foi definido no Factory (Força ou Destreza)
      const attrName = selectedWeapon.attribute;
      const attrMod = attacker.attributes[attrName]?.modifier || 0;

      // Soma tudo: Dado + Atributo + Bônus Mágico (se houver)
      totalDamage += weaponRoll.total + attrMod + selectedWeapon.attackBonus;

      // Logs para feedback visual
      formulaParts.push(selectedWeapon.damage);
      formulaParts.push(`${attrName.substring(0, 3).toUpperCase()}`); // "FOR", "DES"

      logDetails.push(`${selectedWeapon.name} (${weaponRoll.total})`);
      logDetails.push(`${attrName.substring(0, 3).toUpperCase()} (${attrMod})`);
    } else {
      // C. Fallback: Desarmado (Se tentou usar skill de arma sem ter arma do tipo)
      // Geralmente 1 + Força
      const strMod = attacker.attributes["Força"]?.modifier || 0;
      totalDamage += 1 + strMod;

      formulaParts.push("1");
      formulaParts.push("FOR");
      logDetails.push(`Desarmado (1) + FOR (${strMod})`);
    }
  }

  // 2. Dano Bônus da Skill (ex: "2d6" de um ataque especial)
  if (skill.bonusDamage && !skill.isHealing) {
    const bonusRoll = rollDiceString(skill.bonusDamage);
    totalDamage += bonusRoll.total;

    formulaParts.push(skill.bonusDamage);
    logDetails.push(`${skill.name} (${bonusRoll.total})`);
  }

  // 3. Lógica de Cura (Separada)
  if (skill.isHealing && skill.healFormula) {
    let formula = skill.healFormula;

    // Substituição de variáveis (@CON, @CHA, etc)
    if (formula.includes("@CON")) {
      const conMod = attacker.attributes["Constituição"].modifier;
      formula = formula.replace("@CON", conMod.toString());
    }
    if (formula.includes("@CHA")) {
      const chaMod = attacker.attributes["Carisma"].modifier;
      formula = formula.replace("@CHA", chaMod.toString());
    }
    if (formula.includes("@SAB")) {
      const wisMod = attacker.attributes["Sabedoria"].modifier;
      formula = formula.replace("@SAB", wisMod.toString());
    }
    if (formula.includes("@INT")) {
      const intMod = attacker.attributes["Inteligência"].modifier;
      formula = formula.replace("@INT", intMod.toString());
    }

    const healRoll = rollDiceString(formula);

    return {
      total: healRoll.total,
      formula: formula,
      log: `Cura: ${healRoll.total} [${healRoll.detailedLog || formula}]`,
    };
  }

  // Retorno Final de Dano
  return {
    total: Math.max(0, totalDamage), // Garante que não cure o inimigo com dano negativo
    formula: formulaParts.join(" + "),
    log: `Total: ${totalDamage} [${logDetails.join(" + ")}]`,
  };
};
