import { Stack } from "expo-router";
import { PaperProvider, Text } from "react-native-paper";
import ThemeProvider, { useCustomTheme } from "../context/ThemeContext";
import { Provider, useDispatch } from "react-redux";
import reduxStore from "../redux/store";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setUser } from "../redux/slices/auth.slice";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { ImageContextProvider } from "../context/ImageContext";
import AccountMenu from "../components/AccountMenu";

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
  const dispatch = useDispatch();

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: "195321382919-59fvu1pkgvlr27mtdepi4adqu0n28coo.apps.googleusercontent.com",
      webClientId: "195321382919-tsnvc3kjooknep269f341otuln8q81q4.apps.googleusercontent.com",
      profileImageSize: 150
    })
  }, [])


  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        dispatch(setUser(JSON.parse(storedUser)));
      }
    };
    loadUser();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <ImageContextProvider>
        <AutocompleteDropdownContextProvider>
          <Stack>

            <Stack.Screen
              name="index"
              options={{
                headerTitle: "",
                headerStyle: { backgroundColor: theme.colors.background },
                headerRight: () => <AccountMenu />,
                headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
              }}
            />

            <Stack.Screen
              name="dashboard"
              options={{
                headerTitle: "",
                headerRight: () => <AccountMenu />,
                headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
              }}
            />

            <Stack.Screen
              name="profile"
              options={{
                headerTitle: "",
                headerRight: () => <AccountMenu />,
                headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
              }}
            />

            <Stack.Screen name="brands/index" options={{
              headerTitle: "",
              headerBackVisible: false,
              headerStyle: { backgroundColor: theme.colors.background },
              headerRight: () => <AccountMenu />,
              headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
            }} />
            <Stack.Screen name="brands/add" options={{
              headerTitle: "",
              headerBackVisible: false,
              headerStyle: { backgroundColor: theme.colors.background },
              headerRight: () => <AccountMenu />,
              headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
            }} />

            <Stack.Screen name="users/index" options={{
              headerTitle: "",
              headerBackVisible: false,
              headerRight: () => <AccountMenu />,
              headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
            }} />
            <Stack.Screen name="users/add" options={{
              headerTitle: "",
              headerBackVisible: false,
              headerRight: () => <AccountMenu />,
              headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
            }} />

            <Stack.Screen name="notifications/index" options={{
              headerTitle: "",
              headerBackVisible: false,
              headerRight: () => <AccountMenu />,
              headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
            }} />
            <Stack.Screen name="notifications/add" options={{
              headerTitle: "",
              headerBackVisible: false,
              headerRight: () => <AccountMenu />,
              headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
            }} />

            <Stack.Screen name="products/index" options={{
              headerTitle: "",
              headerBackVisible: false,
              headerRight: () => <AccountMenu />,
              headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
            }} />
            <Stack.Screen name="products/add" options={{
              headerTitle: "",
              headerBackVisible: false,
              headerRight: () => <AccountMenu />,
              headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
            }} />

            <Stack.Screen name="policies/index" options={{
              headerTitle: "",
              headerBackVisible: false,
              headerRight: () => <AccountMenu />,
              headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
            }} />
            <Stack.Screen name="policies/add" options={{
              headerTitle: "",
              headerBackVisible: false,
              headerRight: () => <AccountMenu />,
              headerLeft: () => <Text style={{ fontSize: 18, fontWeight: "bold" }}>Warranty Wallet</Text>
            }} />

            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
            <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="plans/select-plan" options={{ headerShown: false }} />

          </Stack>
        </AutocompleteDropdownContextProvider>
      </ImageContextProvider>
    </PaperProvider>
  );
}

