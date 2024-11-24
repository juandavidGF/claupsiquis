import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { message } = body;

    // const completion = await openai.chat.completions.create({
    //   messages: [{ role: "user", content: message }],
    //   model: "gpt-3.5-turbo",
    // });

    return new Response(
      JSON.stringify({ 
        // message: completion.choices[0].message.content 
        message: "I'm a robot"
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error: any) {
    console.error(error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to process the request' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}