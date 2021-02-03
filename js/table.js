import { SheetModel } from './table-sheet.model.js';
import { TableForm } from './table-form.js';
import { TableBody } from './table-body.js';
import { Calendar } from './calendar.js';
import { Cache } from './cache.js';
import { Popup } from './popup.js';

export class Table {
  tableForm = new TableForm();
  calendar = new Calendar();
  popup = new Popup({});
  isEditing = false;

  constructor(tableSheet) {
    this.getTable(tableSheet);
    this.renderTable();
    this.adjustTableTitleWidth();
    this.renderHeaders();
    // this.renderCells();
    this.renderRecordCount();
    this.renderPaginationBtns();
    this.eventHandlers();
  }

  get columns() {
    return this.tableSheet.columns;
  }

  set columns(newValue) {
    this.tableSheet.columns = newValue;
  }

  get pageRowLimit() {
    return this.tableSheet.preferences.pageRowLimit;
  }

  set pageRowLimit(newValue) {
    this.tableSheet.preferences.pageRowLimit = newValue;
  }

  get totalRows() {
    return this.columns[0].cells.length;
  }

  get paginatedColumns() {
    let deepClone = JSON.parse(JSON.stringify(this.columns));
    let start = (this.currentPage - 1) * this.pageRowLimit;
    let end = start + this.pageRowLimit;

    return deepClone.map(col => {
      col.cells = col.cells.slice(start, end);
      return col;
    });
  }

  get totalRowPages() {
    return Math.ceil(this.totalRows / this.pageRowLimit);
  }

  get currentPage() {
    return this.tableSheet.currentPage;
  }

  set currentPage(newValue) {
    this.tableSheet.currentPage = newValue;
  }
  
  getTable(tableSheet) {
    if (localStorage.getItem('dynamic-table')) {
      this.tableSheet = JSON.parse(localStorage.getItem('dynamic-table'));
      console.log('-- Table initialized from Local Storage --');
    }
    else if (tableSheet) {
      this.tableSheet = tableSheet;
    }
    else {
      this.tableSheet = SheetModel;
    }
    this.cache = new Cache(this.columns);
    this.saveToLocalStorage();
  }

  eventHandlers() {
    this.titleInput.addEventListener('change', () => this.onTitleChange());
    this.actionsButtons.addEventListener('click', e => this.onActionClick(e))
    // this.tbody.addEventListener('click', e => this.selectCell(e.target));
    // this.tbody.addEventListener('click', e => this.onLinkClick(e));
    // this.tbody.addEventListener('click', e => this.removeRow(e));
    // this.tbody.addEventListener('dblclick', e => this.editCell(e.target));
    this.thead.addEventListener('contextmenu', e => this.columnOptionsMenu(e));
    this.thead.addEventListener('click', e => this.onSortbtnClick(e));
    this.thead.addEventListener('mousedown', e => this.onMouseDown(e));
    this.paginationArea.addEventListener('click', e => this.onPageNavClick(e.target));
  }

  saveToLocalStorage() {
    this.tableSheet.lastModified = new Date();
    localStorage.setItem('dynamic-table', JSON.stringify(this.tableSheet));
  }

  renderTable() {
    this.table = document.createElement('section');
    this.thead = document.createElement('div');
    this.tbody = document.createElement('div');
    this.table.className = 'table';
    this.thead.className = 'thead';
    // this.tbody.className = 'tbody';
    /* START */
    this.tbody = new TableBody(this);
    /* END */
    this.container = document.querySelector('.app-container');
    this.titleInput = document.querySelector('.sheet-title');
    this.bottomContent = this.container.querySelector('.bottom-content');
    this.actionsButtons = this.container.querySelector('.action-buttons');
    this.addColButton = this.container.querySelector('[data-add-column]');
    this.addRowButton = this.container.querySelector('[data-add-row]');
    this.logButton = this.container.querySelector('[data-records]');
    this.paginationArea = document.createElement('section');

    this.titleInput.value = this.tableSheet.title;
    this.table.style.height = `calc(32px + 25px * ${this.pageRowLimit})`;
    this.table.append(this.thead, this.tbody);
    this.container.insertBefore(this.table, this.bottomContent);
  }

