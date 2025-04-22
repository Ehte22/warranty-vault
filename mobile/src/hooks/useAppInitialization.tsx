import { useEffect, useState } from "react";
import { SplashScreen } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/auth.slice";

export const useAppInitialization = () => {
    const [appState, setAppState] = useState<{
        isReady: boolean;
        initialRoute?: string;
    }>({ isReady: false });
    const dispatch = useDispatch()

    useEffect(() => {
        const prepare = async () => {
            try {
                await SplashScreen.preventAutoHideAsync();

                const alreadyLaunched = await AsyncStorage.getItem('alreadyLaunched');
                const user = await AsyncStorage.getItem('user');

                let route = 'auth/login';

                if (!alreadyLaunched) {
                    route = 'onboarding';
                    await AsyncStorage.setItem('alreadyLaunched', 'true');
                } else if (user) {
                    route = '/';
                    dispatch(setUser(JSON.parse(user)));
                }

                setAppState({ isReady: true, initialRoute: route });
            } catch (error) {
                console.error('Initialization error:', error);
                setAppState({ isReady: true, initialRoute: 'auth/login' });
            } finally {
                await SplashScreen.hideAsync();
            }
        };

        prepare();
    }, []);

    return appState;
};