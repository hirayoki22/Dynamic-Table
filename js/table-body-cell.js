export class Cell {
  isEditing = false;

  constructor({
    colId,
    format,
    editable,
    alignment,
    cellId,
    value
  }) {
    this.colId = colId;
    this.format = format;
    this.editable = editable;
    this.alignment = alignment;
    this.cellId = cellId;
    this.value = value;
    this.onInit();
  }

  get formattedValue() {
    const formats = {
      text: this.value,
      url: `<p data-href="${this.value}" title="Ctrl + Click">${this.value}</p>`,
      email: `<p data-href="mailto:${this.value}" title="Ctrl + Click">${this.value}</p>`,
      number: `${(+this.value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      'money-usd': `$${(+this.value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      'money-eur': `€${(+this.value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      datetime: new Date(this.value).toLocaleDateString(),
      boolean: !this.value ? 'NO' : 'YES'
    }
    return this.value == null ? '' : formats[this.format];
  }

  get parsedValue() {
    let parsed = {
      text: this.value,
      url: this.value,
      email: this.value,
      number: +this.value,
      'money-usd': +this.value,
      'money-eur': +this.value,
      datetime: new Date(this.value),
      boolean: this.value.toUpperCase() == 'NO' ? false : true
    }
    return !this.value ? null : parsed[this.format];
  }

  onInit() {
    this.cell = document.createElement('div');
    this.cell.classList.add('cell');
    this.cell.setAttribute('data-uid', `${this.colId}-${this.cellId}`);
    this.cell.setAttribute('data-col-id', this.colId);
    this.cell.setAttribute('data-cell-id', this.cellId);
    this.cell.setAttribute('data-format', this.format);
    this.cell.setAttribute('data-alignment', this.alignment);
    !this.editable ? this.cell.setAttribute('data-locked', '') : false;
    this.cell.innerHTML = `<span class="cell-value">${this.formattedValue}</span>`;

    this.cell.addEventListener('click', e => this.onLinkClick(e.ctrlKey));
  }

  onLinkClick(ctrlKeyPressed) {
    if (this.format !== 'email' && this.format !== 'url') return;

    if (ctrlKeyPressed) {
      let link =  document.createElement('a');
      link.href = this.cell.querySelector('p').dataset.href;
      link.target = '_blank';
      link.style.display = 'none';
      
      document.body.append(link);
      link.click();
      link.remove();
    }
  }

}