  renderHeaders() {
    let filterCol = this.tableSheet.filterBy.column;
    let order = this.tableSheet.filterBy.order;

    this.thead.innerHTML = this.columns.map(col => {
      return `
        <div class="header" data-col-id="${col.id}">
          <span>${col.header}</span>
          <button class="filter-btn ${filterCol == col.id ? 'active' : ''}">
            <i class="fas fa-sort-amount-${order == 'ASC' ? 'down-alt' : 'up'}" 
              title="${order == 'ASC' ? 'A-Z' : 'Z-A'}"></i>
          </button>          
          <ul class="options-menu">
            <li data-action="modify">Modify Column</li>
            <li data-action="sort-asc">Sort Table A-Z</li>
            <li data-action="sort-desc">Sort Table Z-A</li>
            <li data-action="clear">Clear Column</li>
            <li data-action="remove">Remove Column</li>
          </ul>
        </div>`;
    }).join('');
  }

  // renderCells() {
  //   let limit = this.paginatedColumns[0].cells.length;
  //   this.tbody.innerHTML = Array(limit).fill('<div class="row"></div>').join('');

  //   this.paginatedColumns.forEach(col => {
  //     [...this.tbody.children].forEach((row, i) => {
  //       row.innerHTML += `
  //         <div
  //         class="cell ${col.alignment} ${!col.editable ? 'non-editable' : ''}"
  //         data-col-id="${col.id}" 
  //         data-cell-id="${col.cells[i]?.id}"
  //         data-format="${col.format}">
  //           <span>${this.formatCellValue(col.cells[i]?.value, col.format)}</span>
  //         </div>`;
  //     });
  //   });

  //   if (this.tableSheet.filterBy.column) {
  //     this.sortColumn(
  //       this.tableSheet.filterBy.column,
  //       this.tableSheet.filterBy.order
  //     );
  //   }
  // }

  renderRecordCount() {
    this.count = document.createElement('span');
    this.count.id = 'record-count';
    this.count.innerHTML = `Total Records: <strong data-ouput>${this.totalRows}</strong>`;
    
    if (!this.bottomContent.hasChildNodes(this.count)) {
      this.bottomContent.prepend(this.count);
    } else {
      this.bottomContent.querySelector('[data-ouput]').textContent = this.totalRows;
    }
  }

  renderPaginationBtns() {
    let btnArr = [...Array(this.totalRowPages).keys()].map(a => a + 1);
    let start = (this.currentPage - 3) < 0 ? 0 : this.currentPage - 3; 
    
    this.paginationArea.className = 'pagination-wrapper';
    this.paginationArea.innerHTML = `
    <button class="material-icons" aria-label="previous button" 
      data-prev title="Previous">arrow_back_ios</button>
    <div class="page-btn-wrapper"></div>
    <button class="material-icons" aria-label="previous button" 
      data-next title="Next">arrow_forward_ios</button>`;

    let pagebtnWrap = this.paginationArea.querySelector('.page-btn-wrapper');
    
    pagebtnWrap.innerHTML = btnArr.slice(start, start + 3)
      .map(i => `<button data-page="${i}">${i}</button>`).join('');

    this.prevBtn = this.paginationArea.querySelector('[data-prev]');
    this.nextBtn = this.paginationArea.querySelector('[data-next]');
    this.pageBtns = [...this.paginationArea.querySelectorAll('[data-page]')];
    this.setPaginationButtonsState();

    this.container.querySelector('.bottom-content').append(this.paginationArea);
  }

  setPaginationButtonsState() {
    this.prevBtn.disabled = this.currentPage == 1;
    this.nextBtn.disabled = this.currentPage == this.totalRowPages;
    this.pageBtns.forEach(btn => btn.classList.remove('active'));
    this.pageBtns.find(btn => +btn.dataset.page == this.currentPage)
      .classList.add('active');
  }

