export default function Architecture() {
  return (
    <section className="p-10 text-center">
      <h2 className="text-3xl mb-6">System Architecture</h2>
      <div className="bg-gray-900 p-6 rounded max-w-3xl mx-auto text-left text-gray-300">
        <ul className="space-y-2">
          <li>🌐 Frontend: Next.js (React), TypeScript, Tailwind CSS</li>
          <li>⚙️ Backend: Node.js, Express, REST APIs, Streaming SSE</li>
          <li>🤖 AI / LLM: Anthropic Claude (claude-sonnet-4.5), Multi-agent orchestration, RAG pipelines</li>
          <li>📚 Vector DB: Pinecone, OpenAI embeddings (text-embedding-3-small)</li>
          <li>☁️ Cloud: OCI, AWS (ECS Fargate, S3, CloudWatch, Lambda), Vercel</li>
          <li>🗄️ Database: Oracle Autonomous DB, PostgreSQL, AWS RDS / Aurora</li>
          <li>📦 Containers / IaC: Docker, Kubernetes (CKA), Helm, Terraform</li>
          <li>📊 Observability: Prometheus, Grafana, OEM, CloudWatch, AppDynamics, LLMOps metrics</li>
          <li>🔔 Notifications: Slack Block Kit, Jira REST API, SMTP / HTML email</li>
          <li>⚡ CI/CD: GitHub Actions, AWS CodePipeline, automated SQL gate</li>
        </ul>
      </div>
    </section>
  );
}
