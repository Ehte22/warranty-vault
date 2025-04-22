import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, PaperProvider, Text } from "react-native-paper";
import ThemeProvider, { useCustomTheme } from "../context/ThemeContext";
import { Provider } from "react-redux";
import reduxStore from "../redux/store";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { ImageContextProvider } from "../context/ImageContext";
import AccountMenu from "../components/AccountMenu";
import { AppState, View } from "react-native";
import { useAppInitialization } from "../hooks/useAppInitialization";
import * as SplashScreen from "expo-splash-screen"

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Provider store={reduxStore}>
      <ThemeProvider>
        <LayoutWithTheme />
      </ThemeProvider>
    </Provider>
  );
}

function LayoutWithTheme() {
  const { theme } = useCustomTheme();
  const router = useRouter()
  const { isReady, initialRoute } = useAppInitialization()

  useEffect(() => {
    if (isReady && initialRoute) {
      router.replace(initialRoute as any)
    }

  }, [isReady, initialRoute])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'background') {
        await AsyncStorage.removeItem('hasAuthenticated');
      }
    });
    return () => subscription.remove();
  }, [])


  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  }

  const screenOptions = {
    headerTitle: "",
    headerStyle: { backgroundColor: theme.colors.background },
    headerRight: () => <AccountMenu />,
    headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
  }

  return <>
    <PaperProvider theme={theme}>
      <ImageContextProvider>
        <AutocompleteDropdownContextProvider>

          <Stack screenOptions={screenOptions}>

            <Stack.Screen name="onboarding" options={{ headerShown: false }} />

            <Stack.Screen name="index" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="profile" options={{ headerShown: false }} />

            <Stack.Screen name="brands/index" />
            <Stack.Screen name="brands/add" />

            <Stack.Screen name="users/index" />
            <Stack.Screen name="users/add" />

            <Stack.Screen name="notifications/index" />
            <Stack.Screen name="notifications/add" />

            <Stack.Screen name="products/index" />
            <Stack.Screen name="products/add" />

            <Stack.Screen name="policies/index" />
            <Stack.Screen name="policies/add" />

            <Stack.Screen name="policy-types/index" />
            <Stack.Screen name="policy-types/add" />

            <Stack.Screen name="referrals" />

            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
            <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />

            <Stack.Screen name="plans/upgrade-plan" options={{ headerShown: false }} />
            <Stack.Screen name="plans/select-plan" options={{ headerShown: false }} />

            <Stack.Screen name="pin/set" options={{ headerShown: false }} />
            <Stack.Screen name="pin/verify" options={{ headerShown: false }} />

            <Stack.Screen
              name="settings"
              options={{
                ...screenOptions,
                headerTitle: "Settings",
                headerLeft: () => null,
                headerRight: () => null,
              }}
            />

          </Stack>

        </AutocompleteDropdownContextProvider>
      </ImageContextProvider>
    </PaperProvider >
  </>
}

