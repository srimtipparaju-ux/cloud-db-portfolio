import { Redis } from "@upstash/redis";

export async function GET() {
  try {
    console.log("ENV URL:", process.env.UPSTASH_REDIS_REST_URL);
    console.log("ENV TOKEN:", process.env.UPSTASH_REDIS_REST_TOKEN);

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const count = await redis.incr("visitors");

    return Response.json({
      visits: count,
    });

  } catch (err: any) {
    console.error("VISITOR API ERROR:", err);

    return Response.json({
      visits: 0,
      error: err.message,
    });
  }
}