import { MD3LightTheme, MD3DarkTheme, MD3Theme } from "react-native-paper";

export interface CustomTheme extends MD3Theme {
    colors: MD3Theme["colors"] & {
        text: string,
        inputBackground: string,
        borderColor: string,
        errorText: string,
        cardBg: string,
        btnText: string
        bgSecondary: string
    }
}

export const lightTheme: CustomTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: "#00c979",
        background: "#ffffff",
        bgSecondary: "#f3f3f3",
        text: "#000000",
        btnText: "#ffffff",
        inputBackground: "#fff",
        borderColor: "#000000",
        errorText: "#B3261E",
        cardBg: "#fff",

    },
};

export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: "#00c979",
        background: "#121212",
        bgSecondary: "#121212",
        text: "#D1D5DB",
        btnText: "#111827",
        inputBackground: "#111827",
        borderColor: "#D1D5DB",
        errorText: "#F2B8B5",
        cardBg: "#111827",
    },
};
