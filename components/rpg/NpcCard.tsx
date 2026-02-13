import { useTheme } from "@/context/ThemeContext";
import { NpcTemplate } from "@/types/rpg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NpcCardProps {
  item: NpcTemplate;
  onEdit: (item: NpcTemplate) => void;
  onDelete: (id: string) => void;
  onCombat: (item: NpcTemplate) => void;
  onDuplicate?: (npc: NpcTemplate) => void;
}

export const NpcCard = ({
  item,
  onEdit,
  onDelete,
  onCombat,
  onDuplicate,
}: NpcCardProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(false);

  // Helper para formatar modificador
  const formatMod = (val: number) => {
    const mod = Math.floor((val - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.avatar} />
          ) : // Opcional: Se não tiver imagem, pode mostrar um ícone genérico ou nada
          // Aqui optei por nada para manter o layout limpo, ou você pode por um ícone:
          // <View style={[styles.avatar, { backgroundColor: colors.inputBg, justifyContent: 'center', alignItems: 'center' }]}>
          //    <Ionicons name="person" size={20} color={colors.textSecondary} />
          // </View>
          null}
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.name}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={styles.badgeRow}>
              <View
                style={[styles.badge, { backgroundColor: colors.error + "20" }]}
              >
                <Text style={[styles.badgeText, { color: colors.error }]}>
                  HP {item.maxHp}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  CA {item.armorClass}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>
              <Text style={styles.bold}>Desl:</Text> {item.speed}
            </Text>
            <Text style={styles.statText}>
              <Text style={styles.bold}>Init:</Text>{" "}
              {item.initiativeBonus >= 0
                ? `+${item.initiativeBonus}`
                : item.initiativeBonus}
            </Text>
            <Text style={styles.statText}>
              <Text style={styles.bold}>Foco:</Text> {item.maxFocus}
            </Text>
          </View>

          {/* Atributos */}
          <View style={styles.attrGrid}>
            {item.attributes &&
              Object.entries(item.attributes).map(([key, val]) => (
                <View key={key} style={styles.attrBox}>
                  <Text style={styles.attrLabel}>
                    {key.substring(0, 3).toUpperCase()}
                  </Text>
                  <Text style={styles.attrVal}>{val.value}</Text>
                  <Text style={styles.attrMod}>
                    {formatMod(val.value as number)}
                  </Text>
                </View>
              ))}
          </View>

          <View style={styles.divider} />

          {/* Texto Simples */}
          {!!item.equipment && (
            <Text style={styles.sectionText}>
              <Text style={styles.bold}>Equipamento: </Text>
              {item.equipment}
            </Text>
          )}

          {!!item.actions && (
            <View style={styles.textSection}>
              <Text style={styles.sectionHeader}>Ações</Text>
              <Text style={styles.bodyText}>{item.actions}</Text>
            </View>
          )}

          {item.stances &&
            Array.isArray(item.stances) &&
            item.stances.length > 0 && (
              <View style={styles.textSection}>
                <Text style={styles.sectionHeader}>Posturas</Text>
                {item.stances.map((s, index) => (
                  <Text key={s.id || index} style={styles.bodyText}>
                    • <Text style={{ fontWeight: "bold" }}>{s.name}</Text> (
                    {(s.acBonus || 0) > 0 ? `+${s.acBonus}` : s.acBonus} CA):{" "}
                    {s.benefit}
                  </Text>
                ))}
              </View>
            )}

          {item.skills &&
            Array.isArray(item.skills) &&
            item.skills.length > 0 && (
              <View style={styles.textSection}>
                <Text style={styles.sectionHeader}>Habilidades</Text>
                {item.skills.map((s, index) => (
                  <Text key={s.id || index} style={styles.bodyText}>
                    • <Text style={{ fontWeight: "bold" }}>{s.name}</Text> (
                    {s.cost} Foco): {s.description}
                  </Text>
                ))}
              </View>
            )}

          {/* Ações do Card */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => onCombat(item)}
              style={styles.combatBtn}
            >
              <MaterialCommunityIcons
                name="sword-cross"
                size={20}
                color="#fff"
              />
              <Text style={styles.btnText}>Combate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onEdit(item)}
              style={[styles.iconBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>

            {onDuplicate && (
              <TouchableOpacity
                onPress={() => onDuplicate(item)}
                style={[styles.iconBtn, { backgroundColor: "#fb8c00" }]} // Laranja para diferenciar
              >
                <Ionicons name="copy-outline" size={20} color="#fff" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              style={[styles.iconBtn, { backgroundColor: colors.inputBg }]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      elevation: 2,
    },
    cardHeader: {
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.surface,
    },
    cardTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
    badgeRow: { flexDirection: "row", gap: 8 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontWeight: "bold", fontSize: 12 },
    cardBody: {
      padding: 16,
      paddingTop: 0,
      borderTopWidth: 1,
      borderTopColor: colors.border + "50",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    statText: { color: colors.text, fontSize: 14 },
    bold: { fontWeight: "bold" },
    attrGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      padding: 8,
    },
    attrBox: { alignItems: "center", width: 45 },
    attrLabel: {
      fontSize: 10,
      fontWeight: "bold",
      color: colors.textSecondary,
    },
    attrVal: { fontSize: 16, fontWeight: "bold", color: colors.text },
    attrMod: { fontSize: 12, color: colors.textSecondary },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
    sectionText: { color: colors.text, fontSize: 14, marginBottom: 8 },
    textSection: { marginBottom: 12 },
    sectionHeader: {
      color: "#c62828",
      fontWeight: "bold",
      fontSize: 14,
      marginBottom: 4,
      marginTop: 8,
      textTransform: "uppercase",
    },
    bodyText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
    cardActions: { flexDirection: "row", marginTop: 8, gap: 10 },
    combatBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#c62828",
      padding: 10,
      borderRadius: 8,
      gap: 8,
    },
    iconBtn: {
      width: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
    },
    btnText: { color: "#fff", fontWeight: "bold" },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
      backgroundColor: colors.inputBg, // Cor de fundo enquanto carrega
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
