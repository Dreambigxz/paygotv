import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { PresenceService } from './presence.service'; // ✅ make sure this service broadcasts { user_id, is_online }

export interface ChatMessage {
  sender: 'me' | 'other';
  text: string;
  seen?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
  chats: { [opponentId: string]: BehaviorSubject<ChatMessage[]> } = {};

  // ✅ Opponent online/offline status map
  private opponentStatusMap = new Map<string, BehaviorSubject<boolean>>();

  constructor(private presence: PresenceService) {
    // ✅ Subscribe to backend presence updates
    this.presence.userStatus$.subscribe((update) => {
      if (!update) return;
      const id = String(update.user_id);
      if (!this.opponentStatusMap.has(id)) {
        this.opponentStatusMap.set(id, new BehaviorSubject<boolean>(update.is_online));
      } else {
        this.opponentStatusMap.get(id)!.next(update.is_online);
      }
    });
  }

  // === CHAT STORAGE ===

  private getSubject(opponentId: string) {
    if (!this.chats[opponentId]) {
      this.chats[opponentId] = new BehaviorSubject<ChatMessage[]>(this.loadChat(opponentId));
    }
    return this.chats[opponentId];
  }

  getChat$(opponentId: string) {
    return this.getSubject(opponentId).asObservable();
  }

  // ✅ Add new message (incoming unseen by default)
  addMessage(opponentId: string, msg: ChatMessage) {
    const subject = this.getSubject(opponentId);
    const messages = [...subject.value];

    if (msg.sender === 'other' && msg.seen === undefined) {
      msg.seen = false;
    }

    messages.push(msg);
    subject.next(messages);
    this.saveChat(opponentId, messages);
  }

  // ✅ Mark all unseen messages as seen
  markAllAsSeen(opponentId: string) {
    const subject = this.getSubject(opponentId);
    const updated = subject.value.map((m) => {
      if (m.sender === 'other') m.seen = true;
      return m;
    });
    subject.next(updated);
    this.saveChat(opponentId, updated);
  }

  // ✅ Get unseen messages for a single opponent
  getUnseenMessages$(opponentId: string) {
    return this.getSubject(opponentId).pipe(
      map((messages) => messages.filter((m) => m.sender === 'other' && !m.seen))
    );
  }

  // ✅ Get total unseen messages across all opponents
  getTotalUnseenCount(): number {
    let total = 0;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('chat_')) {
        const stored = localStorage.getItem(key);
        if (!stored) continue;
        try {
          const parsed = JSON.parse(stored);
          if (Date.now() - parsed.timestamp < this.EXPIRY_MS) {
            const unseen =
              parsed.messages?.filter((m: ChatMessage) => m.sender === 'other' && !m.seen).length || 0;
            total += unseen;
          } else {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
    return total;
  }

  // ✅ Save chat to localStorage
  saveChat(opponentId: string, messages: ChatMessage[]): void {
    const data = { timestamp: Date.now(), messages };
    localStorage.setItem(`chat_${opponentId}`, JSON.stringify(data));
  }

  // ✅ Load chat and clean expired
  loadChat(opponentId: string): ChatMessage[] {
    const key = `chat_${opponentId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < this.EXPIRY_MS) {
        return parsed.messages || [];
      }
      localStorage.removeItem(key);
    } catch {
      localStorage.removeItem(key);
    }
    return [];
  }

  // ✅ Remove expired chats automatically
  clearExpiredChats(): void {
    const now = Date.now();
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('chat_')) {
        const stored = localStorage.getItem(key);
        if (!stored) return;
        try {
          const parsed = JSON.parse(stored);
          if (now - parsed.timestamp >= this.EXPIRY_MS) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  }

  // === ✅ OPPONENT STATUS TRACKING ===

  /** Live observable for a specific opponent’s status */
  getOpponentStatus$(opponentId: string): Observable<boolean> {
    console.log({opponentId});

    if (!this.opponentStatusMap.has(opponentId)) {
      this.opponentStatusMap.set(opponentId, new BehaviorSubject<boolean>(false));
    }
    let status= this.opponentStatusMap.get(opponentId)!.asObservable();
    console.log({status:this.opponentStatusMap.get(opponentId)});

    return status

  }

  /** Synchronous access to current status */
  getOpponentStatus(opponentId: string): boolean {
    return this.opponentStatusMap.get(opponentId)?.value ?? false;
  }
}
