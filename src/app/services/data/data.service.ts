import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from 'src/app/model/task';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _tasks = new BehaviorSubject([]);

  constructor() { }

  get getTasks(){
    return this._tasks.asObservable();
  }

  createTask(data: any){
    const task = new Task(data.id, data.title, data.description, data.deadline, data.status);
    this._tasks.next(this._tasks.value.concat(task));
    return task;
  }

  // editTask(id:any, data: any){
  //   console.log('Updated Data and Index: ', data, id);
  //   this._tasks.value.filter
  //   this._tasks.next(this._tasks.value);
  // }

  editTask(id: number, updatedTask: Partial<Task>) {
    const tasks = this._tasks.getValue();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
      const task = tasks[taskIndex];
      const newTask = { ...task, ...updatedTask };
      const newTasks = [...tasks];
      newTasks[taskIndex] = newTask;
      this._tasks.next(newTasks);
    } else {
      console.error('Task not found');
    }
  }

  taskCompleted(id: number) {
    const tasks = this._tasks.getValue();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
      const task = tasks[taskIndex];
      task.status = false;
      const newTask = { ...task};
      const newTasks = [...tasks];
      newTasks[taskIndex] = newTask;
      console.error('Completed Task', newTasks);

      this._tasks.next(newTasks);
    } else {
      console.error('Task not found');
    }
  }

  deleteTask(id: number) {
    const tasks = this._tasks.getValue();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
      const task = tasks.splice(taskIndex, 1);
      const newTask = { ...task};
      const newTasks = [...tasks];
      newTasks[taskIndex] = newTask;
      console.error('Completed Task', newTasks);

      this._tasks.next(newTasks);
    } else {
      console.error('Task not found');
    }
  }

}
