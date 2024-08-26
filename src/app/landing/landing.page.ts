import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, IonModal, ToastController } from '@ionic/angular';
import { DataService } from '../services/data/data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { register as registerSwiperElements } from 'swiper/element/bundle';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {
  @ViewChild('childModal1') childModal1: IonModal;
  @ViewChild('childModal2') childModal2: IonModal;

  @ViewChild('datetime', { static: false }) datetime: IonDatetime;

  taskForm: FormGroup;

  isLoading: boolean = false;
  items = [];
  formType: string;
  selectedItem: any;

  constructor(
    private dataService: DataService,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    registerSwiperElements();

    this.taskForm = new FormGroup({
      title: new FormControl(''),
      description: new FormControl(''),
      deadline: new FormControl(''),
    });

    setInterval(() => {
      this.updateView();
    }, 1000);

    this.isLoading = true;
    setTimeout(() => {
      this.refreshContent();
      this.isLoading = false;
    }, 3000);
  }

  updateView() {
    this.cdr.detectChanges();
  }

  async refreshContent() {
    this.isLoading = true;
    const data = this.dataService.getTasks.subscribe((data) => {
      console.log('Data: ', data);
      this.items = data
        .filter((item) => {
          if (this.getTimeLeft(item.deadline) && item.status === true) {
            return item;
          }
        })
        .sort((a, b) => {
          const dateA = new Date(a.deadline);
          const dateB = new Date(b.deadline);
          return dateA.getTime() - dateB.getTime();
        });
        this.isLoading = false;
    });
  }

  onSelectDeadline(event) {
    const eventValue = event.detail.value;
    this.taskForm.controls['deadline'].setValue(eventValue);
  }

  async presentToast(header: any, msg: any, color: any) {
    const toast = await this.toastController.create({
      header: `${header}`,
      message: `${msg}`,
      duration: 1500,
      position: 'bottom',
      color: color,
      translucent: true,
      icon: 'thumbs-up-sharp',
      animated: true,
    });

    await toast.present();
  }

  getTimeLeft(deadline: string) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeLeft = deadlineDate.getTime() - now.getTime();

    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return false;
    }
  }

  async markCompleted(task: any) {
    this.dataService.taskCompleted(task.id);
    this.presentToast(`${task.title}`, 'Task Completed!', 'success');
  }

  async createTask() {
    this.formType = 'create';
    this.childModal1.present();
  }

  async saveTask() {

    console.log('CLicked Save Task');

    this.isLoading = true;
    const data = this.taskForm.value;
    const task = {
      id: Math.random(),
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      status: true,
    };
    this.dataService.createTask(task);
    this.presentToast(`${task.title}`, 'Task Saved!', 'primary');
    this.resetTaskForm();
    this.childModal1.dismiss();
    this.isLoading = false;
  }

  async editTask(task: any) {
    this.formType = 'edit';
    this.childModal1.present();
    this.selectedItem = task; 
    this.taskForm.controls['title'].setValue(task.title);
    this.taskForm.controls['description'].setValue(task.description);
    this.datetime.value = new Date(task.deadline).toISOString();
    this.cdr.detectChanges();
    this.taskForm.controls['deadline'].setValue(this.datetime.value);
  }

  async updateTask() {
    const modifiedData = this.taskForm.value;

    const task = {
      title: modifiedData.title,
      description: modifiedData.description,
      deadline: modifiedData.deadline,
      status: true,
    };

    this.dataService.editTask(this.selectedItem.id, task);
    this.presentToast(`${task.title}`, 'Task Updated!', 'tertiary');
    this.resetTaskForm();
    this.childModal1.dismiss();
  }

  async deleteTask(task: any) {
    this.dataService.deleteTask(task.id);
    this.presentToast(`${task.title}`, 'Task Dumped!', 'danger');
  }

  resetTaskForm() {
    this.taskForm.reset();
    if (this.datetime) {
      this.datetime.value = null;
      this.cdr.detectChanges();
    }
  }

  closeChildModal1() {
    this.resetTaskForm();
    this.childModal1.dismiss();
  }

  closeChildModal2() {
    this.resetTaskForm();
    this.childModal2.dismiss();
  }

}
