import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/useAppTheme";
import { Button, GlassCard } from "@/components/ui/core";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.5;

interface StudyCardProps {
  front: string;
  back: string;
  hint?: string;
  currentIndex: number;
  totalCards: number;
  onKnew: () => void;
  onDidntKnow: () => void;
}

export function StudyCard({
  front,
  back,
  hint,
  currentIndex,
  totalCards,
  onKnew,
  onDidntKnow,
}: StudyCardProps) {
  const { colors } = useAppTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const flipAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);

  const handleFlip = () => {
    const newValue = isFlipped ? 0 : 1;
    flipAnimation.value = withSpring(newValue, {
      damping: 20,
      stiffness: 90,
    });
    setIsFlipped(!isFlipped);
    setShowHint(false);
  };

  const handleShowHint = () => {
    setShowHint(true);
    scaleAnimation.value = withSpring(0.98, { damping: 15 });
    setTimeout(() => {
      scaleAnimation.value = withSpring(1, { damping: 15 });
    }, 100);
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      flipAnimation.value,
      [0, 1],
      [0, 180],
      Extrapolate.CLAMP
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotate}deg` },
        { scale: scaleAnimation.value },
      ],
      opacity: interpolate(
        flipAnimation.value,
        [0, 0.5, 1],
        [1, 0, 0],
        Extrapolate.CLAMP
      ),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      flipAnimation.value,
      [0, 1],
      [180, 360],
      Extrapolate.CLAMP
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotate}deg` },
        { scale: scaleAnimation.value },
      ],
      opacity: interpolate(
        flipAnimation.value,
        [0, 0.5, 1],
        [0, 0, 1],
        Extrapolate.CLAMP
      ),
    };
  });

  const progressPercentage = ((currentIndex + 1) / totalCards) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <LinearGradient
            colors={[colors.primary, `${colors.primary}DD`]}
            style={[
              styles.progressFill,
              { width: `${progressPercentage}%` },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.mutedText }]}>
          {currentIndex + 1} / {totalCards}
        </Text>
      </View>

      {/* Card Container */}
      <Pressable onPress={handleFlip} style={styles.cardContainer}>
        {/* Front Side */}
        <Animated.View
          style={[
            styles.card,
            frontAnimatedStyle,
            { backgroundColor: colors.surface },
          ]}
        >
          <BlurView
            intensity={30}
            tint="light"
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.02)"]}
            style={[
              StyleSheet.absoluteFillObject,
              { borderRadius: 24 },
            ]}
          />
          <View style={styles.cardBorder} />

          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: colors.primary }]}>
              PYTANIE
            </Text>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.cardText, { color: colors.text }]}>
                {front}
              </Text>
            </ScrollView>

            {hint && !showHint && !isFlipped && (
              <Button
                variant="glass"
                size="small"
                icon="bulb-outline"
                onPress={handleShowHint}
                style={styles.hintButton}
              >
                Pokaż wskazówkę
              </Button>
            )}

            {showHint && (
              <GlassCard style={styles.hintContainer} glassLevel="light">
                <Text style={[styles.hintText, { color: colors.mutedText }]}>
                  💡 {hint}
                </Text>
              </GlassCard>
            )}
          </View>

          <View style={styles.tapHint}>
            <Ionicons name="hand-left-outline" size={20} color={colors.mutedText} />
            <Text style={[styles.tapHintText, { color: colors.mutedText }]}>
              Stuknij, aby odwrócić
            </Text>
          </View>
        </Animated.View>

        {/* Back Side */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            backAnimatedStyle,
            { backgroundColor: colors.surface },
          ]}
        >
          <BlurView
            intensity={30}
            tint="light"
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
            style={[
              StyleSheet.absoluteFillObject,
              { borderRadius: 24 },
            ]}
          />
          <View style={styles.cardBorder} />

          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: colors.primary }]}>
              ODPOWIEDŹ
            </Text>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.cardText, { color: colors.text }]}>
                {back}
              </Text>
            </ScrollView>
          </View>
        </Animated.View>
      </Pressable>

      {/* Action Buttons */}
      {isFlipped && (
        <View style={styles.actionButtons}>
          <Button
            variant="glass"
            size="large"
            icon="close-circle"
            onPress={onDidntKnow}
            style={styles.actionButton}
          >
            Nie wiem
          </Button>
          <Button
            variant="primary"
            size="large"
            icon="checkmark-circle"
            onPress={onKnew}
            style={styles.actionButton}
          >
            Wiem
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    padding: 24,
    position: "absolute",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardBack: {
    position: "absolute",
  },
  cardBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cardContent: {
    flex: 1,
    zIndex: 1,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  cardText: {
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 32,
  },
  hintButton: {
    marginTop: 16,
  },
  hintContainer: {
    marginTop: 16,
    padding: 12,
  },
  hintText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
  },
  tapHintText: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 20,
  },
  actionButton: {
    flex: 1,
  },
  wrongButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
});