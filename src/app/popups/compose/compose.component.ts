import { Component } from '@angular/core';
import { faPaperPlane, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-compose',
  templateUrl: './compose.component.html',
  styleUrl: './compose.component.scss',
  providers: [DialogService],
})
export class ComposeComponent {
  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    this.form = this.config.data.form;
    this.submit = this.config.data.submit;
  }

  // Icons
  faPaperPlane = faPaperPlane;
  faTrash = faTrash;

  form!: any;
  display: boolean = true;

  submit: Function;

  send() {
    this.submit();
    this.ref.close();
  }

  cancel() {
    this.ref.close();
  }
}
