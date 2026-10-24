import { Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export function ChatPage() {
  return <Navigate to={ROUTES.DASHBOARD} replace />;
}

export default ChatPage;
