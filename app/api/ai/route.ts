import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: "Prompt is required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // 🔥 powerful + free
      messages: [
        {
          role: "system",
          content: `
You are an AI assistant.

Respond in this format:

Summary:
...

Key Points:
- ...
- ...

Insights:
- ...
- ...
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return Response.json({
      result: completion.choices[0].message.content,
    });

  } catch (err: any) {
    console.error("GROQ ERROR:", err);

    return Response.json({
      result: `
Summary:
AI temporarily unavailable

Key Points:
- Could not process request
- Check API configuration

Insights:
- Ensure GROQ_API_KEY is set
      `,
    });
  }
}