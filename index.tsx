
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Simple Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  state = { hasError: false, error: null as Error | null };

  constructor(props: { children: React.ReactNode }) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h1>Algo deu errado 😕</h1>
          <p>O aplicativo encontrou um erro e não conseguiu abrir.</p>
          <div style={{ background: '#fef2f2', color: '#991b1b', padding: 15, borderRadius: 8, margin: '20px auto', maxWidth: 600, overflow: 'auto' }}>
            <strong>Erro Técnico:</strong><br />
            {this.state.error?.message}
          </div>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Tentar Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
