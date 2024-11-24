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
    const { message, userId, threadId } = body;

    // Use existing thread or create a new one
    console.log({threadId});
    let thread;
    if (threadId) {
      thread = { id: threadId };
    } else {
      thread = await openai.beta.threads.create();
    }
    
    // Add the message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message
    });

    // Create a run
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: import.meta.env.ASSISTANT_ID
    });

    // Return the threadId and runId
    return new Response(
      JSON.stringify({ 
        threadId: thread.id,
        runId: run.id
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