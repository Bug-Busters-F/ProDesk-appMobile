import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; 

export default function ClientLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: '#2563eb', 
        tabBarInactiveTintColor: '#94a3b8', 
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        }
      }}
    >
      
      <Tabs.Screen 
        name="clientHome" 
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />
        }}
      />

      <Tabs.Screen 
        name="tickets" 
        options={{
          title: 'Chamados',
          tabBarIcon: ({ color }) => <FontAwesome name="ticket" size={24} color={color} />
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