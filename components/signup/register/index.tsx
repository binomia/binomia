import { useRef, useState } from 'react';
import { VStack } from 'native-base';
import { SafeAreaView } from 'react-native';
import PagerView from 'react-native-pager-view';
import colors from '@/colors';
import CreateAccount from './CreateAccount';
import Address from './Address';


const RegisterComponent: React.FC = (): JSX.Element => {
    const ref = useRef<PagerView>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);

    const nextPage = () => {
        if (currentPage === 2) {
            ref.current?.setPage(0)
            setCurrentPage(0)

        } else
            ref.current?.setPage(currentPage + 1)
        setCurrentPage(currentPage + 1)
    }

    const prevPage = () => {
        if (currentPage === 0) {
            ref.current?.setPage(1)
            setCurrentPage(1)
        } else
            ref.current?.setPage(currentPage - 1)
        setCurrentPage(currentPage - 1)
    }

    return (
        <SafeAreaView style={{ backgroundColor: colors.darkGray }}>
            <VStack h={"100%"}>
                <PagerView scrollEnabled={false} ref={ref} style={{ flex: 1 }} initialPage={currentPage}>                    
                    <CreateAccount key={"1"} nextPage={nextPage} />
                    <Address key={"2"} />
                </PagerView>
            </VStack>
        </SafeAreaView>
    );
}


export default RegisterComponent
