export default function Skills() {
  return (
    <section id="skills" className="p-10">
      <h2 className="text-3xl mb-6">Technical Expertise</h2>

      <div className="grid md:grid-cols-3 gap-6 text-gray-300">

        <div>
          <h3 className="text-green-400 mb-2">Cloud & Platforms</h3>
          <p>
            OCI, Oracle Autonomous DB, Oracle RDBMS, PostgreSQL
          </p>
        </div>

        <div>
          <h3 className="text-green-400 mb-2">Database Engineering</h3>
          <p>
            SQL, PL/SQL, Performance tuning, Query optimization,
            High availability, Backup & recovery
          </p>
        </div>

        <div>
          <h3 className="text-green-400 mb-2">DevOps & Tools</h3>
          <p>
            Docker, Kubernetes, CI/CD, Git, Python, Shell scripting,
            AWR, ADDM, TKPROF, AppDynamics
          </p>
        </div>

      </div>
    </section>
  );
}