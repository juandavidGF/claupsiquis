import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { threadId, runId } = body;

    const run = await openai.beta.threads.runs.retrieve(
      threadId,
      runId
    );

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(threadId);
      const lastMessage = messages.data[0];

      return new Response(
        JSON.stringify({ 
          status: run.status,
          message: lastMessage.content[0].type === 'text' 
            ? lastMessage.content[0].text.value 
            : ''
        }),
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        status: run.status
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error(error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to process the request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}