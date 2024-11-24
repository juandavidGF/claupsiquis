import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

// Define the MessageContent type
type MessageContent = 
  | { text: string }
  | { image: string };

// Assuming you have a type guard or a way to differentiate message content types
function handleMessageContent(content: MessageContent) {
    if ('text' in content) {
        // Handle text content
        return content.text; // Access text property safely
    } else if ('image' in content) {
        // Handle image content
        return content.image; // Access image property safely
    }
    // Handle other content types as necessary
    throw new Error('Unsupported message content type');
}

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
          message: handleMessageContent(lastMessage.content[0] as unknown as MessageContent)
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