'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '@/store/toastStore';
import { useSOSModalStore } from '@/store/sosModalStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

interface UseRealtimeDashboardOptions {
  elderlyProfileId: string | null;
  enabled?: boolean;
}

export function useRealtimeDashboard({ elderlyProfileId, enabled = true }: UseRealtimeDashboardOptions): { socket: Socket | null } {
  const socketRef = useRef<Socket | null>(null);
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const showSOS = useSOSModalStore((s) => s.showSOS);

  const connect = useCallback(async () => {
    if (!elderlyProfileId || !enabled) return;

    const token = await getToken();
    if (!token) return;

    // Disconnect existing
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
    }

    const socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('join_dashboard', { elderlyProfileId });
    });

    // ── SOS TRIGGERED — full-screen modal ──
    socket.on('sos_triggered', (data: any) => {
      showSOS({
        sosEventId: data.sosEventId,
        elderlyProfileId: data.elderlyProfileId,
        elderlyName: data.elderlyName ?? 'Unknown',
        triggerType: data.triggerType ?? 'unknown',
        severity: data.severity ?? 'high',
        location: data.location,
        contactNames: data.contactNames,
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
      queryClient.invalidateQueries({ queryKey: ['sos-events'] });
    });

    socket.on('sos_resolved', () => {
      addToast('SOS event resolved ✓', 'success');
      queryClient.invalidateQueries({ queryKey: ['sos-events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    });

    // ── MEDICATION EVENTS ──
    socket.on('medication_taken', (data: any) => {
      addToast(`${data.medicineName ?? 'Medication'} taken ✓`, 'success');
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    });

    socket.on('medication_missed', (data: any) => {
      addToast(`${data.medicineName ?? 'Medication'} missed — was due at ${data.scheduledAt ?? 'unknown'}`, 'warning', 6000);
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    });

    socket.on('medication_due', (data: any) => {
      addToast(`Time for ${data.medicineName ?? 'medication'} ${data.dosage ?? ''}`, 'info', 8000);
    });

    // ── LOCATION ──
    socket.on('location_update', () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
      addToast('Location updated', 'info', 3000);
    });

    // ── BATTERY ──
    socket.on('low_battery', (data: any) => {
      addToast(`Battery at ${data.level ?? '?'}% — please charge ${data.name ?? 'the phone'}`, 'warning', 8000);
    });

    // ── VOICE COMMAND ──
    socket.on('voice_command', () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    });

    // ── DEVICE REGISTERED ──
    socket.on('device_registered', (data: any) => {
      addToast(`${data.name ?? 'Device'} is connected to Sahayak`, 'success');
    });

    // ── LONELINESS ──
    socket.on('loneliness_alert', (data: any) => {
      addToast(`${data.name ?? 'User'} has been inactive for ${data.inactiveHours ?? '48+'}h — check in on them`, 'warning', 10000);
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        socket.connect(); // Reconnect if server disconnected
      }
    });

    socketRef.current = socket;
  }, [elderlyProfileId, enabled, getToken, queryClient, addToast, showSOS]);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        if (elderlyProfileId) {
          socketRef.current.emit('leave_dashboard', { elderlyProfileId });
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connect, elderlyProfileId]);

  return { socket: socketRef.current };
}
