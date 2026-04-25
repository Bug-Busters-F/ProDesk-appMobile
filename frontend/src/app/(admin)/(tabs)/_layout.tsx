import { Tabs } from 'expo-router';
import { FontAwesome, MaterialIcons, Feather, MaterialCommunityIcons } from '@expo/vector-icons'; 

export default function AdminTabsLayout () {
    return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#f97316', tabBarStyle: { height: 60 } }}>
      <Tabs.Screen 
        name="adminHome" 
        options={{ title: 'Início', tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} /> }}
      />
      <Tabs.Screen 
        name="users" 
        options={{ title: 'Usuários', tabBarIcon: ({ color }) => <Feather name="users" size={24} color={color} /> }}
      />
      <Tabs.Screen 
        name="companies" 
        options={{ title: 'Empresas', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="office-building-marker-outline" size={26} color={color} /> }}
      />
      <Tabs.Screen 
        name="categories" 
        options={{ title: 'Categorias', tabBarIcon: ({ color }) => <MaterialIcons name="support-agent" size={24} color={color} /> }}
      />
      <Tabs.Screen 
        name="profile" 
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} /> }}
      />
    </Tabs>
  );
}