  // formatCellValue(value, format) {
  //   const formatting = {
  //     text: value,
  //     url: `<p data-href="${value}" title="Ctrl + Click">${value}</p>`,
  //     email: `<p data-href="mailto:${value}" title="Ctrl + Click">${value}</p>`,
  //     number: `${(+value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
  //     'money-usd': `$${(+value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
  //     'money-eur': `€${(+value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
  //     datetime: new Date(value).toLocaleDateString(),
  //     boolean: !value ? 'NO' : 'YES'
  //   }
  //   return value == null ? '' : formatting[format];
  // }

  // parseCellValue(value, format) {
  //   let parsed = {
  //     text: value,
  //     url: value,
  //     email: value,
  //     number: +value,
  //     'money-usd': +value,
  //     'money-eur': +value,
  //     datetime: new Date(value),
  //     boolean: value.toUpperCase() == 'NO' ? false : true
  //   }
  //   return !value ? null : parsed[format];
  // }

  adjustTableTitleWidth() {
    this.titleInput.style.width = `${this.titleInput.scrollWidth}px`;
  }

  onTitleChange() {
    this.tableSheet.title = this.titleInput.value;
    this.titleInput.blur();
    this.adjustTableTitleWidth();
    this.saveToLocalStorage();
  }

  onActionClick(e) {
    if (!e.target.hasAttribute('data-action')) return;

    let action = e.target.dataset.action;
    let actions = {
      'add-column': () => this.addColumn(),
      'add-row': () => this.addRow(),
      'records': () => this.exportRecord()
    }
    actions[action]();
  }

  columnOptionsMenu(e) {
    e.preventDefault();

    if (e.target.closest('.header')) {
      let header = e.target.closest('.header');
      let activeMenu = header.lastElementChild;

      const resetMenuStatus = () => {
        let allMenus = [...this.thead.querySelectorAll('.options-menu')];
        allMenus.forEach(menu => menu.removeAttribute('active'));
        document.onclick = null;
        activeMenu.onclick = null;
      }

      if (activeMenu.hasAttribute('active')) {
        activeMenu.removeAttribute('active');
        return;
      }
      
      resetMenuStatus();
      activeMenu.setAttribute('active', '');
      
      document.onclick = () => resetMenuStatus();

      document.onkeyup = e => {
        if (e.key == 'Escape') resetMenuStatus();
        document.onkeyup = null;
      }
    
      activeMenu.onclick = e => {
        this.columnMenuHandlers(e);
        activeMenu.onclick = null;
      }
    }
  }

  columnMenuHandlers(e) {
    if (e.target.closest('[data-action]')) {
      let button = e.target.closest('[data-action]');
      let colId = +button.closest('.header').dataset.colId;
      let action = button.dataset.action;
      let actions = {
        modify: () => this.editColumn(colId),
        'sort-asc': () => this.sortColumn(colId, 'ASC'),
        'sort-desc': () => this.sortColumn(colId, 'DESC'),
        clear: () => this.clearColumn(colId),
        remove: () => this.removeColumn(colId)
      }
      actions[action]();      
    }
  }

  onSortbtnClick(e) {
    if (e.target.closest('.filter-btn')) {
      let colId = +e.target.closest('.header').dataset.colId;
      let order = this.tableSheet.filterBy.order == 'ASC' ? 'DESC' : 'ASC';
      
      this.sortColumn(colId, order);
    }
  }

