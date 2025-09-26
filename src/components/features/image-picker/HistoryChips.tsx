import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/useAppTheme";
import { t } from "@/locales/i18n";

const ICON_SIZE_SMALL = 12;
const BORDER_RADIUS_PILL = 16;
const MAX_QUERY_DISPLAY_LENGTH = 30;
const CHIP_CLOSE_SIZE = 18;

interface HistoryChipsProps {
  queries: string[];
  onSelect: (query: string) => void;
  onClear?: () => void;
  onRemove?: (query: string) => void;
}

export function HistoryChips({
  queries,
  onSelect,
  onClear,
  onRemove,
}: HistoryChipsProps) {
  const { colors } = useAppTheme();

  if (!queries || queries.length === 0) return null;

  const truncateQuery = (query: string) => {
    return query.length > MAX_QUERY_DISPLAY_LENGTH
      ? `${query.slice(0, MAX_QUERY_DISPLAY_LENGTH - 3)}…`
      : query;
  };

  return (
    <View style={styles.historyContainer}>
      <View style={styles.historyChips}>
        {queries.map((query) => (
          <HistoryChip
            key={query}
            query={query}
            displayText={truncateQuery(query)}
            onSelect={() => onSelect(query)}
            onRemove={onRemove ? () => onRemove(query) : undefined}
            colors={colors}
          />
        ))}
      </View>
      {onClear && (
        <TouchableOpacity
          onPress={onClear}
          accessibilityLabel={t("imagePicker.clearHistory")}
        >
          <Text style={[styles.clearHistoryText, { color: colors.mutedText }]}>
            {t("common.clear")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface HistoryChipProps {
  query: string;
  displayText: string;
  onSelect: () => void;
  onRemove: (() => void) | undefined;
  colors: any;
}

function HistoryChip({
  query,
  displayText,
  onSelect,
  onRemove,
  colors,
}: HistoryChipProps) {
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity style={styles.chipTextWrap} onPress={onSelect}>
        <Text style={[styles.chipText, { color: colors.text }]} numberOfLines={1}>
          {displayText}
        </Text>
      </TouchableOpacity>
      {onRemove && (
        <TouchableOpacity
          style={[styles.chipClose, { backgroundColor: colors.border }]}
          onPress={onRemove}
          accessibilityLabel={t("imagePicker.removeFromHistory", { query })}
        >
          <Ionicons name="close" size={ICON_SIZE_SMALL} color={colors.mutedText} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  historyChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  chip: {
    borderRadius: BORDER_RADIUS_PILL,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 6,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  chipTextWrap: {
    paddingRight: 6,
  },
  chipText: {
    fontSize: 12,
  },
  chipClose: {
    width: CHIP_CLOSE_SIZE,
    height: CHIP_CLOSE_SIZE,
    borderRadius: CHIP_CLOSE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  clearHistoryText: {
    fontSize: 12,
  },
});