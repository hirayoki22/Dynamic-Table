import { TableForm } from './table-form.js';
import { TableBody } from './table-body.js';
import { TableHeader } from './table-header.js';
import { Cache } from './cache.js';
import { Popup } from './popup.js';

export class Table extends HTMLElement {
  tableForm = new TableForm();
  popup = new Popup({});

  constructor() {
    super();
  }

  connectedCallback() {
    this.tableSheet = this.tableSheet;
    this.cache = new Cache(this.columns);
    this.saveToLocalStorage();
    this.renderTable();
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

  get totalRowPages() {
    return Math.ceil(this.totalRows / this.pageRowLimit);
  }

  get currentPage() {
    return this.tableSheet.currentPage;
  }

  set currentPage(newValue) {
    this.tableSheet.currentPage = newValue;
  }

  get filterCol() {
    return this.tableSheet.filterBy.column;
  }

  get filterOrder() {
    return this.tableSheet.filterBy.order;
  }

  get activeCell() {
    return this.tableSheet.activeCell;
  }

  set activeCell(newValue) {
    return this.tableSheet.activeCell = newValue;
  }

  eventHandlers() {
    this.sheetTitle.addEventListener('keyup', () => this.onTitleChange());
    this.actionsButtons.addEventListener('click', e => this.onActionClick(e))
    this.paginationArea.addEventListener('click', e => this.onPageNavClick(e.target));
  }

  saveToLocalStorage() {
    this.tableSheet.lastModified = new Date();
    localStorage.setItem('dynamic-table', JSON.stringify(this.tableSheet));
  }

  renderTable() {
    this.className = 'table';
    this.tableHeader = new TableHeader(this);
    this.tableBody = new TableBody(this);
    this.app = document.querySelector('.app-body');
    this.sheetTitle = document.querySelector('.sheet-title');
    this.bottomContent = this.app.querySelector('.app-cta');
    this.actionsButtons = this.app.querySelector('.action-buttons');
    this.addColButton = this.app.querySelector('[data-add-column]');
    this.addRowButton = this.app.querySelector('[data-add-row]');
    this.logButton = this.app.querySelector('[data-records]');
    this.paginationArea = document.createElement('section');

    this.sheetTitle.textContent = this.tableSheet.title;
    this.style.height = `calc(32px + 25px * ${this.pageRowLimit})`;
    this.append(this.tableHeader.thead, this.tableBody.tbody);
  }

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

    this.bottomContent.append(this.paginationArea);
  }

  setPaginationButtonsState() {
    this.prevBtn.disabled = this.currentPage == 1;
    this.nextBtn.disabled = this.currentPage == this.totalRowPages;
    this.pageBtns.forEach(btn => btn.classList.remove('active'));
    this.pageBtns.find(btn => +btn.dataset.page == this.currentPage)
      .classList.add('active');
  }

  onTitleChange() {
    this.tableSheet.title = this.sheetTitle.textContent;
    this.saveToLocalStorage();
  }

  onActionClick(e) {
    if (!e.target.hasAttribute('data-action')) return;

    let action = e.target.dataset.action;
    let actions = {
      'add-column': () => this.tableHeader.addColumn(),
      'add-row': () => this.tableBody.addRow(),
      'records': () => this.exportRecord()
    }
    actions[action]();
  }

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

      this.tableHeader.render();
      this.tableBody.render();
      this.saveToLocalStorage();

      tCell = this.tableBody.tbody
        .querySelector(`[data-col-id="${col}"][data-cell-id="${cell}"]`);
      this.tableBody.selectCell(tCell);
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
    this.tableBody.render();
    this.renderPaginationBtns();
    this.saveToLocalStorage();
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

customElements.define('dynamic-table', Table);