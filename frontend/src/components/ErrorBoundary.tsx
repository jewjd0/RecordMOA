import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card shadow-lg rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2">문제가 발생했습니다</h1>
            <p className="text-gray-600 mb-6">
              앱에서 예상치 못한 오류가 발생했습니다.
              <br />
              페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  오류 세부정보 보기
                </summary>
                <div className="bg-gray-50 p-4 rounded text-xs text-gray-700 overflow-auto max-h-40">
                  <p className="font-semibold mb-1">{this.state.error.name}</p>
                  <p className="mb-2">{this.state.error.message}</p>
                  {this.state.error.stack && (
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCw size={18} />
                페이지 새로고침
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                이전 페이지로
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
