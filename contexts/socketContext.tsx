import { NOTIFICATION_SERVER_URL, SOCKET_EVENTS } from "@/constants";
import useAsyncStorage from "@/hooks/useAsyncStorage";
import { createContext, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { AccountAuthSchema } from "@/auth/accountAuth";
// import { transactionActions } from "@/redux/slices/transactionSlice";
import { useLazyQuery } from "@apollo/client";
import { AccountApolloQueries } from "@/apollo/query";
import { fetchAccountLimit, fetchAllTransactions, fetchRecentTopUps, fetchRecentTransactions } from "@/redux/fetchHelper";
import { accountActions } from "@/redux/slices/accountSlice";
// import colors from "@/colors";


export const SocketContext = createContext({});

export const SocketContextProvider = ({ children }: { children: JSX.Element }) => {
    const [getAccount] = useLazyQuery(AccountApolloQueries.account());

    const { } = useSelector((state: any) => state.accountReducer)
    const { getItem } = useAsyncStorage()
    const dispatch = useDispatch()

    const refreshAccount = useCallback(async () => {
        try {
            const { data } = await getAccount()
            await dispatch(accountActions.setAccount(data.account))
        } catch (error) {
            console.log(error);
        }

    }, []);

    // const formatTransaction = (transaction: any) => {
    //     const { transactionType, status } = transaction
    //     const isFromMe = transaction.from.user?.id === user?.id

    //     const profileImageUrl = isFromMe ? transaction.to.user?.profileImageUrl : transaction.from.user?.profileImageUrl
    //     const fullName = isFromMe ? transaction.to.user?.fullName : transaction.from.user?.fullName
    //     const username = isFromMe ? transaction.to.user?.username : transaction.from.user?.username
    //     const showPayButton = transaction?.transactionType === "request" && !isFromMe && transaction.status === "requested"
    //     const showMap = (transaction?.transactionType === "request" && isFromMe) || (transaction?.transactionType === "transfer" && !isFromMe) ? false : true

    //     let amountColor;

    //     if ((transactionType === "request" && isFromMe && status === "requested")) {
    //         amountColor = colors.pureGray

    //     } else if ((transaction?.transactionType === "request" && isFromMe || transaction?.transactionType === "transfer" && !isFromMe) && transaction.status !== "cancelled") {
    //         amountColor = colors.mainGreen

    //     } else {
    //         amountColor = colors.red
    //     }

    //     return {
    //         isFromMe,
    //         isSuspicious: transaction.status === "suspicious",
    //         showMap,
    //         amountColor,
    //         profileImageUrl: profileImageUrl || "",
    //         amount: transaction.amount,
    //         showPayButton,
    //         fullName: fullName || "",
    //         username: username || ""
    //     }
    // }


    const runCallbackAfterEvents = async (_transaction: any) => {
        // const formatedTransaction = formatTransaction(transaction)

        await Promise.all([
            refreshAccount(),
            dispatch(accountActions.setHaveAccountChanged(false)),
            // dispatch(transactionActions.setTransaction(Object.assign({}, transaction, { ...formatedTransaction }))),
            dispatch(fetchRecentTransactions()),
            dispatch(fetchRecentTopUps()),
            dispatch(fetchAllTransactions({ page: 1, pageSize: 10 })),
            dispatch(fetchAccountLimit())
        ])
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
                socket.on(SOCKET_EVENTS.NOTIFICATION_TRANSACTION_CREATED, async (data: any) => {
                    await runCallbackAfterEvents(data)
                })

                socket.on(SOCKET_EVENTS.NOTIFICATION_TRANSACTION_REQUEST_PAIED, async (data: any) => {
                    await runCallbackAfterEvents(data)
                })

                socket.on(SOCKET_EVENTS.NOTIFICATION_TRANSACTION_CREATED_FROM_QUEUE, async (data: any) => {
                    await runCallbackAfterEvents(data)
                })

                socket.on(SOCKET_EVENTS.NOTIFICATION_TRANSACTION_REQUEST_CANCELED, async (data: any) => {
                    await runCallbackAfterEvents(data)
                })

                socket.on(SOCKET_EVENTS.NOTIFICATION_QUEUE_TRANSACTION_CREATED, async (data: any) => {
                    await runCallbackAfterEvents(data)
                })
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