  onMouseDown(e) {
    if ((!e.target.classList.contains('header') && 
      e.target.tagName !== 'SPAN') || e.button == 2) {
      return;
    }

    let header = e.target.closest('.header');
    let placeholder = document.createElement('div');
    let shiftX = e.clientX - header.offsetLeft;
    let isDraggingStarted = false;

    const mouseMoveHandler = e => {
      let prevHeader = header.previousElementSibling;
      let nextHeader = placeholder.nextElementSibling;
      let posX = e.clientX - shiftX;
      let widthDiff = this.thead.clientWidth - header.clientWidth;
      let left = (posX > widthDiff) ? widthDiff : (posX < 0) ? 0 : posX;
    
      header.setAttribute('dragging', '');
      placeholder.classList.add('placeholder');
      header.style.left = `${left}px`; 

      if (!isDraggingStarted) {
        isDraggingStarted = true;
        this.thead.insertBefore(placeholder, header.nextSibling);
      }
      
      if (prevHeader && isAbove(header, prevHeader)) {
        swap(placeholder, header);
        swap(placeholder, prevHeader);
      }
    
      if (nextHeader && isAbove(nextHeader, header)) {
        swap(nextHeader, placeholder);
        swap(nextHeader, header);
      }
    };

    const swap = (nodeA, nodeB) => {
      let siblingA = nodeA.nextSibling == nodeB ? nodeA : nodeA.nextSibling;

      this.thead.insertBefore(nodeA, nodeB);
      this.thead.insertBefore(nodeB, siblingA);
    };
    
    const isAbove = (nodeA, nodeB) => {
      let rectA = nodeA.getBoundingClientRect();
      let rectB = nodeB.getBoundingClientRect();
    
      return (rectA.left + rectA.width / 2 < rectB.left + rectB.width);
    };

    const saveNewOrder = () => {
      [...this.thead.children].forEach((header, i) => {
        let column = this.columns.find(col => col.id === +header.dataset.colId);
        column.order = i + 1;
      });

      this.columns.sort((a, b) => a.order - b.order);
      this.renderCells();
      this.saveToLocalStorage();
    }

    const mouseUpHandler = () => {
      /** Without accounting for animations */
      document.onmousemove = null;
      document.onmouseup = null;
      placeholder?.remove();
      header.removeAttribute('style');
      header.removeAttribute('dragging');
      saveNewOrder();      
    };

    document.onmousemove = e => mouseMoveHandler(e);
    document.onmouseup = () => mouseUpHandler();
  }

  // onLinkClick(e) {
  //   if (e.target.closest('.cell[data-format="email"]') ||
  //     e.target.closest('.cell[data-format="url"]')
  //   ) {
  //     if (e.ctrlKey) {
  //       let link =  document.createElement('a');
  //       let target = (e.target.closest('.cell[data-format="email"]') ||
  //       e.target.closest('.cell[data-format="url"]')).querySelector('p');
  //       link.href = target.dataset.href;
  //       link.target = '_blank';
  //       link.style.display = 'none';
        
  //       document.body.append(link);
  //       link.click();
  //       link.remove();
  //     }
  //   }
  // }

  // selectCell(target) {
  //   target = target?.closest('.cell');

  //   if (!target) return;

  //   this.cellSelected = true;
  //   this.rows = [...this.tbody.children];
  //   this.cells = [...this.tbody.querySelectorAll('.cell')];
  //   this.rowsLength = this.tbody.childElementCount;
  //   this.cellsLength = this.rows[0].childElementCount;
  //   this.rowIndex = [...this.tbody.children].indexOf(target.parentNode);
  //   this.cellIndex = [...this.rows[this.rowIndex].children].indexOf(target);

  //   this.cells.forEach(cell => cell.classList.remove('selected'));
  //   target.classList.add('selected');

  //   // Prevent insta type on cells on blur
  //   document.onkeydown = e => {
  //     if ((e.target !== document.body)) return;
  //     this.selectedCellKeydown(e);
  //   }
  // }

  // selectedCellKeydown(e) {
  //   if (this.isEditing || !this.cellSelected) return;

  //   this.cells.forEach(cell => cell.classList.remove('selected'));

  //   switch (e.key) {
  //     case 'ArrowUp':
  //       if (e.ctrlKey) {
  //         this.rowIndex = 0;
  //       } else {
  //         this.rowIndex > 0 ? this.rowIndex -= 1 : this.rowsLength - 1;
  //       }
  //       break;
  //     case 'ArrowDown':
  //       if (e.ctrlKey) {
  //         this.rowIndex = this.rowsLength - 1;
  //       } else {
  //         this.rowIndex < this.rowsLength - 1 ? this.rowIndex += 1 : 0;
  //       }
  //       break;
  //     case 'ArrowLeft':
  //       if (e.ctrlKey) {
  //         this.cellIndex = 0;
  //       } else {
  //         this.cellIndex > 0 ? this.cellIndex -= 1 : this.cellsLength - 1;
  //       }
  //       break;
  //     case 'ArrowRight':      
  //       if (e.ctrlKey) {
  //         this.cellIndex = this.cellsLength - 1;
  //       } else {
  //         this.cellIndex < this.cellsLength - 1 ? this.cellIndex += 1 : 0;
  //       }
  //       break;
  //     case 'F2':
  //       this.editCell(this.rows[this.rowIndex].children[this.cellIndex]);
  //       break;
  //     case 'Enter':
  //       // Delay the event to prevent event overlap
  //       // Still has issues tho xD
  //       setTimeout(() => {
  //         this.editCell(this.rows[this.rowIndex].children[this.cellIndex]);
  //       }, 100);
  //       break;
  //     case 'Delete':
  //       this.clearCell(this.rows[this.rowIndex].children[this.cellIndex]);
  //       break;
  //   }

