import { NOTIFICATION_SERVER_URL, SOCKET_EVENTS } from "@/constants";
import useAsyncStorage from "@/hooks/useAsyncStorage";
import { SocketContextType } from "@/types";
import { createContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { AccountAuthSchema } from "@/auth/accountAuth";
import { globalActions } from "@/redux/slices/globalSlice";
import { useLazyQuery } from "@apollo/client";
import { AccountApolloQueries } from "@/apollo/query";


export const SocketContext = createContext<SocketContextType>({
    emit: () => { },
    on: () => { }
});

export const SocketContextProvider = ({ children }: { children: JSX.Element }) => {
    const { account } = useSelector((state: any) => state.globalReducer)

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
                socket.on(SOCKET_EVENTS.TRANSACTION_CREATED, async (data: any) => {                                        
                    dispatch(globalActions.setAccount(data.to))
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