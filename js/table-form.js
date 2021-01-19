const colFormats = [
  { value: 'text', label: 'Text' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'E-mail' },
  { value: 'number', label: 'Number' },
  { value: 'money-usd', label: 'Money-USD' },
  { value: 'money-eur', label: 'Money-EUR' },
  { value: 'datetime', label: 'Datetime' },
  { value: 'boolean', label: 'Boolean' }
];

const textAlignment = [
  { value: 'feft', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'center', label: 'Center' }
];

export class TableForm {
  
  constructor(
    title, 
    header, 
    format, 
    textAlign, 
    editable = true
  ) {
    this.title = title || 'Table Column Form';
    this.header = header || 'New Column';
    this.format = format || 'text';
    this.textAlign = textAlign || 'left';
    this.editable = editable;
  }

  initOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'table-overlay';
    this.form = document.createElement('form');
    this.form.id = 'table-form';

    let selected = (value, match) => match == value ? 'selected' : '';

    this.form.innerHTML = `
    <button class="material-icons" data-close type="button">close</button>
    <h3>${this.title}</h3>
    <div class="column-group">
      <div class="column">
        <div class="form-group">
          <label for="header">Header</label>
          <input type="text" name="header" id="header" value="${this.header}">
        </div>
        <div class="form-group">
          <label for="format">Format</label>
          <select name="format" id="format"></select>
        </div>
      </div>
      <div class="column">
        <div class="form-group">
          <label for="text-align">Text alignment</label>
          <select name="text-align" id="text-align"></select>
        </div>
        <div class="form-group">
          <label>Editable column</label>
          <div>
            <label for="yes">
              <input type="radio" name="editable" 
              id="yes" value="yes" ${this.editable ? 'checked' : ''}>
              Yes
            </label>
            <label for="no">
              <input type="radio" name="editable" 
              id="no" value="no" ${!this.editable ? 'checked' : ''}>
              No
            </label>
          </div>
        </div>
        <div class="form-group">
          <button type="submit">Apply</button>
        </div>
      </div>
    </div>`;
    
    this.headerInput = this.form.header;
    this.selectFormat = this.form.querySelector('[name="format"]');
    this.selectTextAlign = this.form.querySelector('[name="text-align"]');
    this.closeBtn = this.form.querySelector('[data-close]');

    setTimeout(() => this.headerInput.focus(), 50);
    this.selectFormat.innerHTML = colFormats.map(option => {
      return `
        <option value="${option.value}" ${selected(option.value, this.format)}>
          ${option.label}
        </option>`;
    }).join('');

    this.selectTextAlign.innerHTML = textAlignment.map(option => {
      return `
        <option value="${option.value}" ${selected(option.value, this.textAlign)}>
          ${option.label}
        </option>`;
    });
    this.overlay.append(this.form);
  }

  initEventListeners() {
    document.onkeyup = e => {
      if (e.key == 'Escape') this.hideForm();
    };
    this.closeBtn.addEventListener('click', () => this.hideForm());
  }

  onSubmit() {
    return new Promise((resolve, reject) => {
      this.form.addEventListener('submit', e => {
        e.preventDefault();

        resolve({
          header: this.form.header.value.trim(),
          format: this.form.format.value,
          textAlign: this.form['text-align'].value,
          editable: this.form.querySelector('[name="editable"]').checked
        });
        this.hideForm();
      });
    });
  }

  showForm() {
    this.initOverlay();
    this.initEventListeners();

    document.body.classList.add('active-modal');
    document.body.append(this.overlay);
  }

  hideForm() {
    this.overlay.classList.add('hide');

    this.overlay.addEventListener('animationend', () => {
      document.body.classList.remove('active-modal');
      this.overlay.remove();
    });
  }
}