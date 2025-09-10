import type { CustomFlashcard } from "@/types/flashcard";
import React from "react";
import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";
import { useAppTheme } from "@/theme/useAppTheme";

interface DraggableFlashcardItemProps {
  flashcard: CustomFlashcard;
  index: number;
  longPressGesture: any;
  draggedIndex: any;
  dragOffsetY: any;
  isDragging: any;
  isDragAvailable: any;
  onPress: (flashcard: CustomFlashcard) => void;
  isDragEnabled: boolean;
}

const ITEM_HEIGHT = 200; // Approximate height of a flashcard item

export function DraggableFlashcardItem({
  flashcard,
  index,
  longPressGesture,
  draggedIndex,
  dragOffsetY,
  isDragging,
  isDragAvailable,
  onPress,
  isDragEnabled: _isDragEnabled,
}: DraggableFlashcardItemProps) {
  const { colors } = useAppTheme();

  // Use derived values to avoid accessing .value during render
  const canInteract = useDerivedValue(() => {
    return !isDragging.value && !isDragAvailable.value;
  });

  const animatedStyle = useAnimatedStyle(() => {
    try {
      const isBeingDragged = draggedIndex.value === index;
      const isDraggingAny = isDragging.value;
      const isLongPressing = isDragAvailable.value && !isDraggingAny;
    
    // Enhanced scale and shadow effects
    let scale = 1;
    if (isBeingDragged) {
      scale = withSpring(1.08, { damping: 12, stiffness: 200 });
    } else if (isLongPressing) {
      scale = withSpring(1.02, { damping: 15, stiffness: 150 });
    } else {
      scale = withSpring(1, { damping: 15, stiffness: 150 });
    }
    
    let shadowOpacity = 0.1;
    if (isBeingDragged) {
      shadowOpacity = withSpring(0.4, { damping: 12, stiffness: 200 });
    } else if (isLongPressing) {
      shadowOpacity = withSpring(0.2, { damping: 15, stiffness: 150 });
    } else {
      shadowOpacity = withSpring(0.1, { damping: 15, stiffness: 150 });
    }
    
    let elevation = 5;
    if (isBeingDragged) {
      elevation = withSpring(15, { damping: 12, stiffness: 200 });
    } else if (isLongPressing) {
      elevation = withSpring(8, { damping: 15, stiffness: 150 });
    } else {
      elevation = withSpring(5, { damping: 15, stiffness: 150 });
    }

    // Translation for the dragged item
    const translateY = isBeingDragged
      ? dragOffsetY.value
      : 0;

    // Enhanced displacement animation for other items
    let displacement = 0;
    if (isDraggingAny && !isBeingDragged && draggedIndex.value !== -1) {
      const draggedFromIndex = draggedIndex.value;
      const currentOffset = dragOffsetY.value;
      const itemsToMove = Math.round(currentOffset / ITEM_HEIGHT);
      const targetIndex = Math.max(0, Math.min(draggedFromIndex + itemsToMove, 10)); // Clamp for safety
      
      // Calculate if this item should move with improved logic
      if (draggedFromIndex < targetIndex && index > draggedFromIndex && index <= targetIndex) {
        displacement = -ITEM_HEIGHT;
      } else if (draggedFromIndex > targetIndex && index < draggedFromIndex && index >= targetIndex) {
        displacement = ITEM_HEIGHT;
      }
    }

    displacement = withSpring(displacement, { damping: 18, stiffness: 180 });

    // Enhanced opacity effects
    let opacity = 1;
    if (isDraggingAny && !isBeingDragged) {
      opacity = withSpring(0.6, { damping: 15, stiffness: 150 });
    } else if (isLongPressing) {
      opacity = withSpring(0.95, { damping: 15, stiffness: 150 });
    } else {
      opacity = withSpring(1, { damping: 15, stiffness: 150 });
    }

      return {
        transform: [
          { translateY: translateY + displacement },
          { scale },
        ],
        shadowOpacity,
        elevation,
        opacity,
        zIndex: isBeingDragged ? 1000 : (isLongPressing ? 100 : 1),
      };
    } catch (error) {
      console.warn('[DraggableFlashcardItem] Animation error:', error);
      return {
        transform: [{ translateY: 0 }, { scale: 1 }],
        shadowOpacity: 0.1,
        elevation: 5,
        opacity: 1,
        zIndex: 1,
      };
    }
  }, [index]);

  const feedbackStyle = useAnimatedStyle(() => {
    try {
      const isDragReady = isDragAvailable.value;
      const borderWidth = isDragReady ? withSpring(2, { damping: 15, stiffness: 200 }) : withSpring(0, { damping: 15, stiffness: 200 });
      return {
        borderWidth,
        borderColor: isDragReady ? colors.primary : 'transparent',
      };
    } catch (error) {
      console.warn('[DraggableFlashcardItem] Feedback style error:', error);
      return {
        borderWidth: 0,
        borderColor: 'transparent',
      };
    }
  });

  // Create a stable press handler that doesn't access shared values during render
  const handlePress = React.useCallback(() => {
    try {
      onPress(flashcard);
    } catch (error) {
      console.warn('[DraggableFlashcardItem] Press handler error:', error);
    }
  }, [onPress, flashcard]);

  // Use animated style for TouchableOpacity interaction
  const touchableStyle = useAnimatedStyle(() => {
    return {
      opacity: canInteract.value ? 1 : 0.5,
    };
  });

  return (
    <GestureDetector gesture={longPressGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Animated.View
          style={[styles.flashcardItem, { backgroundColor: colors.surface }, feedbackStyle]}
        >
          {/* Flashcard Content */}
          <Animated.View style={touchableStyle}>
            <TouchableOpacity 
              style={styles.content} 
              onPress={handlePress}
              activeOpacity={0.9}
            >
            <View style={styles.flashcardHeader}>
              <Text style={[styles.flashcardNumber, { color: colors.primary }]}>#{index + 1}</Text>
            </View>

            <View style={styles.flashcardContent}>
              <View style={styles.cardSide}>
                <Text style={[styles.sideLabel, { color: colors.mutedText }]}>Przód:</Text>
                {flashcard.front_image_url ? (
                  <Image
                    source={{ uri: flashcard.front_image_url }}
                    style={styles.cardImage}
                  />
                ) : null}
                <Text style={[styles.cardText, { color: colors.text }]}>{flashcard.front_text}</Text>
              </View>

              <View style={styles.cardSide}>
                <Text style={[styles.sideLabel, { color: colors.mutedText }]}>Tył:</Text>
                {flashcard.back_image_url ? (
                  <Image
                    source={{ uri: flashcard.back_image_url }}
                    style={styles.cardImage}
                  />
                ) : null}
                <Text style={[styles.cardText, { color: colors.text }]}>{flashcard.back_text}</Text>
              </View>

              {flashcard.hint_text ? (
                <View style={styles.cardSide}>
                  <Text style={[styles.sideLabel, { color: colors.mutedText }]}>Podpowiedź:</Text>
                  <Text style={[styles.hintText, { color: colors.mutedText }]}>{flashcard.hint_text}</Text>
                </View>
              ) : null}
            </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  flashcardItem: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  content: {
    flex: 1,
  },
  flashcardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  flashcardNumber: {
    fontSize: 16,
    fontWeight: "600",
  },
  flashcardContent: {
    gap: 16,
  },
  cardSide: {
    gap: 8,
  },
  sideLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardText: {
    fontSize: 16,
    lineHeight: 22,
  },
  cardImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
  },
  hintText: {
    fontSize: 14,
    fontStyle: "italic",
  },
});