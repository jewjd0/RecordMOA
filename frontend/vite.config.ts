import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리를 별도 청크로 분리
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          // Firebase 라이브러리를 별도 청크로 분리
          'firebase-vendor': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage'
          ],
          // Recharts 라이브러리를 별도 청크로 분리 (큰 라이브러리)
          'recharts-vendor': ['recharts'],
          // UI 컴포넌트 라이브러리
          'ui-vendor': ['lucide-react', 'sonner'],
        },
      },
    },
    // 청크 크기 경고 임계값 상향 (너무 많은 경고 방지)
    chunkSizeWarningLimit: 1000,
    // 소스맵 비활성화로 빌드 크기 감소 (프로덕션)
    sourcemap: false,
  },
})
