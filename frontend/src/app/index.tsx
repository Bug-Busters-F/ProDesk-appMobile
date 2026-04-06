import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <Image
        source={require("../../assets/images/ProDesk-Logo.png")}
        className='w-36 h-36'
      />
    </SafeAreaView>
  );
}