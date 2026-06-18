import Sidebar from './Sidebar';
import './AppShell.css';

function AppShell({ title, children }) {
  return (
    <div className="shell">
      <Sidebar />
      <main className="shell-main">
        <header className="shell-header">
          <h1>{title}</h1>
        </header>
        <div className="shell-content">{children}</div>
      </main>
    </div>
  );
}

export default AppShell;
