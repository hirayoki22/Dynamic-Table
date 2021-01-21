import { Cell } from './table-body-cell.js';

export class TableBody {
  isEditing = false;

  constructor(columns) {
    this.columns = columns;
    this.onInit();
    return this.tbody;
  }

  onInit() {
    this.tbody = document.createElement('div');
    this.tbody.className = 'tbody';
    this.renderCells();
    this.eventHandlers();    
  }

  eventHandlers() {
    this.tbody.addEventListener('click', e => this.selectCell(e.target));
    this.tbody.addEventListener('click', e => this.onLinkClick(e));
    this.tbody.addEventListener('click', e => this.removeRow(e));
    this.tbody.addEventListener('dblclick', e => this.editCell(e.target));
  }

  // TEMP
  formatCellValue(value, format) {
    const formatting = {
      text: value,
      url: `<p data-href="${value}" title="Ctrl + Click">${value}</p>`,
      email: `<p data-href="mailto:${value}" title="Ctrl + Click">${value}</p>`,
      number: `${(+value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      'money-usd': `$${(+value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      'money-eur': `€${(+value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      datetime: new Date(value).toLocaleDateString(),
      boolean: !value ? 'NO' : 'YES'
    }
    return value == null ? '' : formatting[format];
  }
  // TEMP

  renderCells() {
    let limit = this.columns[0].cells.length;
    this.tbody.innerHTML = Array(limit).fill('<div class="row"></div>').join('');

    this.columns.forEach(col => {
      [...this.tbody.children].forEach((row, i) => {
        row.innerHTML += `
          <div
          class="cell ${col.textAlign} ${!col.editable ? 'non-editable' : ''}"
          data-col-id="${col.id}" 
          data-cell-id="${col.cells[i]?.id}"
          data-format="${col.format}">
            <span>${this.formatCellValue(col.cells[i]?.value, col.format)}</span>
          </div>`;
      });
    });

    // if (this.tableSheet.filterBy.column) {
    //   this.sortColumn(
    //     this.tableSheet.filterBy.column,
    //     this.tableSheet.filterBy.order
    //   );
    // }
  }
}