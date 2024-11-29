import { NOTIFICATION_SERVER_URL, SOCKET_EVENTS } from "@/constants";
import useAsyncStorage from "@/hooks/useAsyncStorage";
import { createContext, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { AccountAuthSchema } from "@/auth/accountAuth";
import { globalActions } from "@/redux/slices/globalSlice";
import { transactionActions } from "@/redux/slices/transactionSlice";
import { useLazyQuery } from "@apollo/client";
import { AccountApolloQueries } from "@/apollo/query";


export const SocketContext = createContext({});

export const SocketContextProvider = ({ children }: { children: JSX.Element }) => {
    const [getAccount] = useLazyQuery(AccountApolloQueries.account());


    const { getItem } = useAsyncStorage()
    const dispatch = useDispatch()

    const refreshAccount = useCallback(async () => {
        try {
            const { data } = await getAccount()
            await dispatch(globalActions.setAccount(data.account))
        } catch (error) {
            console.log(error);
        }

    }, []);

    useEffect(() => {

        getItem("jwt").then(async (jwt) => {
            if (!jwt) return

            const decoded = jwtDecode(jwt);
            const { username } = await AccountAuthSchema.jwtDecoded.parseAsync(decoded)

            const socket = io(NOTIFICATION_SERVER_URL, {
                query: { username }
            });

            socket.on("connect", () => {
                socket.on(SOCKET_EVENTS.TRANSACTION_CREATED, async () => {
                    await Promise.all([
                        refreshAccount(),
                        dispatch(globalActions.setHaveAccountChanged(false)),
                        dispatch(transactionActions.setHasNewTransaction(true))
                    ])
                })

                socket.on(SOCKET_EVENTS.TRANSACTION_REQUEST_PAIED, async (transaction: any) => {
                    console.log({ transaction });

                    await Promise.all([
                        dispatch(globalActions.setAccount(transaction.from)),
                        dispatch(globalActions.setHaveAccountChanged(false)),
                        dispatch(transactionActions.setHasNewTransaction(true))
                    ])
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