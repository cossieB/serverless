import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import mongoose from "mongoose";
import parser from "querystring";
import { Users } from "../../models/userSchema";

export async function handler(event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> {
    const body = parser.parse(event.body || "{}")
    if (event.httpMethod == "POST") {
        await mongoose.connect(process.env.MONGO_URI!)
        let { username } = body;
        
        if (!username) return {
            statusCode: 400,
            body: JSON.stringify({error: "username required"})
        }

        let user = new Users({ username })
        await user.save()
        let { _id } = user
        return {
            statusCode: 201,
            body: JSON.stringify({username, _id})
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hello World" }),
    }
}


