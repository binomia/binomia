import colors from '@/colors';
import { useEffect, useRef, useState } from 'react'
import { BottomSheet as RNBottomSheet, BottomSheetRef } from 'react-native-sheet';


type Props = {
    children?: JSX.Element
    onCloseFinish?: Function
    height?: number
    open?: boolean
    showDragIcon?: boolean
    draggable?: boolean
    backdropBg?: string
    sheetBg?: string
    sheetStyle?: object
}


const BottomSheet: React.FC<Props> = ({
    onCloseFinish = () => { },
    children,
    height = 500,
    open = false,
    showDragIcon = true,
    draggable = true,
    backdropBg = 'rgba(000, 000, 000, 0.8)',
    sheetStyle = { backgroundColor: colors.darkGray },
}: Props) => {
    const bottomSheet = useRef<BottomSheetRef>(null);
    const [isfinishedOpen, setFinishedOpen] = useState<boolean>(false);


    useEffect(() => {
        if (open) {
            bottomSheet.current?.show()
        } else {
            bottomSheet.current?.hide()
        }
    }, [open])

    const onOpenFinish = () => {
        setFinishedOpen(true)

    }

    return (
        <RNBottomSheet
            onCloseFinish={() => onCloseFinish()}

            openTime={500}
            showDragIcon={showDragIcon}
            sheetStyle={sheetStyle}
            backdropBackgroundColor={backdropBg}
            height={height}
            dragIconStyle={{ backgroundColor: 'white' }}
            ref={bottomSheet}
            draggable={draggable}
            onOpenFinish={() => onOpenFinish()}
        >
            <>
                {children}
            </>
        </RNBottomSheet >
    )
}


export default BottomSheet