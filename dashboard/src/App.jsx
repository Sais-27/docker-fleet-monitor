import { useEffect, useState } from "react";

const STALE_AFTER_SECONDS = 20;

function getStatus(server) {
  const secondsAgo = (Date.now() - new Date(server.reported_at).getTime()) / 1000;
  if (secondsAgo > STALE_AFTER_SECONDS) return "down";
  if (server.cpu_percent > 85 || server.memory_percent > 85 || server.disk_percent > 90) {
    return "critical";
  }
  if (server.cpu_percent > 70 || server.memory_percent > 70 || server.disk_percent > 80) {
    return "warning";
  }
  return "healthy";
}

export default function App() {
  const [servers, setServers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/servers");
        setServers(await res.json());
        setError(null);
      } catch (err) {
        setError("Cannot reach the API");
      }
    }
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main>
      <h1>Server Fleet Monitor</h1>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {servers.map((s) => {
          const status = getStatus(s);
          return (
            <div key={s.server} className={`card ${status}`}>
              <h2>{s.server}</h2>
              <p className="badge">{status}</p>
              <p>CPU: {s.cpu_percent}%</p>
              <p>Memory: {s.memory_percent}%</p>
              <p>Disk: {s.disk_percent}%</p>
              <p className="time">Last seen: {new Date(s.reported_at).toLocaleTimeString()}</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}