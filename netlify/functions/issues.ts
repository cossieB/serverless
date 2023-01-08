import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import mongoose from "mongoose";
import { Issues } from "../../models/issueSchema";

export async function handler(event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> {
    const { project } = event.queryStringParameters!
    const fields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text']
    if (!['POST', 'GET', 'PUT', 'DELETE'].includes(event.httpMethod)) return {
        statusCode: 405
    }
    await mongoose.connect(process.env.MONGO_URI!)
    const body = JSON.parse(event.body || "{}")        
    if (event.httpMethod == "POST") {
        const { issue_title, issue_text, created_by } = body;
        const assigned_to = body.assigned_to || ""
        const status_text = body.status_text || ""
        const issue = new Issues({ ...body, project, open: true, created_on: new Date().toISOString(), updated_on: new Date().toISOString() })
        try {
            await issue.save()
            return {
                statusCode: 201,
                body: JSON.stringify({ assigned_to, status_text, open: true, _id: issue.id, issue_title, issue_text, created_by, created_on: issue.created_on, updated_on: issue.updated_on })
            }
        }
        catch (e) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'required field(s) missing' })
            }
        }
    }
    if (event.httpMethod == "PUT") {
        try {
            const { _id } = body
            if (!_id) return {
                statusCode: 400,
                body: JSON.stringify({ error: 'missing _id' })
            }

            if (fields.every(item => !(item in body))) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'no update field(s) sent', '_id': _id })
                }
            }

            const doc = await Issues.findById(_id).catch(() => null)

            if (!doc) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'could not update', _id })
                }
            }

            for (const prop in body) {
                // @ts-expect-error
                if (fields.includes(prop.toLowerCase())) doc[prop] = body[prop] || doc[prop] || '';
            }

            if (body.open == false || body.open == 'false') doc.open = false; 
            doc.updated_on = new Date()
            await doc.save()

            return {
                statusCode: 200,
                body: JSON.stringify({ result: 'successfully updated', _id })
            }
        }
        catch (e: any) {

        }
    }
    if (event.httpMethod == "GET") {
        try {
            let query: any = { project }
            for (const prop in event.queryStringParameters) {
                if ([...fields, 'open'].includes(prop.toLowerCase())) query[prop] = event.queryStringParameters[prop]
            }
            const result = await Issues.find(query).select('-project')
            return {
                statusCode: 200,
                body: JSON.stringify(result)
            }
        }
        catch (e: any) {
            console.log(e)
        }
    }
    if (event.httpMethod == "DELETE") {
        console.log("Here")
        try {
            const { _id } = body
            if (!_id) return {
                statusCode: 400,
                body: JSON.stringify({ error: 'missing _id' })
            }

            const result = await Issues.findByIdAndDelete(_id).catch(() => null)

            if (result) return {
                statusCode: 200,
                body: JSON.stringify({ result: "successfully deleted", _id })
            }
            else return {
                statusCode: 404,
                body: JSON.stringify({ error: "could not delete", _id })
            }
        }
        catch (e: any) {
            console.log(e)
        }           
    }
    return {
        statusCode: 405
    }
}
