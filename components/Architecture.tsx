export default function Architecture() {
  return (
    <section className="p-10 text-center">
      <h2 className="text-3xl mb-6">System Architecture</h2>

      <div className="bg-gray-900 p-6 rounded max-w-3xl mx-auto text-left text-gray-300">
        <ul className="space-y-2">
          <li>🌐 Frontend: Next.js (React)</li>
          <li>⚙️ Backend: API Routes</li>
          <li>☁️ Cloud: OCI (Simulated)</li>
          <li>🗄️ Database: Oracle Autonomous DB</li>
          <li>📊 Monitoring: AWR, ADDM, AppDynamics</li>
        </ul>
      </div>
    </section>
  );
}