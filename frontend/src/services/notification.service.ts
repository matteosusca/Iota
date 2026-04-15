import { apiService } from './api.service';

class NotificationService {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async subscribeUser(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    try {
      // 1. Intersect backend for dynamic identity key
      const configCall = await apiService.get<{ publicKey: string }>('/api/v1/config/vapid');
      const publicKey = configCall.publicKey;

      if (!publicKey) {
         console.warn('Backend failed to return a VAPID public key. Cannot subscribe.');
         return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey) as any
      });

      await apiService.post('/api/v1/notifications/subscribe', {
        subscription
      });
      
      console.log('User is subscribed to push notifications.');
    } catch (err) {
      console.error('Failed to subscribe the user: ', err);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const notificationService = new NotificationService();
