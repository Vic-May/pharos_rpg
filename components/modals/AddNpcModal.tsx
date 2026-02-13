import { useTheme } from "@/context/ThemeContext";
import { CLASS_DATA } from "@/data/classData";
import { ANCESTRIES } from "@/data/origins";
import {
  ALL_CLASSES,
  Attribute,
  AttributeName,
  CharacterClass,
  NpcTemplate,
  Skill,
  Spell,
  Stance,
} from "@/types/rpg";
import { formatModString } from "@/utils/stringUtils";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SpellSelectorModal } from "./SpellSelectorModal";

const CUSTOM_CLASSES = ["Monstro", "Outros"];

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

  const [image, setImage] = useState("");

  // --- ESTADOS DO FORMULÁRIO (Copiados do NpcScreen) ---
  const [formTab, setFormTab] = useState<"general" | "details">("general");
  const [name, setName] = useState("");
  const [npcClass, setNpcClass] = useState<CharacterClass | string>();
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

  const [npcSpells, setNpcSpells] = useState<Spell[]>([]);

  const [spellModalVisible, setSpellModalVisible] = useState(false);

  useEffect(() => {
    // Só executa se o modal estiver visível
    if (visible) {
      if (initialData) {
        // --- MODO EDIÇÃO ---
        setImage(initialData.image || "");

        setName(initialData.name || "");

        // CORREÇÃO DO NÍVEL: Garante que vira string e tem valor padrão
        setLevel(String(initialData.level || "1"));

        // CORREÇÃO DE CLASSE/ANCESTRALIDADE: Garante string vazia se for null
        setNpcClass((initialData.class as CharacterClass) || "");
        setAncestry(initialData.ancestry || "");

        // Outros campos com proteção contra null/undefined
        setHp(String(initialData.maxHp || "10"));
        // setHpFormula(initialData.hpFormula || "");
        setAc(String(initialData.armorClass || "10"));
        setAcDetail(initialData.acDetail || "");
        setSpeed(initialData.speed || "9m");
        setInit(String(initialData.initiativeBonus || "0"));
        setFocus(String(initialData.maxFocus || "0"));

        // Atributos: Se não existir, usa o padrão 10
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

        // Mantém as listas existentes do NPC
        setNpcStances(initialData.stances || []);
        setNpcSkills(initialData.skills || []);

        setNpcSpells(initialData.spells || []); // Carregar magias existentes (se houver na interface NpcTemplate)
      } else {
        // --- MODO CRIAÇÃO (RESET) ---
        setImage("");
        setName("");
        setLevel("1");
        setNpcClass(undefined);
        setAncestry("");
        setSubline("");
        setHp("");
        setHpFormula("");
        setAc("");
        setAcDetail("");
        setSpeed("9m");
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
        setNpcSkills([]);
        setFormTab("general");
        setNpcSpells([]);
      }
    }
  }, [visible, initialData]);

  useEffect(() => {
    // Só roda se NÃO estiver editando (para não sobrescrever dados salvos)
    if (!initialData && npcClass) {
      // A. Se for Customizado (Monstro/Outros), LIMPA as listas automáticas
      if (CUSTOM_CLASSES.includes(npcClass)) {
        setNpcSkills([]);
        setNpcStances([]);
        return; // PARE AQUI! Não busque no CLASS_DATA
      }

      // B. Se for Classe Padrão, carrega do arquivo
      if (CLASS_DATA[npcClass as CharacterClass]) {
        const data = CLASS_DATA[npcClass as CharacterClass];
        const numericLevel = parseInt(level) || 1;

        const autoSkills = data.skills.filter(
          (s) => (s.level || 1) <= numericLevel,
        );
        const autoStances = data.stances;

        setNpcSkills(autoSkills);
        setNpcStances(autoStances);
      }
    }
  }, [npcClass, level, initialData]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImage(base64Img);
    }
  };

  const handleSave = () => {
    const data = {
      name,
      image,
      subline,
      maxHp: parseInt(hp) || 10,
      level: parseInt(level) || 1,
      //   hpFormula,
      class: npcClass,
      ancestry: ancestry,
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
      spells: npcSpells,
    };
    onSave(data);
    onClose();
  };

  const addSpell = (spell: Spell) => {
    if (!npcSpells.find((s) => s.id === spell.id)) {
      setNpcSpells([...npcSpells, spell]);
    }
    setSpellModalVisible(false);
  };

  const removeSpell = (spellId: string) => {
    setNpcSpells(npcSpells.filter((s) => s.id !== spellId));
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
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {initialData ? "Editar NPC" : "Criar NPC"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

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
              <View style={styles.imageContainer}>
                <TouchableOpacity
                  onPress={pickImage}
                  activeOpacity={0.8}
                  style={styles.avatarContainer}
                >
                  {image ? (
                    <Image source={{ uri: image }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons
                        name="camera"
                        size={32}
                        color={colors.iconDefault}
                      />
                      <Text style={styles.avatarText}>Foto</Text>
                    </View>
                  )}
                  <View style={styles.editBadge}>
                    <Ionicons name="pencil" size={12} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
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

              <Text style={styles.label}>Classe / Tipo</Text>
              <View style={styles.chipContainer}>
                {/* Combina as classes padrão com as customizadas */}
                {[...ALL_CLASSES, ...CUSTOM_CLASSES].map((cls) => {
                  const isSelected = npcClass === cls;
                  // Estilo diferente para as customizadas (Opcional)
                  const isCustom = CUSTOM_CLASSES.includes(cls);

                  return (
                    <TouchableOpacity
                      key={cls}
                      style={[
                        styles.chip,
                        isSelected && styles.chipActive,
                        isCustom && !isSelected && { borderColor: "#fb8c00" }, // Laranja sutil para monstros
                      ]}
                      onPress={() => setNpcClass(cls)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                          isCustom && !isSelected && { color: "#fb8c00" },
                        ]}
                      >
                        {cls}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

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

              <Text style={styles.label}>Ações & Habilidades</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                {CUSTOM_CLASSES.includes(npcClass || "")
                  ? "Digite aqui os ataques, posturas e habilidades do monstro."
                  : "Ações extras ou descrição."}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                value={actions}
                onChangeText={setActions}
                placeholderTextColor={colors.textSecondary}
                placeholder="Ex: Ataque de Garra +5 (1d6+3)..."
              />

              <View style={styles.divider} />
              {/* Lógica de Magias e Atributos mantida... */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text style={styles.label}>Grimório do NPC</Text>
                <TouchableOpacity
                  onPress={() => setSpellModalVisible(true)}
                  style={styles.addBtnSmall}
                >
                  <Text style={styles.addBtnText}>+ Magia</Text>
                </TouchableOpacity>
              </View>
              {npcSpells.map((spell) => (
                <View key={spell.id} style={styles.miniItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniItemTitle}>{spell.name}</Text>
                    <Text style={styles.miniItemDesc}>
                      {spell.circle}º Círculo • {spell.school}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeSpell(spell.id)}>
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.divider} />
              <View style={styles.attrFormGrid}>
                {ATTRIBUTE_ORDER.map((key) => (
                  <View key={key} style={styles.attrInputBox}>
                    <Text style={styles.labelCenter}>
                      {key.substring(0, 3).toUpperCase()}
                    </Text>
                    <TextInput
                      style={[styles.input, { textAlign: "center" }]}
                      keyboardType="numeric"
                      value={String(attrs[key].value)}
                      onChangeText={(t) => handleAttributeChange(key, t)}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                        color: colors.textSecondary,
                        fontSize: 12,
                      }}
                    >
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
        <SpellSelectorModal
          visible={spellModalVisible}
          onClose={() => setSpellModalVisible(false)}
          onSelect={addSpell}
          learnedSpells={npcSpells}
        />
      </SafeAreaView>
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
    textArea: { minHeight: 150, textAlignVertical: "top" },
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
    imageContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    imagePicker: {
      width: 100,
      height: 100,
      borderRadius: 50,
      overflow: "hidden",
      backgroundColor: colors.inputBg,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    npcImage: {
      width: "100%",
      height: "100%",
    },
    placeholderImage: {
      alignItems: "center",
      justifyContent: "center",
    },
    placeholderText: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 4,
    },
    editIconBadge: {
      position: "absolute",
      bottom: 4,
      right: 4,
      backgroundColor: colors.primary,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.border,
    },
    avatarImage: { width: "100%", height: "100%", borderRadius: 40 },
    avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
    avatarText: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
    editBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.surface,
    },
  });
