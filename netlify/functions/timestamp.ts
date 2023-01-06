import { HandlerContext, HandlerEvent, HandlerResponse } from "@netlify/functions";

const timezones = [
    'Africa/Johannesburg',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Australia/Sydney',
    'America/Toronto',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'America/Sao_Paulo',
    'Africa/Lagos'
]

export async function handler(event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> {
    const query = event.queryStringParameters?.date
    let date: Date;
    if (!query) {
        date = new Date()
    }
    else {
        if (Number(query)) {
            date = new Date(Number(query))
        }
        else if (new Date(query).toString() != "Invalid Date") {
            date = new Date(query)
        }
        else return {
            statusCode: 404,
            body: JSON.stringify({error: "Invalid Date"})
        }
    }
    let obj: {[key:string]: string} = {}

    // Transform each timezone in the timezones array into just the name of the city and make the resulting names keys in the response json.
    for (let zone of timezones) {
        let key: string
        let match = zone.match(/(?<=\/)\w+/); // matches all alphanumeric characters that are preceded by "/"

        if (match) {
            key = String(match)
            obj[key] = date.toLocaleString('en-za', {timeZone: zone})
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ 
            unix: date.getTime(),
            utc: date.toUTCString(),
            ...obj
        }),
    }
}

