import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import parser from "querystring";
import Translator from "./translatorLogic";

export async function handler(event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> {
    const body = parser.parse(event.body || "{}")
    if (event.httpMethod == "POST") {
        
        const { text, locale } = JSON.parse(event.body || "{}") as Record<'text' | 'locale' , string>;
        if (text == undefined || locale == undefined) return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Required field(s) missing' })
        }
        if (text == '') return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No text to translate' })
        }
        if (locale != 'american-to-british' && locale != 'british-to-american') return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid value for locale field' })
        }

        const translator = new Translator(text, locale)

        const translation = translator.highlight();

        return {
            statusCode: 200,
            body: JSON.stringify({text, translation})
        }
    }
    return {
        statusCode: 405,
    }
}
