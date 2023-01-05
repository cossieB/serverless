import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";

export async function handler(event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hello World" }),
    }
}


