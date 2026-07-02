"use client";

import { useEffect, useState, useCallback } from "react";

// A simple short high-pitched beep encoded in base64 (so we don't need external audio files)
const ALERT_SOUND_B64 = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU..."; 
// Actually, to make it completely safe and not take up huge space, let's use the Web Audio API to synthesize a beep dynamically!

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notification");
      return;
    }

    setPermission(Notification.permission);
    if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        setPermission(perm);
      });
    }
  }, []);

  const playAlertSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      // High pitched emergency tone
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("AudioContext not supported or blocked", e);
    }
  }, []);

  const notify = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === "granted") {
      new Notification(title, {
        icon: "/favicon.ico", // Using default nextjs favicon
        badge: "/favicon.ico",
        ...options,
      });
    }
  }, [permission]);

  const alertNewIncident = useCallback((title: string, body: string) => {
    playAlertSound();
    notify(title, { body });
  }, [playAlertSound, notify]);

  return { permission, notify, alertNewIncident };
}
