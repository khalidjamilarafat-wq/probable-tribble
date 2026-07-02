import React from 'react';
import ReactDOM from 'react-dom/client';
import DentalLabApp from './LabApp';
import './index.css';

// Root error boundary: if any view throws, show a friendly recovery screen
// instead of a blank page (data in localStorage stays intact).
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef3fa', fontFamily: 'Tajawal, Manrope, system-ui, sans-serif', color: '#0f2942', padding: 24 }}>
          <div style={{ background: '#fff', border: '1px solid rgba(15,50,90,0.1)', borderRadius: 20, padding: 32, maxWidth: 460, textAlign: 'center', boxShadow: '0 20px 50px -20px rgba(16,24,40,0.25)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>حدث خطأ غير متوقع · Something went wrong</div>
            <div style={{ fontSize: 13, color: '#5b6b82', marginBottom: 6 }}>بياناتك محفوظة وبأمان. أعد تحميل الصفحة للمتابعة.</div>
            <div style={{ fontSize: 13, color: '#5b6b82', marginBottom: 18 }}>Your data is safe. Reload the page to continue.</div>
            <div style={{ fontSize: 11, color: '#8593a6', marginBottom: 18, fontFamily: 'monospace', wordBreak: 'break-all' }}>{String(this.state.error?.message || this.state.error)}</div>
            <button
              onClick={() => window.location.reload()}
              style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              إعادة التحميل · Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <DentalLabApp />
    </AppErrorBoundary>
  </React.StrictMode>
);

// PWA: register the service worker in production builds.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
