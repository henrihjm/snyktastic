export function Badge({ id, earned, size = 48 }: { id: string; earned: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={`${id} badge ${earned ? "earned" : "locked"}`}>
      <path
        d="M24 3 L42 10 V23 C42 34 34 42 24 45 C14 42 6 34 6 23 V10 Z"
        fill={earned ? "#a21caf" : "#1e293b"}
        stroke={earned ? "#f0abfc" : "#475569"}
        strokeWidth="2"
      />
      <text x="24" y="28" textAnchor="middle" fontSize="10" fontFamily="monospace" fill={earned ? "#fff" : "#64748b"}>
        {id}
      </text>
    </svg>
  );
}
