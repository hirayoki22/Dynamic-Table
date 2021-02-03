import { Table } from './table.js';
import { Calendar } from './calendar.js';

export class TableBody {
  calendar = new Calendar();
  activeCell = { colId: null, cellId: null };
  isEditing = false;

  constructor(table = new Table) {
    this.table = table;
    this.tbody = document.createElement('div');
    this.tbody.className = 'table-body';
    this.render();
    this.eventHandlers();    
  }

  eventHandlers() {
    this.tbody.addEventListener('click', e => this.selectCell(e.target));
    this.tbody.addEventListener('click', e => this.onLinkClick(e));
    this.tbody.addEventListener('click', e => this.removeRow(e));
    this.tbody.addEventListener('dblclick', e => this.editCell(e.target));
  }

  get paginatedColumns() {
    let deepClone = JSON.parse(JSON.stringify(this.table.columns));
    let start = (this.table.currentPage - 1) * this.table.pageRowLimit;
    let end = start + this.table.pageRowLimit;

    return deepClone.map(col => {
      col.cells = col.cells.slice(start, end);
      return col;
    });
  }

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

  parseCellValue(value, format) {
    let parsed = {
      text: value,
      url: value,
      email: value,
      number: +value,
      'money-usd': +value,
      'money-eur': +value,
      datetime: new Date(value),
      boolean: value.toUpperCase() == 'NO' ? false : true
    }
    return !value ? null : parsed[format];
  }

  render() {
    this.tbody.innerHTML = Array(this.paginatedColumns[0].cells.length)
      .fill('<div class="row"></div>').join('');

    this.paginatedColumns.forEach(col => {
      [...this.tbody.children].forEach((row, i) => {
        row.innerHTML += `
          <div
          class="cell"
          data-alignment="${col.alignment}"
          data-col-id="${col.id}" 
          data-cell-id="${col.cells[i]?.id}"
          data-format="${col.format}"
          ${!col.editable ? 'data-locked' : ''}>
            <span class="cell-value">
              ${this.formatCellValue(col.cells[i]?.value, col.format)}
            </span>
          </div>`;
      });
    });

    if (this.table.filterCol) {
      this.table.tableHeader.sortColumn(
        this.table.filterCol,
        this.table.filterOrder,
        this.tbody
      );
    }
  }

  onLinkClick(e) {
    if (e.target.closest('.cell[data-format="email"]') ||
      e.target.closest('.cell[data-format="url"]')
    ) {
      if (e.ctrlKey && !e.shiftKey) {
        let link =  document.createElement('a');
        let target = (e.target.closest('[data-format="email"]') ||
        e.target.closest('[data-format="url"]')).querySelector('p');
        link.href = target.dataset.href;
        link.target = '_blank';
        link.style.display = 'none';
        
        document.body.append(link);
        link.click();
        link.remove();
      }
    }
  }

  selectCell(target, lastSelected = false) {
    target = target?.closest('.cell');

    if (!target && !lastSelected) return;

    if (lastSelected) {
      if (!this.activeCell.colId) return;

      let { colId, cellId } = this.activeCell;
      target = this.table.tableBody.tbody
        .querySelector(`[data-col-id="${colId}"][data-cell-id="${cellId}"]`);
    }
    
    this.cellSelected = true;
    this.rows = [...this.tbody.children];
    this.cells = [...this.tbody.querySelectorAll('.cell')];
    this.rowsLength = this.tbody.childElementCount;
    this.cellsLength = this.rows[0].childElementCount;
    this.rowIndex = [...this.tbody.children].indexOf(target.parentNode);
    this.cellIndex = [...this.rows[this.rowIndex].children].indexOf(target);

    this.cells.forEach(cell => cell.removeAttribute('data-selected'));
    target.setAttribute('data-selected', '');

    this.activeCell = {
      colId: target.dataset.colId,
      cellId: target.dataset.cellId,
    }

    // Prevent insta type on cells on blur
    document.onkeydown = e => {
      if ((e.target !== document.body)) return;
      this.selectedCellKeydown(e);
    }
  }

  selectedCellKeydown(e) {
    if (this.isEditing || !this.cellSelected) return;

    this.cells.forEach(cell => cell.removeAttribute('data-selected'));

    switch (e.key) {
      case 'ArrowUp':
        if (e.ctrlKey) {
          this.rowIndex = 0;
        } else {
          this.rowIndex > 0 ? this.rowIndex -= 1 : this.rowsLength - 1;
        }
        break;
      case 'ArrowDown':
        if (e.ctrlKey) {
          this.rowIndex = this.rowsLength - 1;
        } else {
          this.rowIndex < this.rowsLength - 1 ? this.rowIndex += 1 : 0;
        }
        break;
      case 'ArrowLeft':
        if (e.ctrlKey) {
          this.cellIndex = 0;
        } else {
          this.cellIndex > 0 ? this.cellIndex -= 1 : this.cellsLength - 1;
        }
        break;
      case 'ArrowRight':      
        if (e.ctrlKey) {
          this.cellIndex = this.cellsLength - 1;
        } else {
          this.cellIndex < this.cellsLength - 1 ? this.cellIndex += 1 : 0;
        }
        break;
      case 'F2':
        this.editCell(this.rows[this.rowIndex].children[this.cellIndex]);
        break;
      case 'Enter':
        // Delay the event to prevent event overlap
        // Still has issues tho xD
        setTimeout(() => {
          this.editCell(this.rows[this.rowIndex].children[this.cellIndex]);
        }, 100);
        break;
      case 'Delete':
        this.clearCell(this.rows[this.rowIndex].children[this.cellIndex]);
        break;
    }

    if (/^(\w|\W|\s)$/.test(e.key) && !e.ctrlKey) {
      this.editCell(this.rows[this.rowIndex].children[this.cellIndex], true);
    }
    else if (e.ctrlKey && (e.key == 'z' || e.key == 'y')) {
      this.table.undoChanges(e);
    } 
    
    let target = this.rows[this.rowIndex].children[this.cellIndex];
    target.setAttribute('data-selected', '');

    this.activeCell = {
      colId: target.dataset.colId,
      cellId: target.dataset.cellId,
    }
  }

