import { REDIS_SUBSCRIPTION_CHANNEL } from "@/constants";
import redis from "@/redis";
import cluster from 'cluster';
import { Counter } from "prom-client";

export default class UserMetrics {
    private user: Counter
    private users: Counter
    private sessionUser: Counter
    private searchUsers: Counter
    private searchSingleUser: Counter
    private userByEmail: Counter
    private sugestedUsers: Counter
    private createUser: Counter
    private updateUser: Counter
    private updateUserPassword: Counter
    private login: Counter
    private verifySession: Counter


    constructor() {
        this.user = new Counter({
            name: `binomia_user_graphql_total_calls`,
            help: `Number of times the user resolver is called`,
        })

        this.users = new Counter({
            name: `binomia_users_graphql_total_calls`,
            help: `Number of times the users resolver is called`,
        })

        this.sessionUser = new Counter({
            name: `binomia_session_user_graphql_total_calls`,
            help: `Number of times the session_user resolver is called`,
        })

        this.searchUsers = new Counter({
            name: `binomia_search_users_graphql_total_calls`,
            help: `Number of times the search_users resolver is called`,
        })

        this.searchSingleUser = new Counter({
            name: `binomia_search_single_user_graphql_total_calls`,
            help: `Number of times the search_single_user resolver is called`,
        })

        this.userByEmail = new Counter({
            name: `binomia_user_by_email_graphql_total_calls`,
            help: `Number of times the user_by_email resolver is called`,
        })

        this.sugestedUsers = new Counter({
            name: `binomia_sugested_users_graphql_total_calls`,
            help: `Number of times the sugested_users resolver is called`,
        })

        this.createUser = new Counter({
            name: `binomia_create_user_graphql_total_calls`,
            help: `Number of times the create_user resolver is called`,
        })

        this.updateUser = new Counter({
            name: `binomia_update_user_graphql_total_calls`,
            help: `Number of times the update_user resolver is called`,
        })

        this.updateUserPassword = new Counter({
            name: `binomia_update_user_password_graphql_total_calls`,
            help: `Number of times the update_user_password resolver is called`,
        })

        this.login = new Counter({
            name: `binomia_login_graphql_total_calls`,
            help: `Number of times the login resolver is called`,
        })

        this.verifySession = new Counter({
            name: `binomia_verify_session_graphql_total_calls`,
            help: `Number of times the verify_session resolver is called`,
        })
    }

    prossessPrometheusMetrics = (name: string) => {
        switch (name) {
            case "user":
                this.user.inc()
                break;

            case "users":
                this.users.inc()
                break;

            case "session_user":
                this.sessionUser.inc()
                break;

            case "search_users":
                this.searchUsers.inc()
                break;

            case "search_single_user":
                this.searchSingleUser.inc()
                break;

            case "user_by_email":
                this.userByEmail.inc()
                break;

            case "sugested_users":
                this.sugestedUsers.inc()
                break;

            case "create_user":
                this.createUser.inc()
                break;

            case "update_user":
                this.updateUser.inc()
                break;

            case "update_user_password":
                this.updateUserPassword.inc()
                break;

            case "login":
                this.login.inc()
                break;

            case "verify_session":
                this.verifySession.inc()
                break;

            default:
                break;
        }
    }

    static sendPrometheusMetricsViaRedis = async (payload: string) => {
        await redis.publish(REDIS_SUBSCRIPTION_CHANNEL.PROMETHEUS_METRICS, JSON.stringify({
            channel: REDIS_SUBSCRIPTION_CHANNEL.PROMETHEUS_METRICS,
            workerId: cluster.worker?.id,
            payload
        }));
    }

}