  //   // Special actions
  //   if (/^(\w|\W|\s)$/.test(e.key) && !e.ctrlKey) {
  //     this.editCell(this.rows[this.rowIndex].children[this.cellIndex], true);
  //   }
  //   else if (e.ctrlKey && (e.key == 'z' || e.key == 'y')) {
  //     this.undoChanges(e);
  //   } 
  //   this.rows[this.rowIndex].children[this.cellIndex].classList.add('selected');
  // }

  undoChanges(e) {
    // This is still not perfect lol
    const browseHistory = action => {
      let col = 0;
      let cell = 0
      let tCell = null;
      let isUnchanged = JSON.stringify(this.columns) == 
        JSON.stringify(this.cache.value.columns);

      if (isUnchanged) return;

      this.columns = this.cache.value.columns;

      switch (action) {
        case 'undo':
          let nextIndex = this.cache.history.indexOf(this.cache.value) + 1;
          let nextValue = this.cache.history[nextIndex];

          col = nextValue.origin?.column;
          cell = nextValue.origin?.cell;
          break;
      
        case 'redo':
          col = this.cache.value.origin?.column;
          cell = this.cache.value.origin?.cell;
          break;
      }

      this.renderHeaders();
      this.renderCells();
      this.saveToLocalStorage();

      tCell = this.tbody.querySelector(`[data-col-id="${col}"][data-cell-id="${cell}"]`);
      this.selectCell(tCell);
    }

    if (e.key == 'z') {
      this.cache.undo();
      browseHistory('undo');
    }

    if (e.key == 'y') {
      this.cache.redo();
      browseHistory('redo');
    }
  }

  // editCell(target, replace = false) {
  //   if (this.isEditing) return;

  //   target = target.closest('.cell');
  //   let column = this.columns.find(col => col.id == +target.dataset.colId);
    
  //   if (!column.editable) return;
    
  //   this.isEditing = true;
  //   let cell = column.cells.find(val => val.id == +target.dataset.cellId);
  //   let editingCell = document.createElement('div');
  //   let input = document.createElement('input');
  //   editingCell.className = 'editable-cell';
  //   input.className = 'cell-input';
  //   editingCell.append(input);
  //   target.append(editingCell);

  //   if (!replace) {
  //     input.value = (column.format.includes('money') ||
  //       (column.format == 'number'))
  //       ? cell.value : target.textContent.trim();
  //   }

  //   editingCell.style.width = `${input.scrollWidth}px`;
  //   input.focus();

  //   const editEnd = (revert = false) => {
  //     cell.value = !revert 
  //       ? this.parseCellValue(input.value.trim(), column.format) 
  //       : cell.value;
  //     target.innerHTML = `
  //       <span>${this.formatCellValue(cell.value, column.format)}</span>`;

  //     this.saveToLocalStorage();
  //     this.isEditing = false;
  //   }

  //   const selectNextCell = () => {
  //     let index = [...target.parentNode.children].indexOf(target);
  //     let row = target.parentNode.nextElementSibling;
  //     this.selectCell(row?.children[index]);
  //   }

  //   if (column.format == 'datetime') {
  //     editingCell.append(this.calendar.initCalendar(cell.value));
  //     this.calendar.onClick()
  //     .then(date => {
  //       input.value = date;
  //       editEnd();
  //       this.cache.updateValue({
  //         columns: this.columns,
  //         origin: { column: column.id, cell: cell.id }
  //       });
  //     });
  //   }

