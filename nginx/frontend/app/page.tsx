"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access");
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="splash">
      <span className="splash-logo">◈</span>
      <style jsx>{`
        .splash {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
        }
        .splash-logo {
          font-size: 2.5rem;
          color: var(--accent);
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
