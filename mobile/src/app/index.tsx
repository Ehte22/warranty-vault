import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCustomTheme } from '../context/ThemeContext';
import { CustomTheme } from '../theme/theme';
import { Surface } from 'react-native-paper';

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

  const styles = customStyles(theme)

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => router.push(item.screen)}
    >
      <MaterialIcons name={item.icon} size={30} color={theme.colors.primary} />
      <Text style={styles.menuText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <Surface>
        <Image height={200} width={100} source={theme.dark ? require("../../assets/images/home-img-dark.gif") : require("../../assets/images/home-img-light.gif")} />

      </Surface>

      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.menuContainer}
      />

      <Link href="/auth/login">Login</Link>



    </View>

  );
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
      marginTop: 24

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

