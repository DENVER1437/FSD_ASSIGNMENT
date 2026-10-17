import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { MatchProvider } from './context/MatchContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <MatchProvider>
            <AppRoutes />
          </MatchProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
