import { useCallback, useRef } from 'react';
import { runOnJS, useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import type { CustomFlashcard } from '@/types/flashcard';

interface UseDragAndDropOptions {
  data: CustomFlashcard[];
  itemHeight: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  enabled?: boolean;
}

interface DragAndDropResult {
  createLongPressGesture: (index: number) => any;
  draggedIndex: any;
  dragOffsetY: any;
  isDragging: any;
  isDragAvailable: any;
  isDragActive: any;
  dragState: any;
}

export function useDragAndDrop({
  data,
  itemHeight,
  onReorder,
  enabled = true,
}: UseDragAndDropOptions): DragAndDropResult {
  const draggedIndex = useSharedValue(-1);
  const dragOffsetY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const isDragAvailable = useSharedValue(false);
  const initialY = useRef(0);
  const lastHapticIndex = useRef(-1);

  // Create derived values for safer access patterns
  const isDragActive = useDerivedValue(() => {
    return isDragging.value && draggedIndex.value >= 0;
  });

  const dragState = useDerivedValue(() => {
    return {
      isDragging: isDragging.value,
      draggedIndex: draggedIndex.value,
      dragOffsetY: dragOffsetY.value,
      isDragAvailable: isDragAvailable.value,
    };
  });

  const triggerHapticFeedback = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const calculateNewIndex = useCallback((offsetY: number, currentIndex: number): number => {
    'worklet';
    const itemsCount = data.length;
    const displacement = offsetY / itemHeight;
    let newIndex = currentIndex + Math.round(displacement);
    
    // Clamp to valid range
    newIndex = Math.max(0, Math.min(itemsCount - 1, newIndex));
    
    return newIndex;
  }, [data.length, itemHeight]);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }
  }, [onReorder]);

  const createLongPressGesture = useCallback((index: number) => {
    if (!enabled || index < 0 || index >= data.length) {
      return Gesture.LongPress().enabled(false);
    }

    const pan = Gesture.Pan()
      .activateAfterLongPress(250)
      .onStart((event) => {
        'worklet';
        try {
          // Activate drag mode
          isDragAvailable.value = true;
          isDragging.value = true;
          draggedIndex.value = index;
          dragOffsetY.value = 0;
          initialY.current = event.absoluteY;
          lastHapticIndex.current = index;
          
          // Strong haptic feedback on drag start
          runOnJS(() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch (error) {
              console.warn('[DragAndDrop] Haptic feedback error:', error);
            }
          })();
        } catch (error) {
          console.warn('[DragAndDrop] Error in pan onStart:', error);
          // Reset state on error
          isDragging.value = false;
          draggedIndex.value = -1;
          dragOffsetY.value = 0;
          isDragAvailable.value = false;
        }
      })
      .onUpdate((event) => {
        'worklet';
        try {
          if (!isDragging.value || draggedIndex.value !== index) return;
          
          dragOffsetY.value = event.translationY;
          
          // Calculate current target index and trigger haptic feedback for boundaries
          const currentTargetIndex = calculateNewIndex(event.translationY, index);
          if (currentTargetIndex !== lastHapticIndex.current && 
              currentTargetIndex >= 0 && currentTargetIndex < data.length) {
            lastHapticIndex.current = currentTargetIndex;
            runOnJS(() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (error) {
                console.warn('[DragAndDrop] Haptic feedback error:', error);
              }
            })();
          }
        } catch (error) {
          console.warn('[DragAndDrop] Error in pan onUpdate:', error);
        }
      })
      .onEnd((event) => {
        'worklet';
        try {
          if (!isDragging.value || draggedIndex.value !== index) {
            // Reset state if invalid
            isDragging.value = false;
            draggedIndex.value = -1;
            dragOffsetY.value = 0;
            isDragAvailable.value = false;
            return;
          }
          
          // Calculate final position
          const newIndex = calculateNewIndex(event.translationY, index);
          
          if (newIndex !== index && newIndex >= 0 && newIndex < data.length) {
            runOnJS(handleReorder)(index, newIndex);
            runOnJS(() => {
              try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch (error) {
                console.warn('[DragAndDrop] Haptic feedback error:', error);
              }
            })();
          }
          
          // Reset all drag state
          isDragging.value = false;
          draggedIndex.value = -1;
          dragOffsetY.value = 0;
          isDragAvailable.value = false;
          lastHapticIndex.current = -1;
        } catch (error) {
          console.warn('[DragAndDrop] Error in pan onEnd:', error);
          // Force reset on error
          isDragging.value = false;
          draggedIndex.value = -1;
          dragOffsetY.value = 0;
          isDragAvailable.value = false;
          lastHapticIndex.current = -1;
        }
      })
      .onFinalize(() => {
        'worklet';
        try {
          // Ensure complete cleanup
          isDragging.value = false;
          draggedIndex.value = -1;
          dragOffsetY.value = 0;
          isDragAvailable.value = false;
          lastHapticIndex.current = -1;
        } catch (error) {
          console.warn('[DragAndDrop] Error in pan onFinalize:', error);
        }
      });

    return pan;
  }, [
    enabled,
    itemHeight,
    isDragging,
    draggedIndex,
    dragOffsetY,
    isDragAvailable,
    triggerHapticFeedback,
    calculateNewIndex,
    handleReorder,
    data.length,
  ]);

  return {
    createLongPressGesture,
    draggedIndex,
    dragOffsetY,
    isDragging,
    isDragAvailable,
    isDragActive,
    dragState,
  };
}