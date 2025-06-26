import * as Contacts from 'expo-contacts';
import phone from 'phone';


export const useContacts = () => {
    const getContacts = async (): Promise<any[]> => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers]
            });

            const contacts = data.reduce((validContacts, contact: Contacts.Contact) => {
                const validPhoneNumbers = contact.phoneNumbers?.filter((phoneNumber: Contacts.PhoneNumber) => {
                    if (!phoneNumber.number) return false
                    const { isValid } = phone(phoneNumber.number, { country: "DO" });
                    return isValid;
                });

                if (validPhoneNumbers?.length) {
                    validContacts.push({
                        id: contact.id as string,
                        name: contact.name,
                        phoneNumbers: validPhoneNumbers
                    });
                }

                return validContacts;
            }, [] as Array<{ id: string, name: string, phoneNumbers: Contacts.PhoneNumber[] }>);

            return contacts
        } else {
            console.log('Permission to access contacts was denied');
            return []
        }
    }

    const getContact = async (phoneNumber: string) => {
        const contacts = await getContacts();

        // Filter to find the contact with the specified phone number
        const foundContact = contacts.find((contact: Contacts.Contact) => contact.phoneNumbers?.some((phone: Contacts.PhoneNumber) => {
            return phone.number?.replace(/\s+/g, '') === phoneNumber.replace(/\s+/g, '')
        }));

        return foundContact
    }

    return {
        getContacts,
        getContact
    }
}