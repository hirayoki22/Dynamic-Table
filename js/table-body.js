import { Cell } from './table-body-cell.js';
import { Table } from './table.js';

export class TableBody {
  isEditing = false;
  cells = {};

  constructor(table = new Table) {
    this.columns = table.paginatedColumns;
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
    // this.tbody.addEventListener('click', e => this.onLinkClick(e));
    // this.tbody.addEventListener('click', e => this.removeRow(e));
    this.tbody.addEventListener('dblclick', e => this.editCell(e.target));
  }

  get totalRows() {
    return this.columns[0].cells.length;
  }

  renderCells() {
    this.tbody.innerHTML = Array(this.totalRows).fill('<div class="row"></div>').join('');
    this.rows = [...this.tbody.children];

    this.columns.forEach(col => {
      this.rows.forEach((row, i) => {
        let cell = new Cell({
          colId: col.id,
          format: col.format,
          editable: col.editable,
          alignment: col.alignment,
          cellId: col.cells[i].id,
          value: col.cells[i].value
        });
        row.append(cell.cell);
        // this.cells.push(cell);
        this.cells[`${col.id}-${col.cells[i].id}`] = cell;
      });
    });


    // if (this.tableSheet.filterBy.column) {
    //   this.sortColumn(
    //     this.tableSheet.filterBy.column,
    //     this.tableSheet.filterBy.order
    //   );
    // }
  }

  editCell(target, replace = false) {
    if (this.isEditing) return;

    // target = target.closest('.cell');
    this.isEditing = true;

    let uid = target.closest('.cell').dataset.uid;
    let cell = this.cells[uid];
    
    if (!cell.editable) return;

    let editingCell = document.createElement('div');
    let input = document.createElement('input');

    editingCell.className = 'editable-cell';
    input.className = 'cell-input';
    editingCell.append(input);
    cell.cell.append(editingCell);

    if (!replace) {
      input.value = (cell.format == 'datetime' || cell.format == 'boolean')
        ? cell.formattedValue : cell.parsedValue;
    }

    editingCell.style.width = `${input.scrollWidth}px`;
    input.focus();

    const editEnd = (revert = false) => {
      // !revert ? cell.value = input.value : cell.value;
      
      if (!revert) {
        cell.value = input.value.trim();
        cell.innerHTML = cell.formattedValue;

        console.log(cell.parsedValue);
      }

      editingCell.remove();

      // this.saveToLocalStorage();
      this.isEditing = false;
    }

    input.addEventListener('keydown', e => {
      if (e.key == 'Enter') {
        // selectNextCell();
        editEnd();
        // this.cache.updateValue({
        //   columns: this.columns,
        //   origin: { column: column.id, cell: cell.id }
        // });
      }
      else if (e.key == 'Escape') {
        editEnd(true);
      };
    });



    // let column = this.columns.find(col => col.id == +target.dataset.colId);
    
    // if (!column.editable) return;
    
    // this.isEditing = true;
    // let cell = column.cells.find(val => val.id == +target.dataset.cellId);
    // let editingCell = document.createElement('div');
    // let input = document.createElement('input');
    // editingCell.className = 'editing-cell';
    // input.setAttribute('data-edit-input', '');
    // editingCell.append(input);
    // target.append(editingCell);

    // if (!replace) {
    //   input.value = (column.format.includes('money') ||
    //     (column.format == 'number'))
    //     ? cell.value : target.textContent.trim();
    // }

    // editingCell.style.width = `${input.scrollWidth}px`;
    // input.focus();

    // const editEnd = (revert = false) => {
    //   cell.value = !revert 
    //     ? this.parseCellValue(input.value.trim(), column.format) 
    //     : cell.value;
    //   target.innerHTML = `
    //     <span>${this.formatCellValue(cell.value, column.format)}</span>`;

    //   this.saveToLocalStorage();
    //   this.isEditing = false;
    // }

    // const selectNextCell = () => {
    //   let index = [...target.parentNode.children].indexOf(target);
    //   let row = target.parentNode.nextElementSibling;
    //   this.selectCell(row?.children[index]);
    // }

    // if (column.format == 'datetime') {
    //   editingCell.append(this.calendar.initCalendar(cell.value));
    //   this.calendar.onClick()
    //   .then(date => {
    //     input.value = date;
    //     editEnd();
    //     this.cache.updateValue({
    //       columns: this.columns,
    //       origin: { column: column.id, cell: cell.id }
    //     });
    //   });
    // }

    // input.addEventListener('keydown', e => {
    //   if (e.key == 'Enter') {
    //     selectNextCell();
    //     editEnd();
    //     this.cache.updateValue({
    //       columns: this.columns,
    //       origin: { column: column.id, cell: cell.id }
    //     });
    //   }
    //   else if (e.key == 'Escape') editEnd(true);
    // });

    // document.onclick = e => {
    //   if (e.target.closest('.cell') && (e.target.closest('.cell') !== target)) {
    //     editEnd(true);
    //     document.onclick = null;
    //   }
    // }
  }

  selectCell(target) {
    target = target?.closest('.cell');

    if (!target) return;

    this.cellSelected = target?.closest('.cell');
    this.unselected = [...this.tbody.querySelectorAll('.cell')];
    this.cellsLength = this.rows[0].childElementCount;
    this.rowIndex = [...this.tbody.children].indexOf(target.parentNode);
    this.cellIndex = [...this.rows[this.rowIndex].children].indexOf(target);

    this.unselected.forEach(cell => cell.removeAttribute('selected'));
    this.cellSelected.setAttribute('selected', '');

    // Prevent insta type on cells on blur
    document.onkeydown = e => {
      if ((e.target !== document.body)) return;
      this.selectedCellKeydown(e);
    }
  }

  selectedCellKeydown(e) {
    if (this.isEditing || !this.cellSelected) return;

    this.unselected.forEach(cell => cell.removeAttribute('selected'));

    switch (e.key) {
      case 'ArrowUp':
        if (e.ctrlKey) {
          this.rowIndex = 0;
        } else {
          this.rowIndex > 0 ? this.rowIndex -= 1 : this.totalRows - 1;
        }
        break;
      case 'ArrowDown':
        if (e.ctrlKey) {
          this.rowIndex = this.totalRows - 1;
        } else {
          this.rowIndex < this.totalRows - 1 ? this.rowIndex += 1 : 0;
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
        // this.editCell(this.rows[this.rowIndex].children[this.cellIndex]);
        break;
      case 'Enter':
        // Delay the event to prevent event overlap
        // Still has issues tho xD
        setTimeout(() => {
          // this.editCell(this.rows[this.rowIndex].children[this.cellIndex]);
        }, 100);
        break;
      case 'Delete':
        // this.clearCell(this.rows[this.rowIndex].children[this.cellIndex]);
        break;
    }

    // Special actions
    // if (/^(\w|\W|\s)$/.test(e.key) && !e.ctrlKey) {
    //   this.editCell(this.rows[this.rowIndex].children[this.cellIndex], true);
    // }
    // else if (e.ctrlKey && (e.key == 'z' || e.key == 'y')) {
    //   this.undoChanges(e);
    // } 

    let nextCell = this.rows[this.rowIndex].children[this.cellIndex];
    nextCell.setAttribute('selected', '');
  }
}