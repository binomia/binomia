import * as FileSystem from 'expo-file-system';


export const useFileSystem = () => {

    const listFiles = async () => {
        try {
            if (FileSystem.documentDirectory) {
                const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
                console.log(files, 'files');
                return files
            }
        } catch (error) {
            console.error('Error listing files:', error);
        }
    }

    const deleteFile = async (file: string) => {
        try {
            const { exists } = await FileSystem.getInfoAsync(file);

            if (exists) {
                await FileSystem.deleteAsync(`${file}`);
                console.log(`File: ${file} deleted successfully!`);
            }

        } catch (error: any) {
            console.error('Error deleting files:', error);
        }
    }

    return {
        listFiles,
        deleteFile,
        dir: FileSystem.documentDirectory
    }
}