  //   input.addEventListener('keydown', e => {
  //     if (e.key == 'Enter') {
  //       selectNextCell();
  //       editEnd();
  //       this.cache.updateValue({
  //         columns: this.columns,
  //         origin: { column: column.id, cell: cell.id }
  //       });
  //     }
  //     else if (e.key == 'Escape') editEnd(true);
  //   });

  //   document.onclick = e => {
  //     if (e.target.closest('.cell') && (e.target.closest('.cell') !== target)) {
  //       editEnd(true);
  //       document.onclick = null;
  //     }
  //   }
  // }

  clearCell(target) {
    let column = this.columns.find(col => col.id == +target.dataset.colId);
    
    if (!column.editable) return;

    let cell = column.cells.find(val => val.id == +target.dataset.cellId);

    target.innerHTML = '';
    cell.value = null;
    this.saveToLocalStorage();
  }

  onPageNavClick(button) {
    if (button.dataset.page) {
      if (+button.dataset.page === this.currentPage) return;

      this.currentPage = +button.dataset.page;
    }
    else if (button.hasAttribute('data-prev')) {
      this.currentPage = this.currentPage > 0
        ? this.currentPage -= 1 : 0;
    }
    else if (button.hasAttribute('data-next')) {
      this.currentPage = this.currentPage < this.totalRowPages
        ? this.currentPage += 1 : this.totalRowPages;
    }
    this.renderCells();
    this.renderPaginationBtns();
    this.saveToLocalStorage();
  }

  addColumn() {
    this.tableForm.title = 'Add Column',
    this.tableForm.header = `Column ${this.columns.length + 1}`;
    let existingHeaders = this.thead;
    let existingRows = this.tbody.childNodes;
    let id = this.columns.length + 1;
    let filterCol = this.tableSheet.filterBy.column;
    let order = this.tableSheet.filterBy.order;
    let cells = [...Array(this.columns[0].cells.length).keys()]
      .map(i => ({ id: i + 1, value: null }));
      
    this.tableForm.showForm();    
    this.tableForm.onSubmit()
    .then(prop => {
      existingHeaders.innerHTML += `
        <div class="header" data-col-id="${id}">
          <span>${prop.header}</span>
          <button class="filter-btn ${filterCol == id ? 'active' : ''}">
            <i class="fas fa-sort-amount-${order == 'ASC' ? 'down-alt' : 'up'}" 
              title="${order == 'ASC' ? 'A-Z' : 'Z-A'}"></i>
          </button>
          <ul class="options-menu">
            <li data-action="modify">Modify Column</li>
            <li data-action="sort-asc">Sort Table A-Z</li>
            <li data-action="sort-desc">Sort Table Z-A</li>
            <li data-action="clear">Clear Column</li>
            <li data-action="remove">Remove Column</li>
          </ul>
        </div>`;
      existingRows.forEach((row, index) => row.innerHTML += `
        <div 
        class="cell ${prop.alignment} ${!prop.editable ? 'non-editable' : ''}" 
        data-col-id="${id}" 
        data-cell-id="${index + 1}"
        data-format="${prop.format}"><span></span></div>`);
      
      this.columns.push({
        id,
        header: prop.header,
        format: prop.format,
        alignment: prop.alignment,
        order: this.columns.length + 1,
        editable: prop.editable,
        cells
      });
      this.saveToLocalStorage();

      this.cache.updateValue({
        columns: this.columns,
        origin: null
      });
    });
  }

  editColumn(id) {
    let column = this.columns.find(col => col.id == id);
    this.tableForm.title = 'Edit Column',
    this.tableForm.header = column.header;
    this.tableForm.format = column.format;
    this.tableForm.alignment = column.alignment;
    this.tableForm.editable = column.editable;

    this.tableForm.showForm();
    this.tableForm.onSubmit()
      .then(prop => {
        column.header = prop.header;
        column.format = prop.format;
        column.alignment = prop.alignment;
        column.editable = prop.editable;
        this.renderHeaders();
        this.renderCells();
        this.saveToLocalStorage();

        this.cache.updateValue({
          columns: this.columns,
          origin: null
        });
      });
  }

