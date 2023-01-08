import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import mongoose from "mongoose";
import parser from "querystring";
import { Users } from "../../models/userSchema";

export async function handler(event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> {
    if (event.httpMethod == "POST") {
        const body = parser.parse(event.body || "{}")
        let { description, duration, date } = body as Record<'description' | 'duration' | 'date', string | undefined>;
        await mongoose.connect(process.env.MONGO_URI!)
        let _id = event.queryStringParameters?._id

        if (!duration || Number.isNaN(Number(duration))) {
            return {
                statusCode: 400,
                body: 'Invalid Duration'
            }
        }
        if (!description) {
            return {
                statusCode: 400,
                body: 'Description required'
            }
        }
        let dateTemp = date ? Date.parse(date) : Date.now()

        if (Number.isNaN(dateTemp)) return {
            statusCode: 400,
            body: 'Invalid Date'
        }

        let newDate = new Date(dateTemp)

        try {
            let user = await Users.findById(_id).catch(() => null);
            if (!user) return {
                statusCode: 404,
                body: 'User not found'
            }
            let obj = { description, duration: Number(duration), date: newDate }
            user.log.push(obj)
            let { username } = user
            await user.save()
            return {
                statusCode: 201,
                body: JSON.stringify({ _id, username, date: newDate.toDateString(), description })
            }
        }
        catch (e: any) {
            console.log(e)
            return {
                statusCode: 500,
                body: 'Something went wrong'
            }
        }
    }

    return {
        statusCode: 405,
    }
}