export async function GET() {
  return Response.json({
    query: "SELECT * FROM users",
    rows: [
      { id: 1, name: "Alice", role: "Admin" },
      { id: 2, name: "Bob", role: "Developer" },
      { id: 3, name: "Charlie", role: "Analyst" }
    ],
    executionTime: "12ms",
    database: "Oracle Autonomous DB",
    status: "Success"
  });
}