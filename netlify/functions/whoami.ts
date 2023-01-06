import { HandlerEvent, HandlerResponse } from "@netlify/functions";

export async function handler(event: HandlerEvent): Promise<HandlerResponse> {
    
    return {
        statusCode: 200,
        body: JSON.stringify({ 
            ipaddress: event.headers["client-ip"],
            software: event.headers['user-agent'],
            language: event.headers["accept-language"]
        }),
    }
}