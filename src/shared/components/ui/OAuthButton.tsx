import { AntDesign, Ionicons } from "@expo/vector-icons";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../../../store/auth";

interface OAuthButtonProps {
  provider: "google" | "apple";
  onPress?: () => void;
  disabled?: boolean;
  mode?: "sign-in" | "sign-up";
  title?: string;
}

export function OAuthButton({
  provider,
  onPress,
  disabled = false,
  mode = "sign-in",
  title,
}: OAuthButtonProps) {
  const { signInWithOAuth, loading } = useAuthStore();
  const isGoogle = provider === "google";
  const actionText =
    title ||
    `${mode === "sign-in" ? "Sign in" : "Sign up"} with ${
      isGoogle ? "Google" : "Apple"
    }`;

  if (provider === "apple" && Platform.OS !== "ios") {
    return null; // Don't show Apple Sign In on non-iOS platforms
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      signInWithOAuth(provider);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isGoogle ? styles.googleButton : styles.appleButton,
        disabled && styles.buttonDisabled,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <View style={styles.iconContainer}>
          {isGoogle ? (
            <AntDesign name="google" size={20} color="#4285F4" />
          ) : (
            <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
          )}
        </View>
        <Text
          style={[
            styles.buttonText,
            isGoogle ? styles.googleButtonText : styles.appleButtonText,
          ]}
        >
          {loading ? "Logowanie..." : actionText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 12,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Google specific styles
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADCE0",
  },
  googleButtonText: {
    color: "#3C4043",
  },

  // Apple specific styles
  appleButton: {
    backgroundColor: "#000000",
  },
  appleButtonText: {
    color: "#FFFFFF",
  },
});
