import { useTheme } from "@/context/ThemeContext";
import { ANCESTRIES } from "@/data/origins";
import {
  ALL_CLASSES,
  Attribute,
  AttributeName,
  CharacterClass,
  NpcTemplate,
  Skill,
  Stance,
} from "@/types/rpg";
import { formatModString } from "@/utils/stringUtils";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddNpcModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Partial<NpcTemplate>) => void;
  initialData?: NpcTemplate | null;
}

export const AddNpcModal = ({
  visible,
  onClose,
  onSave,
  initialData,
}: AddNpcModalProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  // --- ESTADOS DO FORMULÁRIO (Copiados do NpcScreen) ---
  const [formTab, setFormTab] = useState<"general" | "details">("general");
  const [name, setName] = useState("");
  const [npcClass, setNpcClass] = useState<CharacterClass | "">("");
  const [level, setLevel] = useState("1");
  const [subline, setSubline] = useState("");
  const [hp, setHp] = useState("");
  const [hpFormula, setHpFormula] = useState("");
  const [ac, setAc] = useState("");
  const [acDetail, setAcDetail] = useState("");
  const [speed, setSpeed] = useState("");
  const [init, setInit] = useState("");
  const [focus, setFocus] = useState("");
  const [attrs, setAttrs] = useState<Record<AttributeName, Attribute>>({
    Força: { name: "Força", value: 10, modifier: 0 },
    Destreza: { name: "Destreza", value: 10, modifier: 0 },
    Constituição: { name: "Constituição", value: 10, modifier: 0 },
    Inteligência: { name: "Inteligência", value: 10, modifier: 0 },
    Sabedoria: { name: "Sabedoria", value: 10, modifier: 0 },
    Carisma: { name: "Carisma", value: 10, modifier: 0 },
  });
  const [ancestry, setAncestry] = useState("");

  // Detalhes Texto
  const [equip, setEquip] = useState("");
  const [actions, setActions] = useState("");

  // --- LOGICA DE LISTAS DINÂMICAS (STANCES & SKILLS) ---
  const [npcStances, setNpcStances] = useState<Stance[]>([]);
  const [npcSkills, setNpcSkills] = useState<Skill[]>([]);
  const ATTRIBUTE_ORDER: AttributeName[] = [
    "Força",
    "Destreza",
    "Constituição",
    "Inteligência",
    "Sabedoria",
    "Carisma",
  ];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLevel(String(initialData.level));
      setNpcClass(initialData.class || "");
      setHp(String(initialData.maxHp));
      // setHpFormula(initialData.hpFormula); // Se tiver no type, descomente
      setAc(String(initialData.armorClass));
      setAcDetail(initialData.acDetail || ""); // Se tiver no type, descomente
      setSpeed(initialData.speed || "");
      setInit(String(initialData.initiativeBonus));
      setFocus(String(initialData.maxFocus));
      setAttrs(
        initialData.attributes || {
          Força: { name: "Força", value: 10, modifier: 0 },
          Destreza: { name: "Destreza", value: 10, modifier: 0 },
          Constituição: { name: "Constituição", value: 10, modifier: 0 },
          Inteligência: { name: "Inteligência", value: 10, modifier: 0 },
          Sabedoria: { name: "Sabedoria", value: 10, modifier: 0 },
          Carisma: { name: "Carisma", value: 10, modifier: 0 },
        },
      );

      setEquip(initialData.equipment || "");
      setActions(initialData.actions || "");
      setNpcClass(initialData.class || "");
      setAncestry(initialData.ancestry || "");
    } else {
      // Resetar campos se for novo
      // setEditingId(null);
      setName("");
      setSubline("");
      setHp("");
      setHpFormula("");
      setAc("");
      setAcDetail("");
      setSpeed("");
      setInit("");
      setFocus("");
      setAttrs({
        Força: { name: "Força", value: 10, modifier: 0 },
        Destreza: { name: "Destreza", value: 10, modifier: 0 },
        Constituição: { name: "Constituição", value: 10, modifier: 0 },
        Inteligência: { name: "Inteligência", value: 10, modifier: 0 },
        Sabedoria: { name: "Sabedoria", value: 10, modifier: 0 },
        Carisma: { name: "Carisma", value: 10, modifier: 0 },
      });
      setEquip("");
      setActions("");
      setNpcStances([]);
      setNpcSkills([]); // Limpa as listas
      setFormTab("general");
    }
  }, [initialData, visible]);

  const handleSave = () => {
    const data = {
      name,
      subline,
      maxHp: parseInt(hp) || 10,
      //   hpFormula,
      armorClass: parseInt(ac) || 10,
      acDetail,
      speed: speed || "9m",
      initiativeBonus: parseInt(init) || 0,
      maxFocus: parseInt(focus) || 0,
      attributes: attrs,
      equipment: equip,
      actions,
      stances: npcStances,
      skills: npcSkills,
    };
    onSave(data);
    onClose();
  };

  const handleAttributeChange = (key: AttributeName, text: string) => {
    const newValue = parseInt(text) || 0;
    // Recalcula o modificador: (Valor - 10) / 2 arredondado para baixo
    const newModifier = Math.floor((newValue - 10) / 2);

    setAttrs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key], // Mantém o nome e outros dados se houver
        value: newValue,
        modifier: newModifier,
      },
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {initialData ? "Editar NPC" : "Criar NPC"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* ... Lógica de Abas e Formulário (Copiado do seu código original) ... */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setFormTab("general")}
            style={[styles.tabItem, formTab === "general" && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                formTab === "general" && styles.tabTextActive,
              ]}
            >
              Geral
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFormTab("details")}
            style={[styles.tabItem, formTab === "details" && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                formTab === "details" && styles.tabTextActive,
              ]}
            >
              Detalhes
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          {/* ABA GERAL */}
          {formTab === "general" && (
            <>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Bandido"
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Nível</Text>
                  <TextInput
                    style={styles.input}
                    value={level}
                    onChangeText={setLevel}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              {/* SELETOR DE CLASSE (Igual Player) */}
              <Text style={styles.label}>Classe</Text>
              <View style={styles.chipContainer}>
                {ALL_CLASSES.map((cls) => {
                  const isSelected = npcClass === cls;
                  return (
                    <TouchableOpacity
                      key={cls}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setNpcClass(cls)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {cls}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* SELETOR DE ANCESTRALIDADE (Igual Player) */}
              <Text style={styles.label}>Ancestralidade</Text>
              <View style={styles.chipContainer}>
                {ANCESTRIES.map((anc) => {
                  const isSelected = ancestry === anc.name; // ou anc.id dependendo do seu dado
                  return (
                    <TouchableOpacity
                      key={anc.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setAncestry(anc.name)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {anc.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>PV Máx</Text>
                  <TextInput
                    style={styles.input}
                    value={hp}
                    onChangeText={setHp}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Fórmula PV</Text>
                  <TextInput
                    style={styles.input}
                    value={hpFormula}
                    onChangeText={setHpFormula}
                    placeholder="1d10+2"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>CA</Text>
                  <TextInput
                    style={styles.input}
                    value={ac}
                    onChangeText={setAc}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Detalhe CA</Text>
                  <TextInput
                    style={styles.input}
                    value={acDetail}
                    onChangeText={setAcDetail}
                    placeholder="Couro"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Init (Mod)</Text>
                  <TextInput
                    style={styles.input}
                    value={init}
                    onChangeText={setInit}
                    keyboardType="numeric"
                    placeholder="+0"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Desloc.</Text>
                  <TextInput
                    style={styles.input}
                    value={speed}
                    onChangeText={setSpeed}
                    placeholder="9m"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Foco</Text>
                  <TextInput
                    style={styles.input}
                    value={focus}
                    onChangeText={setFocus}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </>
          )}

          {/* ABA DETALHES */}
          {formTab === "details" && (
            <>
              <Text style={styles.label}>Equipamento</Text>
              <TextInput
                style={styles.input}
                value={equip}
                onChangeText={setEquip}
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Ações</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                value={actions}
                onChangeText={setActions}
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.divider} />

              <View style={styles.attrFormGrid}>
                {ATTRIBUTE_ORDER.map((key) => (
                  <View key={key} style={styles.attrInputBox}>
                    {/* Label (Ex: FOR, DES) */}
                    <Text style={styles.labelCenter}>
                      {key.substring(0, 3).toUpperCase()}
                    </Text>

                    {/* Input do Valor */}
                    <TextInput
                      style={[styles.input, { textAlign: "center" }]}
                      keyboardType="numeric"
                      // Acessa .value, pois attrs[key] agora é um objeto
                      value={String(attrs[key].value)}
                      onChangeText={(t) => handleAttributeChange(key, t)}
                    />

                    {/* Exibição do Modificador */}
                    <Text
                      style={{
                        textAlign: "center",
                        color: colors.textSecondary,
                        fontSize: 12,
                      }}
                    >
                      {/* Acessa .modifier direto do objeto calculado */}
                      {formatModString(attrs[key].modifier)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.footerBtn}>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtnFull}>
            <Text style={styles.saveText}>
              {initialData ? "Atualizar" : "Salvar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    empty: { textAlign: "center", marginTop: 50, color: colors.textSecondary },

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
    cardSub: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: "italic",
      marginTop: 2,
    },
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

    // Estilo do botão de ícone pequeno (Editar/Deletar)
    iconBtn: {
      width: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
    },
    btnText: { color: "#fff", fontWeight: "bold" },

    fab: {
      position: "absolute",
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#c62828",
      alignItems: "center",
      justifyContent: "center",
      elevation: 5,
    },

    // MODAL CRIAR
    modalContainer: { flex: 1, backgroundColor: colors.background },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
    closeText: { color: colors.primary, fontSize: 16 },

    tabBar: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    tabItem: { flex: 1, paddingVertical: 14, alignItems: "center" },
    tabActive: { borderBottomWidth: 2, borderColor: "#c62828" },
    tabText: { color: colors.textSecondary, fontWeight: "600" },
    tabTextActive: { color: "#c62828" },

    formContent: { padding: 20 },
    label: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 4,
      marginTop: 12,
      textTransform: "uppercase",
      fontWeight: "bold",
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      fontSize: 16,
    },
    textArea: { minHeight: 80, textAlignVertical: "top" },
    row: { flexDirection: "row", gap: 0 },

    attrFormGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    attrInputBox: { width: "30%", marginBottom: 20 },
    labelCenter: {
      textAlign: "center",
      color: colors.textSecondary,
      fontWeight: "bold",
      marginBottom: 4,
    },

    footerBtn: {
      padding: 20,
      borderTopWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    saveBtnFull: {
      backgroundColor: "#c62828",
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

    // MODAL QTY
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      padding: 20,
      alignItems: "center",
    },
    qtyBox: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 12,
      width: "80%",
    },
    qtyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 12,
    },
    qtyInput: {
      backgroundColor: colors.inputBg,
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      padding: 12,
      borderRadius: 8,
      color: colors.text,
      marginBottom: 16,
    },
    modalBtns: { flexDirection: "row", gap: 10 },
    cancelBtn: {
      flex: 1,
      padding: 12,
      backgroundColor: colors.inputBg,
      alignItems: "center",
      borderRadius: 8,
    },
    confirmBtn: {
      flex: 1,
      padding: 12,
      backgroundColor: "#c62828",
      alignItems: "center",
      borderRadius: 8,
    },
    cancelText: { color: colors.textSecondary, fontWeight: "bold" },
    miniItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      padding: 10,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    miniItemTitle: { fontWeight: "bold", color: colors.text, fontSize: 14 },
    miniItemDesc: { color: colors.textSecondary, fontSize: 12 },

    addBox: {
      backgroundColor: colors.surface,
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "dashed",
      marginBottom: 20,
    },
    addBtnSmall: {
      backgroundColor: colors.inputBg,
      padding: 10,
      borderRadius: 6,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    addBtnText: {
      color: colors.text,
      fontWeight: "bold",
      fontSize: 12,
    },
    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      color: colors.textSecondary,
      fontWeight: "500",
      fontSize: 12,
    },
    chipTextActive: {
      color: "#fff",
      fontWeight: "bold",
    },
  });
