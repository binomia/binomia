import { useRef, useState } from 'react';
import { VStack } from 'native-base';
import { SafeAreaView } from 'react-native';
import { Button } from '@/components';
import PagerView from 'react-native-pager-view';
import colors from '@/colors';
import CreateAccount from './CreateAccount';


const RegisterComponent: React.FC = (): JSX.Element => {
    const ref = useRef<PagerView>(null);
    const [disabledButton, setDisabledButton] = useState<boolean>(true);

    return (
        <SafeAreaView style={{ backgroundColor: colors.darkGray }}>
            <VStack mt={"10%"} h={"100%"} >
                <PagerView ref={ref} style={{ flex: 1 }} initialPage={0}>
                    <CreateAccount key={"1"} disableButton={disabledButton} setDisableButton={setDisabledButton} />
                </PagerView>
            </VStack>
        </SafeAreaView>
    );
}


export default RegisterComponent
