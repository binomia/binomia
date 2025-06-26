import React, { useRef } from 'react'
import BottomSheet from '../global/BottomSheet'
import PagerView from 'react-native-pager-view'
import CreateTopUp from './CreateTopUp'
import NewTopUpQuantity from './NewTopUpQuantity'
import TopTupDetails from './TopTupDetails'
import { Dimensions } from 'react-native'
import { useDispatch } from 'react-redux'
import { topupActions } from '@/redux/slices/topupSlice'
import { useNavigation } from 'expo-router'

type Props = {
    open: boolean
    onClose?: () => void
}

const { height } = Dimensions.get('window')
const NewTopUp: React.FC<Props> = ({ open, onClose = () => { } }: Props) => {
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const ref = useRef<PagerView>(null)


    const onCloseFinish = async () => {
        if (navigation.getState().index === 1)
            await dispatch(topupActions.setTopUp({}))

        onClose()
    }

    return (
        <BottomSheet height={height * 0.9} open={open} onCloseFinish={onCloseFinish}>
            <PagerView scrollEnabled={false} ref={ref} style={{ flex: 0.96 }}>
                <CreateTopUp next={() => ref.current?.setPage(1)} />
                <NewTopUpQuantity back={() => ref.current?.setPage(0)} next={() => ref.current?.setPage(2)} />
                <TopTupDetails onClose={onClose} goBack={() => ref.current?.setPage(1)} />
            </PagerView>
        </BottomSheet>
    )
}

export default NewTopUp