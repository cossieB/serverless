import { quotes } from "./quoteslist";
import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";

export async function handler(event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> {
    if (event.httpMethod == "GET") {
        const limit = Number(event.queryStringParameters?.limit) || 1;
        return {
            statusCode: 200,
            body: JSON.stringify({quotes: slicedQuotes(limit)})
        }
    }
    return {
        statusCode: 405
    }
}

function shuffleArray<T>(arr: T[]) {
    let localCopy = [...arr]
    let shuffledArray: T[] = [];

    while (localCopy.length > 0) {
        let index = Math.floor(Math.random() * localCopy.length);
        let elems = localCopy.splice(index, 1);
        shuffledArray = shuffledArray.concat(elems)
    }
    return shuffledArray
}

function slicedQuotes(limit: number = 1) {
    let shuffledQuotes = shuffleArray(quotes);
    return shuffledQuotes.slice(0, limit)
}
