let count = 0;

export async function GET() {
  count++;

  return Response.json({
    visits: count,
  });
}