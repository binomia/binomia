import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, SafeAreaView } from 'react-native'
import BottomSheet from '@/components/global/BottomSheet';
import { useDispatch } from 'react-redux';
import { transactionActions } from '@/redux/slices/transactionSlice';
import SingleTransactionScreen from '@/screens/SingleTransactionScreen';
import PagerView from 'react-native-pager-view';
import TransactionDetailsScreen from './TranferDetails';
import CreateTransaction from './CreateTransaction';
import { router } from 'expo-router';

type Props = {
    open?: boolean
    onSendFinish?: () => any
    onCloseFinish?: () => void
}

const { height } = Dimensions.get('window')
const SendTransactionScreen: React.FC<Props> = ({ open = false, onCloseFinish = () => { } }) => {
    const dispatch = useDispatch();
    const ref = useRef<PagerView>(null);
    const [input, setInput] = useState<string>("0");
    const [visible, setVisible] = useState<boolean>(open);

  
    const handleOnClose = async () => {
        await dispatch(transactionActions.setReceiver({}))

        onCloseFinish()
        setVisible(false)
        setInput("0")
    }

    const nextPage = async () => {
        ref.current?.setPage(1)
    }

    const onCloseSingleTransaction = () => {
        handleOnClose()
        router.navigate("(home)")
    }

    useEffect(() => {
        setVisible(open)
    }, [open])

    return (
        <BottomSheet  openTime={300} height={height * 0.9} onCloseFinish={handleOnClose} open={visible}>
            <SafeAreaView style={{ flex: 1 }}>
                <PagerView style={{ flex: 1 }} ref={ref} initialPage={0}>
                    <CreateTransaction key={"transaction-create-0"} input={input} onCloseFinish={handleOnClose} setInput={setInput} nextPage={nextPage} />
                    <TransactionDetailsScreen key={"TransactionDetailsScreen-1"} onClose={handleOnClose} goBack={() => ref.current?.setPage(0)} />
                    <SingleTransactionScreen key={"SingleTransactionScreen-2"} onClose={onCloseSingleTransaction} />
                </PagerView>
            </SafeAreaView>
        </BottomSheet>
    )
}

export default SendTransactionScreen