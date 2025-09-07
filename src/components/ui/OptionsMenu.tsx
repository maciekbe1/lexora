import { useAppTheme } from "@/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BottomSheetMenu } from "./BottomSheetMenu";
import { CancelFooterButton } from "./CancelFooterButton";

export type OptionConfig = {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  variant?: "default" | "destructive";
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: OptionConfig[];
  maxHeightPercent?: number;
};

export function OptionsMenu({
  visible,
  onClose,
  title,
  options,
  maxHeightPercent,
}: Props) {
  const { colors, mode } = useAppTheme();
  return (
    <BottomSheetMenu
      visible={visible}
      onClose={onClose}
      maxHeightPercent={maxHeightPercent}
    >
      <View style={styles.content}>
        {title ? (
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        ) : null}
        {options.map((opt, idx) => {
          const isDestructive = opt.variant === "destructive";
          const bg = isDestructive
            ? mode === "dark"
              ? "rgba(255,59,48,0.10)"
              : "#fff5f5"
            : colors.surface;
          const color = isDestructive ? "#FF3B30" : colors.text;
          const iconColor =
            opt.iconColor || (isDestructive ? "#FF3B30" : colors.primary);
          return (
            <View
              key={idx}
              style={[
                styles.item,
                { borderColor: colors.border, backgroundColor: bg },
              ]}
            >
              <Ionicons
                name={opt.icon as any}
                size={20}
                color={iconColor}
                style={styles.icon}
              />
              <View style={styles.textWrap}>
                <Text style={[styles.itemTitle, { color }]}>{opt.title}</Text>
                {opt.subtitle ? (
                  <Text
                    style={[
                      styles.itemSubtitle,
                      { color: isDestructive ? "#FF3B30" : colors.mutedText },
                    ]}
                  >
                    {opt.subtitle}
                  </Text>
                ) : null}
              </View>
              <Text
                style={styles.touch}
                onPress={() => {
                  onClose();
                  opt.onPress();
                }}
              />
            </View>
          );
        })}
        <View style={styles.bottom}>
          <CancelFooterButton onPress={onClose} />
        </View>
      </View>
    </BottomSheetMenu>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: 12 },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  icon: { marginRight: 12 },
  textWrap: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  itemSubtitle: { fontSize: 14 },
  touch: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  bottom: { paddingTop: 0 },
});
