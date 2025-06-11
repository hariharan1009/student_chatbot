import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY
});

export async function POST(req: Request) {
  try {
    // Verify API key is configured
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { messages } = await req.json();
    
    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for students. Provide clear, educational responses to student questions about academics, homework, study techniques, and school life. Keep answers appropriate for all grade levels unless specified otherwise."
        },
        ...messages
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
    });

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('No content in response');
    }

    return NextResponse.json({
      content: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Groq API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        content: "I'm having trouble responding. Please try again later."
      },
      { status: 500 }
    );
  }
}