interface PageHeaderProps {
  onReset: () => void;
}

export function PageHeader({ onReset }: PageHeaderProps) {
  return (
    <header className="card page-header">
      <div>
        <h1>今天谁一起吃饭呀？</h1>
        <p>先拉上饭搭子，再一起把这顿饭算明白。</p>
      </div>
      <button className="btn btn-ghost" type="button" onClick={onReset}>
        重置本次分账
      </button>
    </header>
  );
}