  editCell(target, replace = false) {
    if (this.isEditing) return;

    target = target.closest('.cell');
    let column = this.table.columns.find(col => {
      return col.id == target.dataset.colId;
    });
    
    if (!column.editable) return;
    
    this.isEditing = true;
    let cell = column.cells.find(val => val.id == +target.dataset.cellId);
    let editingCell = document.createElement('div');
    let input = document.createElement('input');
    editingCell.className = 'editable-cell';
    input.className = 'cell-input';
    editingCell.append(input);
    target.append(editingCell);

    if (!replace) {
      input.value = (column.format.includes('money') ||
        (column.format == 'number'))
        ? cell.value : target.textContent.trim();
    }

    editingCell.style.width = `${input.scrollWidth}px`;
    input.focus();

    const editEnd = (revert = false) => {
      cell.value = !revert 
        ? this.parseCellValue(input.value.trim(), column.format) 
        : cell.value;
      target.innerHTML = `
        <span class="cell-value">
          ${this.formatCellValue(cell.value, column.format)}
        </span>`;

      this.table.saveToLocalStorage();
      this.isEditing = false;
    }

    const selectNextCell = () => {
      let index = [...target.parentNode.children].indexOf(target);
      let row = target.parentNode.nextElementSibling;
      this.selectCell(row?.children[index]);
    }

    if (column.format == 'datetime') {
      editingCell.append(this.calendar.initCalendar(cell.value));
      this.calendar.onClick()
        .then(date => {
          input.value = date;
          editEnd();
          this.table.cache.updateValue({
            columns: this.table.columns,
            origin: { column: column.id, cell: cell.id }
          });
      });
    }

    input.addEventListener('keydown', e => {
      if (e.key == 'Enter') {
        selectNextCell();
        editEnd();
        this.table.cache.updateValue({
          columns: this.table.columns,
          origin: { column: column.id, cell: cell.id }
        });
      }
      else if (e.key == 'Escape') editEnd(true);
    });

    document.onclick = e => {
      if (e.target.closest('.cell') && (e.target.closest('.cell') !== target)) {
        editEnd();
        document.onclick = null;
      }
    }
  }

  clearCell(target) {
    let column = this.table.columns.find(col => col.id == target.dataset.colId);
    
    if (!column.editable) return;

    let cell = column.cells.find(val => val.id == +target.dataset.cellId);

    target.innerHTML = '';
    cell.value = null;
    this.table.saveToLocalStorage();
  }

  addRow() {  
    let interval = setInterval(() => {
      let totalRenderedRows = this.paginatedColumns[0].cells.length;
       if (totalRenderedRows < this.table.pageRowLimit) {
        clearInterval(interval);
        
        this.table.columns.forEach(col => {
          col.cells.push({ id: col.cells.length + 1, value: null });
        });
        this.table.tableBody.render();
        this.table.renderRecordCount();
        this.table.renderPaginationBtns();
        this.table.saveToLocalStorage();

        this.table.cache.updateValue({
          columns: this.table.columns,
          origin: null
        });
      } else {
        this.table.currentPage++;
      }
    });
  }

  removeRow(e) {
    if (this.table.columns[0].cells.length == 1) return;

    if (e.target.closest('.row') && e.ctrlKey && e.shiftKey) {
      let row = e.target.closest('.row');
      let rowId = +row.children[0].dataset.cellId;
      row.setAttribute('data-active', '');

      this.table.popup.title = 'Remove row?'
      this.table.popup.showPopup();
      this.table.popup.onActionClick()
        .then(proceed => {
          if (!proceed) {
            row.removeAttribute('data-active');
          } else {
            this.table.columns.forEach(col => {
              col.cells = col.cells.filter(cell => cell.id !== rowId);
            });
            row.remove();
            
            if (!this.paginatedColumns[0].cells.length) {
              this.table.currentPage--;
            }
            this.render();
            this.table.renderRecordCount();
            this.table.renderPaginationBtns();
            this.table.saveToLocalStorage();

            this.table.cache.updateValue({
              columns: this.table.columns,
              origin: null
            });
          }
        });
    }
  }
}