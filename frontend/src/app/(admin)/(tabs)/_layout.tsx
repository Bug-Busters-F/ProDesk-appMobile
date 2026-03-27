import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; 
import Feather from '@expo/vector-icons/Feather';

export default function AdminTabsLayout () {
    return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#f97316', tabBarStyle: { height: 60 } }}>
      <Tabs.Screen 
        name="adminHome" 
        options={{ title: 'Início', tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} /> }}
      />
      <Tabs.Screen 
        name="users" 
        options={{ title: 'Usuáriios', tabBarIcon: ({ color }) => <Feather name="users" size={24} color={color} /> }}
      />
      <Tabs.Screen 
        name="companys" 
        options={{ title: 'Empresas', tabBarIcon: ({ color }) => <FontAwesome name="building-o" size={24} color={color} /> }}
      />
    </Tabs>
  );
}