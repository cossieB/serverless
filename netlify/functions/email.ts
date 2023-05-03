import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

export async function handler(event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> {
    console.log(event.httpMethod)
    if (event.httpMethod == "OPTIONS") {
        const CORS_HEADERS = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*',
        };
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: 'Successful preflight call.' }),
        };
    }
    if (event.httpMethod == "POST") {
        const mailgun = new Mailgun(FormData);
        const MAILGUN_KEY = process.env['MAILGUN_KEY']
        const mg = mailgun.client({ username: 'api', key: MAILGUN_KEY || 'key-yourkeyhere' });
        const PUBKEY = process.env['MAILGUN_PUBKEY']
        const DOMAIN = 'sandboxab001f3c9ee145d6a145546df2d5338f.mailgun.org';
        const body = JSON.parse(event.body!)
        const { name, company, email, msg } = body;
        const data = {
            from: 'Cossie Bot <postmaster@sandboxab001f3c9ee145d6a145546df2d5338f.mailgun.org>',
            to: process.env.EMAIL,
            subject: `${name} - ${company}`,
            html: `<div style="text-align: center"><h1>${company}</h1><h2>${name}</h2><h2>${email}</h2><p>${msg}</p></div>`
        };
        try {
            await mg.messages.create(DOMAIN, data);
            return {
                statusCode: 200,
                body: JSON.stringify({ status: "success" })
            }
        }
        catch (e: any) {
            console.log(e);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: e.message })
            }
        }
    }
    else return {
        statusCode: 405,
    }
}
