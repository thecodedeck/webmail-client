import { Component, ViewChild } from '@angular/core';
import {
  faExclamationTriangle,
  faEye,
  faEyeSlash,
  faFileAlt,
  faInbox,
  faPaperPlane,
  faPen,
  faReply,
  faSignOutAlt,
  faSync,
  faTimes,
  faTrash,
  faTrashRestore,
} from '@fortawesome/free-solid-svg-icons';
import { EmailService } from './services/email.service';
import { finalize, delay, BehaviorSubject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { FormBuilder, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { ComposeComponent } from './popups/compose/compose.component';
import { AuthService } from './services/auth.service';

export interface Email {
  id: string;
  from?: string;
  to?: string;
  subject?: string;
  html?: string;
  text?: string;
  seen?: boolean;
  date?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private emailService: EmailService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private authService: AuthService
  ) {}

  @ViewChild('editor') editor: any;

  // Icons
  faInbox = faInbox;
  faPaperPlane = faPaperPlane;
  faReply = faReply;
  faTimes = faTimes;
  faTrash = faTrash;
  faSync = faSync;
  faPen = faPen;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faFileAlt = faFileAlt;
  faExclamationTriangle = faExclamationTriangle;
  faTrashRestore = faTrashRestore;
  faSignOutAlt = faSignOutAlt;

  // Are the messages loading?
  loading: boolean = true;

  // Are we replying to a message?
  replying: boolean = false;

  // Reply text
  reply: string = '';

  // Emails list (on current page)
  emails: Email[] = [];

  // Pagination properties
  totalPages: number = 0;
  totalMessages: number = 0;
  perPage: number = 10;
  currentPage: number = 1;

  // Selected email properties
  selectedEmail: Email = {
    id: '',
    subject: '',
    html: '',
    text: '',
  };

  // Email display options for toggle
  emailDisplayOptions: { label: string; value: boolean }[] = [
    { label: 'HTML', value: true },
    { label: 'Text', value: false },
  ];

  // Allow HTML in the email?
  allowHTML: boolean = true;

  user: string = '';

  // Selected folder
  selectedFolder: string = 'INBOX';

  // Is the user logged in?
  loggedIn$: BehaviorSubject<boolean> = this.authService.loggedIn$;

  showLogin$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  loginForm = this.formBuilder.group({
    user: ['', Validators.required],
    password: ['', Validators.required],
  });

  authnicate() {
    this.authService.loggedIn$.next(true);
    this.showLogin$.next(false);
    this.user = this.authService.user;

    this.getEmails();
  }

  ngOnInit() {
    // First we check if the user is logged in, this will check against the local storage
    if (this.loggedIn$.value) {
      // However we also need to check against the server
      this.authService.loggedIn().subscribe({
        next: () => {
          this.authnicate();
        },
        error: () => {
          this.authService.loggedIn$.next(false);

          // Clear the local storage if the user is not logged in
          localStorage.removeItem('user');
          localStorage.removeItem('password');
        },
      });
    }
  }

  // Login user
  login() {
    const { user, password } = this.loginForm.value;

    // Before logging in, ensure we are logged out
    this.authService.logout().subscribe(() => {
      // Log in with the new credentials
      this.authService.login(user || '', password || '').subscribe({
        next: () => {
          this.authnicate();
        },
        error: () => {
          this.authService.loggedIn$.next(false);
        },
      });
    });
  }

  // Logout user
  logout() {
    this.authService.logout().subscribe(() => {
      this.resetAll();

      this.authService.loggedIn$.next(false);
      this.showLogin$.next(true);
    });
  }

  // Display reply window
  toggleReply() {
    this.replying = !this.replying;
  }

  // Reset reply window
  resetReply() {
    this.reply = '';
    this.replying = false;
  }

  // Reset selected email and reply window
  resetAll() {
    this.resetReply();
    this.selectedEmail = {
      id: '',
      subject: '',
      html: '',
      text: '',
    };

    this.emails = [];
    this.selectedFolder = 'INBOX';
  }

  // Mark email as unread
  // This sets the corresponding flag on the BE
  markAsUnread(email: Email, event: any) {
    event.stopPropagation();

    if (!email.id) return;

    this.emailService.markAsUnread(email.id).subscribe(() => {
      email.seen = false;
    });
  }

  // Mark email as read
  // This removes the corresponding flag on the BE
  markAsRead(email: Email, event?: any) {
    if (event) {
      event.stopPropagation();
    }

    if (!email.id) return;

    this.emailService.markAsRead(email.id).subscribe(() => {
      email.seen = true;
    });
  }

  // Select an email and mark it as seen if it is not already marked
  selectEmail(email: Email) {
    this.resetReply();
    this.selectedEmail = email;

    if (!email.seen) {
      this.markAsRead(email);
    }
  }

  // Refresh emails
  refreshEmails() {
    this.loading = true;
    this.currentPage = 1;

    this.getEmails();
  }

  // New email form
  // Used to compose a new email
  emailForm = this.formBuilder.group({
    to: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  // Toggle the compose popup
  toggleCompose() {
    this.dialogService.open(ComposeComponent, {
      data: {
        form: this.emailForm,
        submit: () => {
          this.composeEmail();
        },
      },
      header: 'Compose Email',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
    });
  }

  // Compose and send email
  composeEmail() {
    // Getting values and ensuring they are not null
    const { to, subject, message } = this.emailForm.value;

    const email = {
      to: to || '',
      subject: subject || '',
      message: message || '',
    };

    // Composing email
    this.emailService.composeEmail(email).subscribe({
      next: () => {
        this.emailForm.reset();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Message sent!',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred while sending the email',
        });
      },
    });
  }

  // Pagination
  paginate(event: any) {
    this.emails = [];

    this.currentPage = event.page + 1;
    this.perPage = event.rows;

    this.getEmails();
  }

  sendReply() {
    this.replying = false;

    this.emailService.sendReply(this.reply, this.selectedEmail.id).subscribe({
      next: () => {
        this.reply = '';

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Reply sent successfully',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred while sending the reply',
        });
      },
    });
  }

  removeFromTrash(email: Email, event: any) {
    event.stopPropagation();

    this.emailService.moveToFolder(email.id, 'Trash', 'INBOX').subscribe({
      next: () => {
        this.selectedEmail = {
          id: '',
          subject: '',
          html: '',
          text: '',
        };

        this.getEmails('Trash');

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Email moved to inbox successfully',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred while moving the email',
        });
      },
    });
  }

  // Move email to trash
  moveToTrash() {
    // Are we in the trash already?
    // If so, delete the email
    if (this.selectedFolder === 'Trash') {
      this.deleteEmail();
      return;
    }

    // Otherwise, move the email to trash
    this.emailService
      .moveToFolder(this.selectedEmail.id, this.selectedFolder, 'Trash')
      .subscribe({
        next: () => {
          this.selectedEmail = {
            id: '',
            subject: '',
            html: '',
            text: '',
          };

          this.getEmails();

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Email moved to trash successfully',
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An error occurred while moving the email',
          });
        },
      });
  }

  // Deletes email completely
  // The email must be in trash to be deleted
  deleteEmail() {
    this.emailService.deleteEmail(this.selectedEmail.id).subscribe({
      next: () => {
        this.selectedEmail = {
          id: '',
          subject: '',
          html: '',
          text: '',
        };

        this.getEmails();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Email deleted successfully',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred while deleting the email',
        });
      },
    });
  }

  getEmails(folder?: string) {
    if (folder) {
      this.selectedFolder = folder;
    }

    this.loading = true;

    this.emailService
      .getEmails(this.currentPage, this.perPage, this.selectedFolder)
      .pipe(
        delay(500),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          this.emails = res.emails;
          this.totalPages = res.totalPages;
          this.totalMessages = res.totalMessages;
        },
        error: (err) => {
          this.emails = [];
        },
      });
  }
}
