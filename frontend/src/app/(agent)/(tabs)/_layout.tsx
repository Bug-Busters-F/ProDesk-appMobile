import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; 

export default function AgentTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#f97316' }}>
      <Tabs.Screen 
        name="agentHome" 
        options={{ 
          title: 'Início', 
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} /> 
        }}
      />
      <Tabs.Screen 
        name="tickets" 
        options={{ 
          title: 'Chamados', 
          tabBarIcon: ({ color }) => <FontAwesome name="list-alt" size={24} color={color} /> 
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