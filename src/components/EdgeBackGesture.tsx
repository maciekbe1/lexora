import { useRouter } from "expo-router";
import React, { PropsWithChildren } from "react";
import { Dimensions, I18nManager, Platform } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

const EDGE_WIDTH = 24; // active zone at the left edge
const SWIPE_THRESHOLD = 60; // min drag X to trigger back

export function EdgeBackGesture({ children }: PropsWithChildren) {
  const router = useRouter();

  // iOS has native back-swipe via Stack; only wrap Android
  if (Platform.OS !== "android") return <>{children}</>;
  let startX = 0;
  const pan = Gesture.Pan()
    .enabled(true)
    .hitSlop({ left: 0, width: EDGE_WIDTH })
    .activeOffsetX([10, 9999])
    .onBegin((e: any) => {
      // capture initial absolute X at gesture start
      // some platforms expose x, others absoluteX
      // prefer absoluteX when available
      startX = (typeof e.absoluteX === 'number' ? e.absoluteX : e.x) ?? 0;
    })
    .onEnd((e) => {
      const isRTL = I18nManager.isRTL;
      const screenWidth = Dimensions.get("window").width;
      const fromEdge = isRTL ? screenWidth - startX : startX;

      if (fromEdge <= EDGE_WIDTH && e.translationX > SWIPE_THRESHOLD) {
        if (router.canGoBack()) router.back();
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={{ flex: 1 }}>{children}</Animated.View>
    </GestureDetector>
  );
}
