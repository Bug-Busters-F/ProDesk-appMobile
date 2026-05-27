import React from 'react';
import { View, Text, Image, Linking, TouchableOpacity } from 'react-native';

export type MessageType = {
  id: string;
  text: string;
  sender: 'USER' | 'BOT' | 'AGENT';
  senderRole?: 'support' | 'client';
  agentName?: string;
  time: string;
  attachmentUrl?: string;
  type?: string; // ADICIONADO
};

type Props = {
  message: MessageType;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.sender === 'USER';
  
  const handleOpenAttachment = () => {
    if (message.attachmentUrl) {
      Linking.openURL(message.attachmentUrl);
    }
  };
  
  return (
    <View className={`mb-6 ${isUser ? 'items-end' : 'items-start'}`}>
      <Text className="text-slate-400 text-xs mb-1 mx-2 flex-row items-center">
        {isUser ? (
          `Você • ${message.time}`
        ) : (
          <View className="flex-row items-center">
            <Text className="font-bold text-slate-600">{message.agentName}</Text>
            
            {message.senderRole === 'support' && (
              <View className="ml-2 px-1.5 py-0.5 bg-orange-100 rounded">
                <Text className="text-[9px] font-bold text-orange-600 uppercase">Atendente</Text>
              </View>
            )}
            
            <Text className="text-slate-400 ml-1">• {message.time}</Text>
          </View>
        )}
      </Text>
      
      <View className="flex-row items-end">
        {!isUser && (
          <View className="w-8 h-8 bg-slate-300 rounded-full mr-2 mb-1 items-center justify-center">
             <Text className="text-white font-bold text-xs">
                {message.agentName ? message.agentName.charAt(0) : 'B'}
             </Text>
          </View>
        )}

        <View 
          className={`p-4 rounded-2xl max-w-[80%] ${
            isUser 
              ? 'bg-orange-100 rounded-tr-sm' 
              : 'bg-slate-50 border border-slate-100 rounded-tl-sm'
          }`}
        >
          {message.attachmentUrl && (
            <View className="mb-2">
              {/* CORREÇÃO: Forçando renderizar como imagem se o type for IMAGE */}
              {message.type === 'IMAGE' || message.attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <Image 
                  source={{ uri: message.attachmentUrl }} 
                  style={{ width: 200, height: 200, borderRadius: 8 }}
                  resizeMode="cover"
                />
              ) : (
                <TouchableOpacity 
                  onPress={handleOpenAttachment}
                  className="bg-white/50 p-2 rounded-lg flex-row items-center border border-slate-200"
                >
                  <Text className="text-blue-500 font-bold ml-1">Abrir anexo</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <Text className="text-slate-800 leading-5">{message.text}</Text>
        </View>
      </View>
    </View>
  );
}