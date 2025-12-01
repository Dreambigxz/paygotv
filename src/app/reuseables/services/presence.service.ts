import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private socket: WebSocket | null = null;
  private webLink = '127.0.0.1:8000';

  message$ = new Subject<{ from: string; text: string }>();

  private statusSubject = new BehaviorSubject<{ user_id: number; is_online: boolean } | null>(null);
  userStatus$ = this.statusSubject.asObservable();

  connect(tokenData: any) {
    this.socket = new WebSocket(`ws://${this.webLink}/ws/presence/?token=${tokenData.token}`);

    this.socket.onopen = () => console.log('✅ Presence WebSocket connected');
    this.socket.onclose = () => console.log('❌ Presence WS disconnected');


    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 Message from server:', data);

      switch (data.type) {
        case 'challenge_received':
          this.handleChallengeReceived(data);
          break;
        case 'challenge_response':
          this.handleChallengeResponse(data);
          break;
        case 'match_invitation':
          alert(`${data.message}`);
          break;
        case 'chat':
          this.simulateIncoming(data)
         break
        case 'status':
          this.statusSubject.next({
            user_id: data.user_id,
            is_online: data.is_online,
          });
          break
        default:
          console.log('⚙️ Unhandled WS message:', data);
      }
    };

  }

  // 🔹 Send generic WS message
  sendMessage(payload: any) {

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("SEDING");

      this.socket.send(JSON.stringify(payload));
    } else {
      console.warn('⚠️ WebSocket not open. Cannot send message.');
    }
  }

  sendChat(to_user: number, message: string) {
    this.sendMessage({
      action: 'chat',
      to_user,
      message,
    });
  }

  // Simulate receiving a message/chat
  simulateIncoming(data:any) {
    console.log('simulateIncoming', data);

    this.message$.next({ from:data.from_user, text:data.message });
  }
  // 🔹 Handle incoming challenge from another player
  private handleChallengeReceived(data: any) {
    const { type,message,match } = data;
    if (confirm(`${match.player1.username} challenged you to play ${match.game}. Accept?`)) {
      this.sendMessage({
        action: 'respond',
        challenge_id:match.id,
        response: 'accepted',
      });
    } else {
      this.sendMessage({
        action: 'respond',
        challenge_id:match.id,
        response: 'rejected',
      });
    }
  }

  // 🔹 Handle the challenger being notified of the opponent's response
  private handleChallengeResponse(data: any) {
    const { opponent, response } = data;
    if (response === 'accepted') {
      alert(`🎮 ${opponent} accepted your challenge!`);
    } else {
      alert(`❌ ${opponent} declined your challenge.`);
    }
  }

  private handleOpponentChat(data:any){
      console.log("hanndleOppChat", data);

  }
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
