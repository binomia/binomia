import React, { useEffect, useRef, useState } from 'react'
import BottomSheet from '@/components/global/BottomSheet';
import PagerView from 'react-native-pager-view';
import CreateTransaction from './CreateTransaction';
import TransactionDetails from './TranferDetails';
import SingleSentTransaction from './SingleSentTransaction';
import { Dimensions, SafeAreaView } from 'react-native'
import { useDispatch } from 'react-redux';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { router } from 'expo-router';
import { pendingClock } from '@/assets';
import { fetchRecentTransactions } from '@/redux/fetchHelper';

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
    const [currentPage, setCurrentPage] = useState<number>(0);


    const handleOnClose = async () => {
        await dispatch(transactionActions.setReceiver({}))

        onCloseFinish()
        setVisible(false)
        setInput("0")

        if (currentPage === 2) {
            await dispatch(fetchRecentTransactions())

            router.navigate("(home)")
            ref.current?.setPage(0)

            setCurrentPage(0)
            await dispatch(transactionActions.setHasNewTransaction(true))
        }
    }


    const prevPage = () => {
        if (currentPage === 0) {
            ref.current?.setPage(1)
            setCurrentPage(1)

        } else
            ref.current?.setPage(currentPage - 1)

        setCurrentPage(currentPage - 1)
    }


    const nextPage = () => {
        ref.current?.setPage(currentPage + 1)
        setCurrentPage(currentPage + 1)
    }

    useEffect(() => {
        setVisible(open)
    }, [open])

    return (
        <BottomSheet openTime={300} height={height * 0.9} onCloseFinish={handleOnClose} open={visible}>
            <SafeAreaView style={{ flex: 1 }}>
                <PagerView style={{ flex: 1 }} scrollEnabled={false} ref={ref} initialPage={currentPage}>
                    <CreateTransaction key={"transaction-create-0"} input={input} onCloseFinish={handleOnClose} setInput={setInput} nextPage={nextPage} />
                    <TransactionDetails key={"TransactionDetailsScreen-1"} goNext={nextPage} goBack={prevPage} />
                    <SingleSentTransaction key={"SingleTransactionScreen-2"} iconImage={pendingClock} />
                </PagerView>
            </SafeAreaView>
        </BottomSheet>
    )
}

export default SendTransactionScreen