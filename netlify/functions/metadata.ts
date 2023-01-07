import busboy from 'busboy';
import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";

export async function handler(event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> {
    if (event.httpMethod == "POST") {
        console.log(event)
        const result = await parse(event)
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    }
    return {
        statusCode: 405,
    }
}

type FileInfo = {
    originalname: string,
    encoding: string,
    mimetype: string,
    size: number
}

function parse(event: HandlerEvent): Promise<FileInfo> {
    return new Promise(resolve => {
        const bb = busboy({ headers: event.headers });
        let originalname = ""
        let encoding = ""
        let mimetype = ""
        let size = 0
        bb.on('file', (name, file, info) => {
            const { filename, encoding: enc, mimeType } = info;
            originalname = filename
            encoding = enc
            mimetype = mimeType
            file.on('data', (data) => {
                size = data.length;
                return resolve({originalname, encoding, mimetype, size}) 
            })
        });
        bb.write(Buffer.from(event.body!, 'base64'));
    })
}