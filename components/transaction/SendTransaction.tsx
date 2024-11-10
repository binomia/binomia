import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, SafeAreaView } from 'react-native'
import BottomSheet from '@/components/global/BottomSheet';
import { useDispatch, useSelector } from 'react-redux';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { TransactionAuthSchema } from '@/auth/transactionAuth';
import { useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { globalActions } from '@/redux/slices/globalSlice';
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
    const { receiver } = useSelector((state: any) => state.transactionReducer)
    const { location, account, user } = useSelector((state: any) => state.globalReducer)
    const [createTransaction] = useMutation(TransactionApolloQueries.createTransaction())

    const [input, setInput] = useState<string>("0");
    const [visible, setVisible] = useState<boolean>(open);

    const handleOnSend = async (recurrence?: { title: string, time: string }) => {
        try {
            console.log({ recurrence });
            const transactionData = await TransactionAuthSchema.createTransaction.parseAsync({
                receiver: receiver.username,
                amount: parseFloat(input),
                location
            })

            const transaction = await createTransaction({
                variables: {
                    data: transactionData
                }
            })

            const transactionSent = {
                ...transaction.data.createTransaction,
                to: receiver,
                from: user
            }

            await dispatch(globalActions.setAccount(Object.assign({}, account, { balance: account.balance - transactionData.amount })))
            await dispatch(transactionActions.setTransaction({
                id: transactionSent.id,
                fullName: formatTransaction(transactionSent).fullName,
                profileImageUrl: formatTransaction(transactionSent).profileImageUrl,
                username: formatTransaction(transactionSent).username,
                isFromMe: formatTransaction(transactionSent).isFromMe,
                amount: transactionSent.amount,
                createdAt: transactionSent.createdAt
            }))

            ref.current?.setPage(1)

        } catch (error: any) {
            console.error(error.message);
        }
    }

    const formatTransaction = (transaction: any) => {
        const isFromMe = transaction.from?.id === user.id

        const profileImageUrl = transaction.to?.profileImageUrl
        const fullName = isFromMe ? transaction.to?.fullName : transaction.from?.fullName
        const username = isFromMe ? transaction.from?.username : transaction.to?.username

        return {
            isFromMe,
            profileImageUrl: profileImageUrl || "",
            amount: transaction.amount,
            fullName: fullName || "",
            username: username || ""
        }
    }

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
        <BottomSheet draggable={false} showDragIcon={false} openTime={300} height={height} onCloseFinish={handleOnClose} open={visible}>
            <SafeAreaView style={{ flex: 1 }}>
                <PagerView style={{ flex: 1 }} ref={ref} initialPage={0}>
                    <CreateTransaction key={"transaction-create-0"} input={input} setInput={setInput} nextPage={nextPage} />
                    <TransactionDetailsScreen key={"TransactionDetailsScreen-1"} onSubmit={handleOnSend} onClose={() => ref.current?.setPage(2)} />
                    <SingleTransactionScreen key={"SingleTransactionScreen-2"} onClose={onCloseSingleTransaction} />
                </PagerView>
            </SafeAreaView>
        </BottomSheet>
    )
}

export default SendTransactionScreen