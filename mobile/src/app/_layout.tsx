// import { Stack } from "expo-router";
// import { PaperProvider } from "react-native-paper";
// import ThemeProvider, { useCustomTheme } from "../context/ThemeContext";
// import { Provider, useDispatch } from "react-redux";
// import reduxStore from "../redux/store";
// import { useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { setUser } from "../redux/slices/auth.slice";

// export default function RootLayout() {
//   return (
//     <ThemeProvider>
//       <LayoutWithTheme />
//     </ThemeProvider>
//   );
// }

// function LayoutWithTheme() {
//   const { theme } = useCustomTheme()

//   const dispatch = useDispatch();

//   useEffect(() => {
//     const loadUser = async () => {
//       const storedUser = await AsyncStorage.getItem("user");
//       if (storedUser) {
//         dispatch(setUser(JSON.parse(storedUser)));
//       }
//     };
//     loadUser();
//   }, []);

//   return (
//     <Provider store={reduxStore}>
//       <PaperProvider theme={theme}>
//         <Stack>
//           <Stack.Screen name="index" options={{ title: "Home" }} />
//           <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
//           <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
//         </Stack>
//       </PaperProvider>
//     </Provider>
//   );
// }

import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import ThemeProvider, { useCustomTheme } from "../context/ThemeContext";
import { Provider, useDispatch } from "react-redux";
import reduxStore from "../redux/store";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setUser } from "../redux/slices/auth.slice";

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
      <Stack>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen name="(plan)/select-plan" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}

