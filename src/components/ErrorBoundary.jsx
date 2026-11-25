import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 text-slate-800">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900">حدث خطأ مؤقت في عرض هذه الواجهة</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {this.state.error?.message || 'تم حصر الخطأ وحماية استقرار المتجر بنجاح.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 bg-[#DF7E93] hover:bg-[#d46b82] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all"
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

