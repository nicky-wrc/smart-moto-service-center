import { useEffect } from 'react';
import { useAlert } from '../contexts/AlertContext';

export function AlertInterceptor() {
  const { showAlert } = useAlert();

  useEffect(() => {
    // Override native browser alert to use our custom modal
    window.alert = (message: string) => {
      showAlert('แจ้งเตือน', message);
    };
  }, [showAlert]);

  return null;
}
