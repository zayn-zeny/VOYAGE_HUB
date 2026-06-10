import { useNotification } from '../contexts/NotificationContext';

export default function useSocket() {
  const { socket } = useNotification();
  return socket;
}
