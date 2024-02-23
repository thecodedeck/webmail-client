import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor(private http: HttpClient) {}

  getEmails(page: number = 0, perPage: number = 10, folder: string = 'INBOX') {
    return this.http.get<any>('http://localhost:3000/get-emails', {
      params: {
        page: page.toString(),
        perPage: perPage.toString(),
        folder,
      },
    });
  }

  composeEmail(email: { subject: string; message: string; to: string }) {
    return this.http.post<any>('http://localhost:3000/send-email', email);
  }

  sendReply(text: string, id: string) {
    return this.http.post<any>('http://localhost:3000/send-reply', {
      text,
      id,
    });
  }

  moveToFolder(id: string, sourceFolder: string, folder: string) {
    return this.http.post<any>('http://localhost:3000/move-to-folder', {
      id,
      sourceFolder,
      folder,
    });
  }

  deleteEmail(id: string) {
    return this.http.post<any>('http://localhost:3000/delete-email', {
      id,
    });
  }

  markAsRead(id: string) {
    return this.http.post<any>('http://localhost:3000/mark-as-read', {
      id,
    });
  }

  markAsUnread(id: string) {
    return this.http.post<any>('http://localhost:3000/mark-as-unread', {
      id,
    });
  }
}
