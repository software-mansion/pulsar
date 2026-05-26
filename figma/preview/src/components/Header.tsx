export function Header({ status, count }: { status: string; count: number }) {
  return (
    <header className="header">
      <span className="dot" />
      <span className="brand">Pulsar</span>
      <span className="status">{status}</span>
      <span className="pill">
        <b>{count}</b> with haptics
      </span>
    </header>
  );
}
