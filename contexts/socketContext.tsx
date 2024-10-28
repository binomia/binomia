import { UserAuthSchema } from "@/auth/userAuth";
import { NOTIFICATION_SERVER_URL, SOCKET_EVENTS } from "@/constants";
import useAsyncStorage from "@/hooks/useAsyncStorage";
import { SocketContextType } from "@/types";
import { createContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { AccountAuthSchema } from "@/auth/accountAuth";
import { globalActions } from "@/redux/slices/globalSlice";
import SingleTransactionScreen from "@/screens/SingleTransactionScreen";
import BottomSheet from "@/components/global/BottomSheet";
import { Dimensions } from "react-native";


const { height } = Dimensions.get('window')
export const SocketContext = createContext<SocketContextType>({
    emit: () => { },
    on: () => { }
});

export const SocketContextProvider = ({ children }: { children: JSX.Element }) => {

    const { getItem } = useAsyncStorage()
    const dispatch = useDispatch()


    const emit = (event: string, data: any) => {

    }

    const on = (event: string, callback: (data: any) => void) => {

    }

    useEffect(() => {
        getItem("jwt").then(async (jwt) => {
            if (!jwt) return

            const decoded = jwtDecode(jwt);
            const { username } = await AccountAuthSchema.jwtDecoded.parseAsync(decoded)

            const socket = io(NOTIFICATION_SERVER_URL, {
                query: { username }
            });


            socket.on("connect", () => {

                socket.on(SOCKET_EVENTS.TRANSACTION_RECEIVED, async (data: any) => {
                    // console.log(JSON.stringify(data.to, null, 2));
                    dispatch(globalActions.setAccount(data.to))
                })

                console.log("connected");
            })

            return () => {
                socket.off("connect");
            }
        })

    }, [])

    const data = {
        emit,
        on
    }

    return (
        <SocketContext.Provider value={data}>
            {children}            
        </SocketContext.Provider>
    )
}