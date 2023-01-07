import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import dns from 'dns/promises'
import whatwg from 'whatwg-url'
import { URLModel } from "../../models/urlSchema";
import parser from "querystring";
import mongoose from "mongoose";

export async function handler(event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> {
    // console.log(event);
    await mongoose.connect(process.env.MONGO_URI!)
    if (event.httpMethod == "POST") {
        const body = parser.parse(event.body || "{}")
        const original = body.original as string;
        if (!original) return {
            statusCode: 404,
            body: JSON.stringify({error: "Original field required"})
        }
        let doc = await URLModel.findOne({original})
        
        if (doc) {
            const {original, short} = doc
            return {
                statusCode: 200,
                body: JSON.stringify({original, short})
            }
        }
        let q: whatwg.URL
        // Check if given URL is valid. If not return error response
        try {
            q = new whatwg.URL(original)
            await dns.lookup(q.hostname)
        }
        catch (e: any) {
            return {
                statusCode: 400,
                body: JSON.stringify({error: "Invalid URL"})
            }
        }
        const count = await URLModel.find().count();
        let short = `/api/url/${count}`
        let url = new URLModel({original, short })
        await url.save()
        
        return {
            statusCode: 201,
            body: JSON.stringify({original, short})
        }
    }

    if (event.httpMethod == "GET") {
        const num = event.queryStringParameters?.original
        if (!num) return {
            statusCode: 400
        }
        let doc = await URLModel.findOne({short: '/api/url/'+num});
    
        if (doc) {
            const {original, short} = doc
            return {
                statusCode: 200,
                body: JSON.stringify({original, short})
            }
        }
        else {
            return {
                statusCode: 404,
                body: JSON.stringify({error: "No url found"})
            }
        }
    }
    return {
        statusCode: 405,
    }
}


