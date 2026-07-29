export default function StatusBadge({ status }: { status: string }) {
  const labels: Record<string,string> = { draft: "Draf", final: "Final", printed: "Dicetak" };
  return <span className={`status ${status}`}><i />{labels[status] ?? status}</span>;
}
