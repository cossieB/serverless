import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import Converter from "./converterLogic";

export async function handler(event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> {
    if (event.httpMethod == "GET") {
        const input = event.queryStringParameters?.input as string
        if (!input) return {
            statusCode: 400,
            body: "Input required"
        }
        try {
            const converter = new Converter(input)
            const {initNum, initUnit, returnUnit} = converter
            const returnNum = converter.convert()
            const string = converter.getString()
    
            return {
                statusCode: 200,
                body: JSON.stringify({initNum, initUnit, returnNum, returnUnit, string})
            }
        }
        catch(e: any) {
            return {
                statusCode: 400,
                body: e.message
            }
        }
    }
    return {
        statusCode: 405,
    }
}
