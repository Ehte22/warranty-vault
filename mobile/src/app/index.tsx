// import { Text, View } from "react-native";
// import { Link } from "expo-router"
// import { useCustomTheme } from "../context/ThemeContext";
// import { Button, useTheme } from "react-native-paper";
// import FontAwesome6 from "react-native-vector-icons/FontAwesome6"
// import AutoComplete from "../components/AutoComplete";

// export default function Index() {
//   const { theme, toggleTheme } = useCustomTheme();
//   return (
//     <View
//       style={{
//         // minHeight: 2000,
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: theme.colors.background
//       }}
//     >
//       <Text style={{ color: theme.colors.text, borderRadius: 0 }}>Edit app/index.tsx to edit this screen.</Text>

//       <Button mode="contained" style={{ borderRadius: 4 }} labelStyle={{ color: theme.dark ? "black" : "white" }} onPress={toggleTheme}>
//         Toggle Theme
//       </Button>

//       <Link href="/auth/login" style={{ color: theme.colors.text, marginTop: 6 }}>Login</Link>
//       <Link href="/auth/register" style={{ color: theme.colors.text, marginTop: 6 }}>Register</Link>
//       <Link href="/plans/select-plan" style={{ color: theme.colors.text, marginTop: 6 }}>Select Plan</Link>
//       <Link href="/brands" style={{ color: theme.colors.text, marginTop: 6 }} >brands</Link>
//       <Link href="/notifications" style={{ color: theme.colors.text, marginTop: 6 }} >notifications</Link>
//       <Link href="/policies" style={{ color: theme.colors.text, marginTop: 6 }} >policies</Link>
//       <Link href="/policy-types" style={{ color: theme.colors.text, marginTop: 6 }} >policy types</Link>
//       <Link href="/products" style={{ color: theme.colors.text, marginTop: 6 }} >products</Link>
//       <Link href="/users" style={{ color: theme.colors.text, marginTop: 6 }} >users</Link>
//     </View>
//   );
// }

// import React from 'react';
// import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ScrollView } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // or FontAwesome

// const menuItems = [
//   { name: 'Dashboard', icon: 'view-dashboard', screen: 'DashboardScreen' },
//   { name: 'Users', icon: 'account-group', screen: 'UsersScreen' },
//   { name: 'Brands', icon: 'tag', screen: 'BrandsScreen' },
//   { name: 'Products', icon: 'cube-outline', screen: 'ProductsScreen' },
//   { name: 'Policies', icon: 'file-document-outline', screen: 'PoliciesScreen' },
//   { name: 'Notifications', icon: 'bell-outline', screen: 'NotificationsScreen' },
// ];

// const HomeScreen = () => {
//   const navigation = useNavigation();

//   const renderItem = ({ item }: any) => (
//     <TouchableOpacity
//       style={styles.gridItem}
//       onPress={() => navigation.navigate(item.screen as never)}
//     >
//       <Icon name={item.icon} size={30} color="#3399cc" />
//       <Text style={styles.gridText}>{item.name}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <ScrollView>
//       <View style={styles.container}>
//         {/* Header */}
//         {/* <View style={styles.header}>
//           <Image
//             source={{ uri: 'https://i.pravatar.cc/150?img=12' }} // Replace with user image
//             style={styles.avatar}
//           />
//           <Text style={styles.username}>Welcome, John</Text>
//         </View> */}

//         {/* Banner Image */}
//         <Image
//           source={{ uri: 'https://images.unsplash.com/photo-1578191290994-f02a85fee202?w=600&h=400&q=80&https%3A%2F%2Fimages.unsplash.com%2Fphoto-1719937206255-cc337bccfc7dHello=' }}
//           style={styles.banner}
//           resizeMode="cover"
//         />

//         {/* Grid */}
//         <FlatList
//           data={menuItems}
//           renderItem={renderItem}
//           keyExtractor={(item) => item.name}
//           numColumns={3}
//           contentContainerStyle={styles.grid}
//         />
//       </View></ScrollView>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     height: 2000
//   },
//   header: {
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     height: 50,
//     width: 50,
//     borderRadius: 25,
//   },
//   username: {
//     marginLeft: 12,
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   banner: {
//     height: 220,
//     width: '100%',
//     marginBottom: 16,
//   },
//   grid: {
//     paddingHorizontal: 8,
//     gap: 8,
//   },
//   gridItem: {
//     flex: 1,
//     margin: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#eef6fa',
//     borderRadius: 12,
//     paddingVertical: 20,
//   },
//   gridText: {
//     marginTop: 8,
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });

import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCustomTheme } from '../context/ThemeContext';
import { CustomTheme } from '../theme/theme';
import { Button } from 'react-native-paper';

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

export default function Home() {
  const router = useRouter();
  const { theme, toggleTheme } = useCustomTheme()

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

      <View style={{ backgroundColor: theme.colors.primary, height: 200 }}></View>

      < FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.menuContainer}
      />

      <Link href="/auth/login" >Login</Link>

      <Button mode="contained" style={{ borderRadius: 4 }} labelStyle={{ color: theme.dark ? "black" : "white" }} onPress={toggleTheme}>
        Toggle Theme
      </Button>
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

