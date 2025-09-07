import { useAppTheme } from '@/theme/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SnackbarProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

export function Snackbar({ visible, message, type, onDismiss }: SnackbarProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const translateY = new Animated.Value(100);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible && !message) return null;

  const getSnackbarColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'info':
      default:
        return colors.primary;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: insets.bottom + 16,
          left: 16,
          right: 16,
          width: screenWidth - 32,
          backgroundColor: getSnackbarColor(),
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        style={styles.content}
        onPress={onDismiss}
        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
      >
        <Ionicons name={getIcon()} size={20} color="white" style={styles.icon} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <Ionicons name="close" size={16} color="rgba(255,255,255,0.8)" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
});