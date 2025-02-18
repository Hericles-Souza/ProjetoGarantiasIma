import api from "@shared/Interceptors";
import pako from 'pako';

export const getFileById = async (itemId: string) => {
    
    const teste = await api.get(`/files/files-ById/download-private-byId/${itemId}`).then((value) => {
        console.log("fileDAta: " + JSON.stringify(value));
        const decompressedData = pako.ungzip(value, { to: 'uint8array' });
        console.log("decompressedData: " + JSON.stringify(decompressedData));
        // const byteArray = new Uint8Array(decompressedData);
        const blob = new Blob([decompressedData], { type: 'image/jpg' });
        console.log("blob: " + JSON.stringify(blob));

        return blob;
    });  
    console.log("teste: " +JSON.stringify(teste))
}