import React from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

// App-wide safety net. If any view throws during render, we show a friendly
// branded screen instead of a blank page or a raw stack trace.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('App error boundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem', background: 'var(--bg-alt, #F5F5F0)', textAlign: 'center',
      }}>
        <div style={{
          maxWidth: 420, background: 'white', borderRadius: 16, padding: '2.5rem 1.75rem',
          boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--primary-light, #E8F3EE)', color: 'var(--primary, #035C43)',
          }}>
            <ShieldAlert size={32} />
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-dark, #111827)' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--text-gray, #6B7280)', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
            Lost&amp;Found hit an unexpected problem. Your data is safe — please head
            back and try again.
          </p>
          <button onClick={this.handleReset} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer',
            background: 'var(--primary, #035C43)', color: 'white', fontWeight: 600,
            padding: '0.8rem 1.5rem', borderRadius: 10, fontSize: '0.95rem',
          }}>
            <RotateCcw size={18} /> Back to safety
          </button>
        </div>
      </div>
    );
  }
}
