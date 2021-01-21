export class Cell {
  isEditing = false;

  constructor({id, value, format}) {
    this.id = id;
    this.value = value;
    this.format = format;

    return this.onInit();
  }

  get formattedValue() {
    const formatting = {
      text: this.value,
      url: `<p data-href="${this.value}" title="Ctrl + Click">${this.value}</p>`,
      email: `<p data-href="mailto:${this.value}" title="Ctrl + Click">${this.value}</p>`,
      number: `${(+this.value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      'money-usd': `$${(+this.value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      'money-eur': `€${(+this.value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      datetime: new Date(this.value).toLocaleDateString(),
      boolean: !this.value ? 'NO' : 'YES'
    }
    return this.value == null 
      ? '<span></span>' 
      : `<span>${formatting[this.format]}`;
  }

  onInit() {
    this.cell = document.createElement('div');
    this.input = document.createElement('input');
    this.cell.classList.add('cell');
    this.cell.setAttribute('data-format', this.format);
    this.cell.innerHTML = this.formattedValue;

    this.cell.addEventListener('dblclick', () => this.editStart());
    this.input.addEventListener('keyup', e => this.editEnd(e.key));
    return this.cell;
  }

  editStart() {
    if (this.isEditing) return;

    this.cell.classList.add('editing-cell');
    this.input.value = this.value;

    this.cell.append(this.input);
    this.input.focus();
  }

  editEnd(key) {
    const afterEnd = (revert = false) => {
      this.cell.classList.remove('editing-cell');
      this.value = !revert ? this.input.value.trim() : this.value;
      this.cell.innerHTML = this.formattedValue;
      this.input.remove();
    }

    if (key == 'Enter') {
      afterEnd();
    }

    if (key == 'Escape') {
      afterEnd(true);
    }
    console.log(this.value);
  }

}