import colors from '@/colors';
import HomeScreen from '@/screens/HomeScreen';
import TransactionsScreen from '@/screens/TransactionsScreen';
import { VStack } from 'native-base';
import { Text, StyleSheet, View } from 'react-native';


export default () =>{
  return (
    <VStack flex={1}>
        <TransactionsScreen/>
    </VStack>
  );
}
