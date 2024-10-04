export const FORMAT_PHONE_NUMBER = (value: string) => {
    value = value.replaceAll(/[^0-9]/g, '');

    if (value.length >= 6) {
        const formattedValue = `(${value.slice(0, 3)}) ` + value.slice(3, 6) + "-" + value.slice(6);
        return formattedValue
    }

    else if (value.length >= 3) {
        const formattedValue = `(${value.slice(0, 3)}) ` + value.slice(3)
        return formattedValue
    }

    return value
}


export const VALIDATE_EMAIL = (email: string) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};


export const GENERATE_SIX_DIGIT_TOKEN = (): string => {
    const token = Math.floor(100000 + Math.random() * 900000);
    return token.toString();
}


export const FORMAT_CEDULA = (value: string) => {
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


export const FORMAT_TIME_PLAYED = (value: number) => { // "00:00:00"
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value - (hours * 3600)) / 60);
    const seconds = Math.floor(value - (hours * 3600) - (minutes * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}


export const FORMAT_DATE = (value: string) => {
    if (!value) return null;

    const months: any = {
        "enero": "01",
        "febrero": "02",
        "marzo": "03",
        "abril": "04",
        "mayo": "05",
        "junio": "06",
        "julio": "07",
        "agosto": "08",
        "septiembre": "09",
        "octubre": "10",
        "noviembre": "11",
        "diciembre": "12"
    }

    const [day, month, year] = value.split(" ");
    const date = `${year}-${months[month]}-${day}`
    return date
}


export const FORMAT_CURRENCY = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value)
}