import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCustomTheme } from '../context/ThemeContext';
import { CustomTheme } from '../theme/theme';
import { Button, Divider, Modal, Portal, Surface } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const menuItems = [
  { id: '1', name: 'Dashboard', icon: 'dashboard', screen: '/dashboard' },
  { id: '2', name: 'Profile', icon: 'person', screen: '/profile' },
  { id: '3', name: 'Users', icon: 'group', screen: '/users' },
  { id: '4', name: 'Brands', icon: 'branding-watermark', screen: '/brands' },
  { id: '5', name: 'Products', icon: 'inventory-2', screen: '/products' },
  { id: '6', name: 'Policies', icon: 'article', screen: '/policies' },
  { id: '7', name: 'P - Types', icon: 'gavel', screen: '/policy-types' },
  { id: '8', name: 'Notification', icon: 'notifications', screen: '/notifications' },
  { id: '9', name: 'Settings', icon: 'settings', screen: '/settings' },
];

const Home = () => {
  const router = useRouter();
  const { theme } = useCustomTheme()
  const [isError, setIsError] = useState(false)
  const styles = customStyles(theme)
  const { user } = useSelector((state: RootState) => state.auth)
  const params = useLocalSearchParams()

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => router.push(item.screen)}
    >
      <MaterialIcons name={item.icon} size={30} color={theme.colors.primary} />
      <Text style={styles.menuText}>{item.name}</Text>
    </TouchableOpacity>
  );


  useEffect(() => {
    const checkAuthCapabilities = async () => {

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      if (params.verified === "true") return;

      const alreadyAuthed = await AsyncStorage.getItem('hasAuthenticated');
      if (alreadyAuthed === 'true') return;

      const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync();

      if (enrolledLevel > 0) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Login with Mobile Password',
          fallbackLabel: 'Use PIN or Password',
          disableDeviceFallback: false,
        })

        if (result.success) {
          await AsyncStorage.setItem('hasAuthenticated', 'true');
        } else {
          setIsError(true)
        }

      } else {
        router.replace("/pin/verify")
      }

    }

    checkAuthCapabilities()

  }, [])

  return <>
    <View style={styles.container}>

      <Surface style={{ marginBottom: 10 }}>
        <Image height={200} width={100} source={theme.dark ? require("../../assets/images/home-img-dark.gif") : require("../../assets/images/home-img-light.gif")} />
      </Surface>

      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>


    <Portal>
      <Modal contentContainerStyle={{ backgroundColor: theme.colors.cardBg, marginHorizontal: 24, borderRadius: 8 }} visible={isError}>
        <View style={{ padding: 20, }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.colors.text }}>Wallet is locked</Text>
          <Text style={{ marginTop: 16, color: theme.colors.text }}>
            Authentication is required to access the Wallet app
          </Text>
        </View>
        <Divider />
        <View style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Button style={{ marginVertical: 10 }} onPress={() => router.replace("/")} >
            <Text style={{ fontSize: 16 }}>Unlock now</Text>
          </Button>
        </View>
      </Modal>
    </Portal>
  </>
}

const customStyles = (theme: CustomTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      backgroundColor: 'white',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    banner: {
      width: '100%',
      height: 150,
      resizeMode: 'cover',
    },
    menuContainer: {
      padding: 10,
    },
    menuItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 10,
      padding: 15,
      backgroundColor: theme.colors.cardBg,
      borderRadius: 4,
      elevation: 3,
    },
    menuText: {
      marginTop: 8,
      fontSize: 14,
      textAlign: 'center',
      color: theme.colors.text
    },

    gird: {
      backgroundColor: "red",
      width: "100%"
    },

    girdItem: {
      width: "30%"
    }
  });
}

export default Home

