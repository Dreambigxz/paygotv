import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ChatMessage {
  sender: 'me' | 'other';
  text: string;
  seen?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
  chats: { [opponentId: string]: BehaviorSubject<ChatMessage[]> } = {};

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

    // Mark incoming messages from others as unseen if not already set
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
    const updated = subject.value.map(m => {
      if (m.sender === 'other') {
        m.seen = true;
      }
      return m;
    });
    subject.next(updated);
    this.saveChat(opponentId, updated);
  }

  // ✅ Get unseen messages for a single opponent
  getUnseenMessages$(opponentId: string) {
    return this.getSubject(opponentId).pipe(
      map(messages => messages.filter(m => m.sender === 'other' && !m.seen))
    );
  }


  // ✅ NEW: Get total unseen messages across all opponents
  getTotalUnseenCount(): number {
    let total = 0;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('chat_')) {
        const stored = localStorage.getItem(key);
        if (!stored) continue;
        try {
          const parsed = JSON.parse(stored);
          if (Date.now() - parsed.timestamp < this.EXPIRY_MS) {
            const unseen = parsed.messages?.filter(
              (m: ChatMessage) => m.sender === 'other' && !m.seen
            ).length || 0;
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
    Object.keys(localStorage).forEach(key => {
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
}
