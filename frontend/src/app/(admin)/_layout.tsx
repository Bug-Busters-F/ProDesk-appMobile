import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; 
import AntDesign from '@expo/vector-icons/AntDesign';

export default function AdminLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: '#FF8C00', 
        tabBarInactiveTintColor: '#94a3b8', 
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        }
      }}
    >
      
      <Tabs.Screen 
        name="adminHome" 
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />
        }}
      />

      <Tabs.Screen 
        name="registerUser" 
        options={{
          title: 'Adicionar',
          tabBarIcon: ({ color }) => <AntDesign name="user-add" size={24} color={color} />
        }}
      />
      
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />
        }}
      />

    </Tabs>
  );
}