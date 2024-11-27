import { NOTIFICATION_SERVER_URL, SOCKET_EVENTS } from "@/constants";
import useAsyncStorage from "@/hooks/useAsyncStorage";
import { createContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { AccountAuthSchema } from "@/auth/accountAuth";
import { globalActions } from "@/redux/slices/globalSlice";
import { transactionActions } from "@/redux/slices/transactionSlice";


export const SocketContext = createContext({});

export const SocketContextProvider = ({ children }: { children: JSX.Element }) => {

    const { getItem } = useAsyncStorage()
    const dispatch = useDispatch()

    useEffect(() => {

        getItem("jwt").then(async (jwt) => {
            if (!jwt) return

            const decoded = jwtDecode(jwt);
            const { username } = await AccountAuthSchema.jwtDecoded.parseAsync(decoded)

            const socket = io(NOTIFICATION_SERVER_URL, {
                query: { username }
            });

            socket.on("connect", () => {
                socket.on(SOCKET_EVENTS.TRANSACTION_CREATED, async (transaction: any) => {
                    await dispatch(globalActions.setAccount(transaction.to))
                    await dispatch(transactionActions.setHasNewTransaction(true))
                })

                socket.on(SOCKET_EVENTS.TRANSACTION_CREATED_FROM_QUEUE, async (data: any) => {
                    dispatch(globalActions.setAccount(data.from))
                })

                console.log("connected");
            })

            return () => {
                socket.off("connect");
            }
        }).catch((error) => {
            console.error({ error });
        })

    }, [])


    return (
        <SocketContext.Provider value={{}}>
            {children}
        </SocketContext.Provider>
    )
}