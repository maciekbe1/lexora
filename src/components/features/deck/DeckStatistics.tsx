import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";
import { GlassCard } from "@/components/ui/core";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { UserDeck } from "@/types/flashcard";

interface DeckStatisticsProps {
  deck: UserDeck;
  flashcardCount: number;
  dueToday?: number | null;
}

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
  percentage?: number;
}

function StatCard({ icon, label, value, color, percentage }: StatCardProps) {
  const { colors } = useAppTheme();

  return (
    <GlassCard style={styles.statCard} glassLevel="light" elevation={2}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statLabel, { color: colors.mutedText }]}>
        {label}
      </Text>
      <Text style={[styles.statValue, { color: colors.text }]}>
        {value}
      </Text>
      {percentage !== undefined && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <LinearGradient
              colors={[color, `${color}AA`]}
              style={[styles.progressFill, { width: `${percentage}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>
      )}
    </GlassCard>
  );
}

export function DeckStatistics({
  deck,
  flashcardCount,
  dueToday,
}: DeckStatisticsProps) {
  const { colors } = useAppTheme();

  const newCards = deck.stats_new || 0;
  const learningCards = deck.stats_learning || 0;
  const reviewCards = deck.stats_review || 0;
  const masteredCards = deck.stats_mastered || 0;

  const totalStudied = learningCards + reviewCards + masteredCards;
  const masteryPercentage = flashcardCount > 0
    ? Math.round((masteredCards / flashcardCount) * 100)
    : 0;

  const studyStreak = 0; // TODO: Calculate from progress data
  const avgAccuracy = 85; // TODO: Calculate from study sessions

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Overview Section */}
      <GlassCard style={styles.overviewCard} glassLevel="medium" elevation={3}>
        <View style={styles.overviewHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Przegląd nauki
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>
              {masteryPercentage}% opanowane
            </Text>
          </View>
        </View>

        <View style={styles.overviewStats}>
          <View style={styles.overviewStat}>
            <Text style={[styles.overviewValue, { color: colors.primary }]}>
              {flashcardCount}
            </Text>
            <Text style={[styles.overviewLabel, { color: colors.mutedText }]}>
              wszystkich fiszek
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.overviewStat}>
            <Text style={[styles.overviewValue, { color: "#34C759" }]}>
              {dueToday || 0}
            </Text>
            <Text style={[styles.overviewLabel, { color: colors.mutedText }]}>
              na dziś
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.overviewStat}>
            <Text style={[styles.overviewValue, { color: "#FF9500" }]}>
              {totalStudied}
            </Text>
            <Text style={[styles.overviewLabel, { color: colors.mutedText }]}>
              przestudiowanych
            </Text>
          </View>
        </View>
      </GlassCard>

      {/* Progress Distribution */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Rozkład postępu
      </Text>
      <View style={styles.statsGrid}>
        <StatCard
          icon="sparkles"
          label="Nowe"
          value={newCards}
          color="#007AFF"
          percentage={flashcardCount > 0 ? (newCards / flashcardCount) * 100 : 0}
        />
        <StatCard
          icon="school"
          label="W nauce"
          value={learningCards}
          color="#FF9500"
          percentage={flashcardCount > 0 ? (learningCards / flashcardCount) * 100 : 0}
        />
        <StatCard
          icon="refresh"
          label="Do powtórki"
          value={reviewCards}
          color="#AF52DE"
          percentage={flashcardCount > 0 ? (reviewCards / flashcardCount) * 100 : 0}
        />
        <StatCard
          icon="checkmark-circle"
          label="Opanowane"
          value={masteredCards}
          color="#34C759"
          percentage={flashcardCount > 0 ? (masteredCards / flashcardCount) * 100 : 0}
        />
      </View>

      {/* Learning Metrics */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Metryki nauki
      </Text>
      <View style={styles.metricsRow}>
        <GlassCard style={styles.metricCard} glassLevel="light">
          <Ionicons name="flame" size={32} color="#FF3B30" />
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {studyStreak}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.mutedText }]}>
            dni z rzędu
          </Text>
        </GlassCard>
        <GlassCard style={styles.metricCard} glassLevel="light">
          <Ionicons name="trending-up" size={32} color="#34C759" />
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {avgAccuracy}%
          </Text>
          <Text style={[styles.metricLabel, { color: colors.mutedText }]}>
            skuteczność
          </Text>
        </GlassCard>
      </View>

      {/* Study Recommendations */}
      <GlassCard style={styles.recommendationCard} glassLevel="medium">
        <View style={styles.recommendationHeader}>
          <Ionicons name="bulb" size={24} color={colors.primary} />
          <Text style={[styles.recommendationTitle, { color: colors.text }]}>
            Zalecenia
          </Text>
        </View>
        <Text style={[styles.recommendationText, { color: colors.mutedText }]}>
          {dueToday && dueToday > 0
            ? `Masz ${dueToday} fiszek do przejrzenia. Regularna nauka pomoże Ci lepiej zapamiętać materiał!`
            : newCards > 0
            ? `Masz ${newCards} nowych fiszek do nauki. Zacznij od nich, aby poszerzyć swoją wiedzę!`
            : "Świetnie! Wszystkie fiszki zostały przejrzane. Wróć jutro po więcej."}
        </Text>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  overviewCard: {
    padding: 20,
    marginBottom: 24,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  overviewStat: {
    alignItems: "center",
    flex: 1,
  },
  overviewValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 16,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  progressContainer: {
    width: "100%",
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "700",
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 12,
  },
  recommendationCard: {
    padding: 20,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
  },
});