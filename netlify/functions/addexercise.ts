import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import mongoose from "mongoose";
import parser from "querystring";
import { Users } from "../../models/userSchema";

export async function handler(event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> {
    if (event.httpMethod == "POST") {
        const body = parser.parse(event.body || "{}")
        let { description, duration, date } = body as Record<'description' | 'duration' | 'date', string | undefined>;
        let _id = event.queryStringParameters?._id
        await mongoose.connect(process.env.MONGO_URI!)

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
    if (event.httpMethod == "GET") {
        const id = event.queryStringParameters?._id
        if (!id || id.length != 24) return {
            statusCode: 404,
            body: 'User not found'
        }
        const { from, to, limit } = event.queryStringParameters as { [key: string]: string }
        let numLimit: number

        if (!limit || Number.isNaN(Number(limit)))
            numLimit = Number.POSITIVE_INFINITY
        else
            numLimit = Number(limit)

        let fromDate = from ? Date.parse(from) : 0
        if (Number.isNaN(fromDate)) fromDate = 0

        let toDate = to ? Date.parse(to) : Date.now()
        if (Number.isNaN(toDate)) toDate = Date.now()
        await mongoose.connect(process.env.MONGO_URI!)
        const user = await Users.findById(id)
        if (!user) return {
            statusCode: 404,
            body: 'User not found'
        }

        let { _id, username, log } = user;
        const log2 = log.filter(item => item.date.getTime() >= fromDate && item.date.getTime() <= toDate)
            .slice(0, numLimit)
            .map(item => ({
                description: item.description,
                duration: item.duration,
                date: item.date.toDateString()
            }))

        let count = log2.length
        return {
            statusCode: 200,
            body: JSON.stringify({_id, count, username, log: log2})
        }
    }

    return {
        statusCode: 405,
    }
}