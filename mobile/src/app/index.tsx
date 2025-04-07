import { Text, View } from "react-native";
import { Link } from "expo-router"
import { useCustomTheme } from "../context/ThemeContext";
import { Button, useTheme } from "react-native-paper";

export default function Index() {
  const { theme, toggleTheme } = useCustomTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background
      }}
    >
      <Text style={{ color: theme.colors.text, borderRadius: 0 }}>Edit app/index.tsx to edit this screen.</Text>

      <Button mode="contained" style={{ borderRadius: 4 }} labelStyle={{ color: theme.dark ? "black" : "white" }} onPress={toggleTheme}>
        Toggle Theme
      </Button>

      <Link href="/login" style={{ color: theme.colors.text }}>Login</Link>
      <Link href="/register" style={{ color: theme.colors.text }}>Register</Link>
      <Link href="/select-plan" style={{ color: theme.colors.text }}>Select Plan</Link>
    </View>
  );
}
