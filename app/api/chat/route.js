import {NextResponse} from 'next/server'
import OpenAI from 'openai'

const systemPrompt = "You are an AI-powered chatbot who supports me with technical interview prep."

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()
    const completion = await openai.chat.completions.create({
        message: [{role: 'system', content: systemPrompt},...data],
        model: 'gpt-3.5-turbo',
        stream: true,
    })

    const streamt = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion){
                    const content = chunk.choices[0].delta.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch (error) {
                controller.error(error)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}