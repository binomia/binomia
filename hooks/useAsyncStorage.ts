import * as SecureStore from 'expo-secure-store';

const useAsyncStorage = () => {
    const setItem = async (key: string, value: string): Promise<void> => {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.error(`Failed to save '${key}':`, error);
        }
    };

    // Retrieve cookie
    const getItem = async (key: string): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(key);

        } catch (error) {
            console.error(`Failed to retrieve '${key}':`, error);
            return null;
        }
    };


    const deleteItem = async (key: string) => {
        await SecureStore.deleteItemAsync(key);
    }


    return {
        setItem,
        getItem,
        deleteItem
    }
}



export default useAsyncStorage