import colors from '@/colors';
import { useEffect, useRef } from 'react'
import { BottomSheet as RNBottomSheet, BottomSheetRef, BottomSheetProps } from 'react-native-sheet';


interface Props extends BottomSheetProps {
    open?: boolean
    backdropBg?: string
}


const BottomSheet: React.FC<Props> = ({
    onCloseFinish = () => { },
    onOpenFinish = () => { },
    children,
    height = 500,
    openTime = 500,
    open = false,
    showDragIcon = true,
    draggable = true,
    backdropBg = 'rgba(000, 000, 000, 0.8)',
    sheetStyle = { backgroundColor: colors.darkGray },
}: Props) => {
    const bottomSheet = useRef<BottomSheetRef>(null);

    useEffect(() => {
        if (open) {
            bottomSheet.current?.show()
        } else {
            bottomSheet.current?.hide()
        }
    }, [open])

   
    return (
        <RNBottomSheet
            onCloseFinish={() => onCloseFinish()}
            onOpenFinish={onOpenFinish}
            openTime={openTime}
            closeTime={500}
            showDragIcon={showDragIcon}
            sheetStyle={sheetStyle}
            backdropBackgroundColor={backdropBg}
            height={height}
            dragIconStyle={{ backgroundColor: 'white' }}
            ref={bottomSheet}
            draggable={draggable}
        >
            <>
                {children}
            </>
        </RNBottomSheet >
    )
}


export default BottomSheet