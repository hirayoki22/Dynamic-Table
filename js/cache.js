export class Cache {
  history = [];
  index = 0;

  constructor(initialValue) {
    this.history.push(JSON.parse(JSON.stringify(initialValue)));
  }

  get value() {
    return this.history[this.index];
  }

  viewHistory() {
    return this.history;
  }

  updateValue(value) {
    if (this.index < this.history.length - 1) {
      this.history = this.history.slice(0, this.index + 1);
    }
    this.history.push(JSON.parse(JSON.stringify(value)));
    this.index++;
  }

  undo() {
    this.index > 0 ? this.index -= 1 : 0;
  }

  redo() {
    this.index < this.history.length - 1 
      ? this.index += 1 : this.history.length - 1;
  }
}