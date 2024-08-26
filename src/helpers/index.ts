import bcrypt from 'bcryptjs';


const getGqlBody = (fieldNodes: any[], schema: string) => {
    let body: any = {
        [schema]: []
    }

    const gqlSchemas = [
        "fine",
        "fines",
        "finesType",
        "officer",
        "officers",
        "user",
        "users",
        "vehicle",
        "vehicles",
        "reports"
    ];

    fieldNodes.forEach((item: any) => {
        if (item.kind === 'Field') {
            if (!gqlSchemas.includes(item.name.value)) {
                if (item.name.value !== "__typename") {
                    body[schema].push(item.name.value)
                }
            } else {
                const items = getGqlBody(item.selectionSet.selections, item.name.value)
                body = Object.assign(body, items)
            }
        }
    })

    return body
}

export const getQueryResponseFields = (fieldNodes: any[], name: string, isGlobal: boolean = false, isAll: boolean = false) => {
    let fields: any = {}
    const selections = fieldNodes[0].selectionSet?.selections;

    for (let i = 0; i < selections.length; i++) {
        if (selections[i].name.value === "data") {
            const body = getGqlBody(selections[i].selectionSet.selections, name)
            fields = body
            break;
        }
    }

    return fields
}

export const addFutureDate = (day: number = 30): number => {
    const currentDate = new Date();
    const futureDate = new Date(currentDate.setDate(currentDate.getDate() + day));
    return futureDate.getTime();
}

export const hashPassword = (password: string): Promise<string> => {
    const saltRounds = 10;
    const hashedPassword = bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    const isMatch = bcrypt.compareSync(password, hashedPassword)
    return isMatch
}

export const formatCedula = (value: string): string => {
    if (value.length <= 3 && value !== "") {
        return value.replaceAll("-", "")
    }
    else if (value.length > 3 && value.length <= 10) {
        const formattedValue = value.slice(0, 3) + "-" + value.slice(3)
        return formattedValue
    }
    else if (value.length > 10 && value.length <= 11) {
        const formattedValue = value.slice(0, 3) + "-" + value.slice(3, 10) + "-" + value.slice(10, 11);
        return formattedValue
    }
    return value
}

export const generateUUID = (): string => {
    const inputString = Date.now().toString().slice(1, 12)

    if (inputString.length === 11) {
        const formattedString =
            inputString[0] +
            "-" +
            inputString.slice(0, 3) +
            "-" +
            inputString.slice(3, 10) +
            "-" +
            inputString.slice(10);

        return formattedString.toString();

    } else {
        return inputString.toString();
        // throw new Error("Invalid input string length");
    }
}