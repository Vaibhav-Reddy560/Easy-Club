import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/services/supabase';
import { CustomElement, CustomArtboard } from '@/components/domains/design/types';

export interface CursorPosition {
  x: number;
  y: number;
}

export interface Peer {
  id: string;
  name: string;
  color: string;
  cursor?: CursorPosition;
  selectedElementId?: string | null;
}

const COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', 
  '#007AFF', '#5856D6', '#FF2D55', '#E56CEB', '#34C759'
];

export function useMultiplayer(eventId: string | undefined, user: { uid: string; displayName: string | null } | null) {
  const [peers, setPeers] = useState<Record<string, Peer>>({});
  const channelRef = useRef<any>(null);
  const myColorRef = useRef<string>('#FFCC00');
  
  // Callbacks for receiving state from others
  const onReceiveStateRef = useRef<((state: any) => void) | null>(null);

  useEffect(() => {
    if (!eventId || !user || !supabase) return;

    const roomId = `design-${eventId}`;
    myColorRef.current = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    const channel = supabase.channel(roomId, {
      config: {
        presence: {
          key: user.uid,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const updatedPeers: Record<string, Peer> = {};
        Object.keys(state).forEach((key) => {
          if (key !== user.uid) { // Don't add ourselves to peers list
            const presences = state[key] as any[];
            if (presences.length > 0) {
              const latest = presences[presences.length - 1];
              updatedPeers[key] = {
                id: key,
                name: latest.name,
                color: latest.color,
                cursor: latest.cursor,
                selectedElementId: latest.selectedElementId
              };
            }
          }
        });
        setPeers(updatedPeers);
      })
      // Listen to cursor updates
      .on('broadcast', { event: 'cursor-update' }, ({ payload }) => {
        if (payload.userId !== user.uid) {
          setPeers(prev => {
            const peer = prev[payload.userId];
            if (!peer) return prev;
            return {
              ...prev,
              [payload.userId]: { ...peer, cursor: payload.cursor }
            };
          });
        }
      })
      // Listen to full state updates
      .on('broadcast', { event: 'state-update' }, ({ payload }) => {
        if (payload.userId !== user.uid && onReceiveStateRef.current) {
          onReceiveStateRef.current(payload.state);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            name: user.displayName || 'Club Member',
            color: myColorRef.current,
            cursor: null,
            selectedElementId: null
          });
        }
      });

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [eventId, user]);

  const broadcastCursor = useCallback((cursor: CursorPosition) => {
    if (!channelRef.current || !user) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'cursor-update',
      payload: { userId: user.uid, cursor }
    }).catch(() => {});
  }, [user]);

  const broadcastState = useCallback((state: any) => {
    if (!channelRef.current || !user) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'state-update',
      payload: { userId: user.uid, state }
    }).catch(() => {});
  }, [user]);
  
  const updatePresence = useCallback((selectedElementId: string | null) => {
    if (!channelRef.current || !user) return;
    channelRef.current.track({
      name: user.displayName || 'Club Member',
      color: myColorRef.current,
      selectedElementId
    }).catch(() => {});
  }, [user]);

  return {
    peers,
    broadcastCursor,
    broadcastState,
    updatePresence,
    setOnReceiveState: (cb: (state: any) => void) => {
      onReceiveStateRef.current = cb;
    }
  };
}