  sortColumn(id, order) {
    let column = this.columns.find(col => col.id == id);
    let index = this.columns.indexOf(column);
    let unsorted = [...this.tbody.children];

    unsorted.sort((a, b) => {
      a = a.children[index].textContent.trim().toLowerCase();
      b = b.children[index].textContent.trim().toLowerCase();

      if (column.format == 'datetime') {
        return order == 'DESC'
          ? new Date(b).getTime() - new Date(a).getTime()
          : new Date(a).getTime() - new Date(b).getTime();
      } else {
        return order == 'DESC'
          ? ((b > a) || (a == '') ? 1 : -1)
          : ((a > b) || (a == '') ? 1 : -1);
      }
    });
    this.tbody.innerHTML = '';
    this.tbody.append(...unsorted);
    this.tableSheet.filterBy = { column: id, order };
    this.renderHeaders();
    this.saveToLocalStorage();
  } 

  clearColumn(id) {
    let column = this.columns.find(col => col.id == id);
   
    this.popup.title = `Clear "${column.header}" column?`;
    this.popup.showPopup();
    this.popup.onActionClick()
      .then(proceed => {
        if (proceed) {
          column.cells.map(cell => cell.value = null);
          this.renderCells();
          this.saveToLocalStorage();

          this.cache.updateValue({
            columns: this.columns,
            origin: null
          });
        }
      });
  }

  removeColumn(id) {
    if (this.columns.length == 1) return;

    let column = this.columns.find(col => col.id == id);
    this.popup.title = `Remove "${column.header}" column?`;
    this.popup.showPopup();
    this.popup.onActionClick()
      .then(proceed => {
        if (proceed) {
          this.columns = this.columns.filter(col => col.id !== id);
          this.tableSheet.columns = this.columns;         
          this.renderHeaders();
          this.renderCells();
          this.saveToLocalStorage();

          this.cache.updateValue({
            columns: this.columns,
            origin: null
          });
        }
      });
  }

  addRow() {  
    let interval = setInterval(() => {
      let totalRenderedRows = this.paginatedColumns[0].cells.length;
       if (totalRenderedRows < this.pageRowLimit) {
        clearInterval(interval);
        
        this.columns.forEach(col => {
          col.cells.push({ id: col.cells.length + 1, value: null });
        });
        this.renderCells();
        this.renderRecordCount();
        this.renderPaginationBtns();
        this.saveToLocalStorage();

        this.cache.updateValue({
          columns: this.columns,
          origin: null
        });
      } else {
        this.currentPage++;
      }
    });
  }

  removeRow(e) {
    if (this.columns[0].cells.length == 1) return;

    if (e.target.closest('.row') && e.ctrlKey && e.shiftKey) {
      let row = e.target.closest('.row');
      let rowId = +row.children[0].dataset.cellId;
      row.classList.add('active');

      this.popup.title = 'Remove row?'
      this.popup.showPopup();
      this.popup.onActionClick()
        .then(proceed => {
          if (!proceed) {
            row.classList.remove('active');
          } else {
            this.columns.forEach(col => {
              col.cells = col.cells.filter(cell => cell.id !== rowId);
            });
            row.remove();
            
            if (!this.paginatedColumns[0].cells.length) {
              this.currentPage--;
            }
            this.renderCells();
            this.renderRecordCount();
            this.renderPaginationBtns();
            this.saveToLocalStorage();

            this.cache.updateValue({
              columns: this.columns,
              origin: null
            });
          }
        });
    }
  }

  get records() {
    return Array(this.totalRows).fill(null).map((a, i) => {
      let record = {}
      this.columns.forEach(col => record[col.header] = col.cells[i].value);
      return record;
    });
  }

  exportRecord() {
    let output = Object.keys(this.records[0]).join(', ') + '\n';

    output += [...Array(this.records.length).keys()]
      .map(val => Object.values(this.records[val]).join(', ')).join('\n');
    
    let link = document.createElement('a');
    link.download = 'My file.csv';
    link.href = URL.createObjectURL(new Blob([output], { type: 'text/csv' }));
    link.style.display = 'none';
    document.body.append(link);

    link.click();
    link.remove();
  }
}