import {Component, ErrorInfo, ReactNode, StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends Component<{children: ReactNode}, ErrorBoundaryState> {
  declare props: Readonly<{children: ReactNode}>;
  state: ErrorBoundaryState = {hasError: false, errorMessage: ''};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {hasError: true, errorMessage: error?.message || 'Unexpected application error'};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFAF5] p-6 text-stone-900">
          <div className="max-w-md w-full bg-white border border-amber-200 rounded-2xl p-6 shadow-md text-center space-y-4">
            <h1 className="serif text-2xl font-bold text-stone-950">Nems Bakery &amp; Catering Co.</h1>
            <p className="text-sm text-stone-600">
              Something went wrong while loading the page. Please reload to try again.
            </p>
            <p className="text-xs font-mono text-rose-600 break-words">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-stone-950 hover:bg-[#C5A028] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>,
  );
}
