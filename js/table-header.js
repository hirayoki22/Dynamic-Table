import { Table } from './table.js';

export class TableHeader {
  menuIsActive = false;

  constructor(table = new Table) {
    this.table = table;
    this.thead = document.createElement('div');
    this.options = document.createElement('ul');
    this.thead.className = 'table-header';
    this.options.className = 'options-menu';
    this.options.innerHTML = `
      <li data-action="sortAsc">Sort Table A &rarr; Z</li>
      <li data-action="sortDesc">Sort Table Z &rarr; A</li>
      <li data-action="unsort">Clear Sort</li>
      <li class="separator"></li>  
      <li data-action="modify">Modify Column</li>
      <li data-action="clear">Clear Column</li>
      <li data-action="remove">Remove Column</li>`;
    this.render();
    this.eventHandlers();
  }

  eventHandlers() {
    this.thead.addEventListener('contextmenu', e => this.showOptions(e));
    this.thead.addEventListener('click', e => this.onSortbtnClick(e));
    this.thead.addEventListener('mousedown', e => this.onHeaderDrag(e));
  }

  render() {
    this.thead.innerHTML = this.table.columns.map(col => {
      return `
        <div class="header" data-col-id="${col.id}">
          <span class="header-value">${col.header}</span>
          <button class="filter-btn ${this.table.filterCol == col.id ? 'active' : ''}">
            <i class="fas fa-sort-amount-${this.table.filterOrder == 'ASC' ? 'down-alt' : 'up'}" 
              title="${this.table.filterOrder == 'ASC' ? 'A-Z' : 'Z-A'}"></i>
          </button>          
        </div>`;
    }).join('');
  }

  showOptions(e) {
    e.preventDefault();

    let colId = e.target.closest('.header').dataset.colId;
    
    const setUnsortOptionState = () => {
      let unsortOption = this.options.querySelector('[data-action="unsort"]');
      
      if (this.table.filterCol !== colId) {
        unsortOption.setAttribute('disabled', '');
      } else {
        unsortOption.removeAttribute('disabled');
      }
    }

    const setMenuRenderPositon = () => {
      let shiftX = e.pageX + this.options.clientWidth;
      let shiftY = e.pageY + this.options.clientHeight;
      let posX = ((window.innerWidth + window.scrollX) < shiftX)
        ? e.pageX - this.options.clientWidth
        : e.pageX;
      let posY = ((window.innerHeight + window.scrollY) < shiftY)
        ? e.pageY - this.options.clientHeight
        : e.pageY;
      
      this.options.style.top = `${posY}px`;
      this.options.style.left = `${posX}px`;
    };

    if (e.target.closest('.header')) {
      this.resetOptionItemsFocusedState();

      document.body.append(this.options);
      this.menuIsActive = true;
      this.itemIndex = -1;

      setUnsortOptionState();
      setMenuRenderPositon();
      
      this.options.onclick = e => this.onOptionsClick(e.target, colId);
      document.onkeyup = e => this.onOptionskeydown(e.key, colId);

      window.onresize = () => this.hideOptions();
      window.onscroll = () => this.hideOptions();
      document.onclick = e => {
        if (e.target.closest('.options-menu')) return;
        this.hideOptions();
      } 
    }
  }

  hideOptions() {
    this.menuIsActive = false;
    this.options.classList.add('hide');
    this.resetOptionItemsFocusedState();

    this.options.onanimationend = () => {
      this.options.classList.remove('hide');
      this.options.remove();
      this.options.onanimationend = null;

      this.options.onclick = null;
      window.onresize = null;
      window.onscroll = null;
      document.onkeyup = null;
      document.onclick = null;
    }
  }

  resetOptionItemsFocusedState() {
    let optionItems = [...this.options.children];
    optionItems.forEach(item => item.classList.remove('focused'));
  }

  onOptionsClick(target, colId) {
    if (target.closest('[data-action]')) {
      let button = target.closest('[data-action]');
      let action = button.dataset.action;
      let actions = {
        modify: () => this.modifyColumn(colId),
        sortAsc: () => this.sortColumn(colId, 'ASC'),
        sortDesc: () => this.sortColumn(colId, 'DESC'),
        unsort: () => this.unsortColumn(),
        clear: () => this.clearColumn(colId),
        remove: () => this.removeColumn(colId)
      }
      actions[action]();    
      this.hideOptions();  
    }
  }

  onOptionskeydown(key, colId) {
    if (!this.menuIsActive) return;

    let optionItems = [...this.options.children];
    let filteredItems = optionItems.filter(item => {
      return !item.hasAttribute('disabled') && 
        !item.classList.contains('separator');
    }).map(item => optionItems.indexOf(item));
    
    this.resetOptionItemsFocusedState();
    
    switch(key) {
      case 'ArrowUp':
        this.itemIndex = this.itemIndex > 0 
          ? this.itemIndex -= 1 
          : filteredItems.length - 1;
        break;
      case 'ArrowDown':
        this.itemIndex = this.itemIndex < filteredItems.length - 1
          ? this.itemIndex += 1 
          : 0;
        break;
      case 'Escape':
        this.hideOptions();
        return;
      case 'Enter':
        if (this.itemIndex < 0) {
          this.itemIndex = 0;
        } else {
          let item = optionItems[filteredItems[this.itemIndex]];
          this.onOptionsClick(item, colId);
          return;
        }
    }
    optionItems[filteredItems[this.itemIndex]].classList.add('focused');
  }

  onSortbtnClick(e) {
    if (e.target.closest('.filter-btn')) {
      let colId = e.target.closest('.header').dataset.colId;
      let order = this.table.filterOrder == 'ASC' ? 'DESC' : 'ASC';
      
      this.sortColumn(colId, order);
    }
  }

  onHeaderDrag(e) {
    if ((!e.target.classList.contains('header') && 
      e.target.tagName !== 'SPAN') || e.button == 2 || this.menuIsActive) {
      return;
    }

    let header = e.target.closest('.header');
    let placeholder = document.createElement('div');
    let shiftX = e.clientX - header.offsetLeft;
    let isDraggingStarted = false;
    let swapped = false;

    const mouseMoveHandler = e => {
      let prevHeader = header.previousElementSibling;
      let nextHeader = placeholder.nextElementSibling;
      let posX = e.clientX - shiftX;
      let widthDiff = this.thead.clientWidth - header.clientWidth;
      let left = (posX > widthDiff) ? widthDiff : (posX < 0) ? 0 : posX;
    
      header.setAttribute('data-dragging', '');
      placeholder.classList.add('placeholder');
      header.style.transform = `translateX(${left}px)`; 

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
      swapped = true;
    };
    
    const isAbove = (nodeA, nodeB) => {
      let rectA = nodeA.getBoundingClientRect();
      let rectB = nodeB.getBoundingClientRect();
    
      return (rectA.left + rectA.width / 2 < rectB.left + rectB.width);
    };

    const saveNewOrder = () => {
      [...this.thead.children].forEach((header, i) => {
        let column = this.table.columns.find(col => {
          return col.id === header.dataset.colId;
        });
        column.order = i + 1;
      });

      this.table.columns.sort((a, b) => a.order - b.order);
      this.table.tableBody.render();
      this.table.saveToLocalStorage();

      // Select last active cell 
      this.table.tableBody.selectCell(null, true);
    }

    const mouseUpHandler = () => {
      /** Without accounting for animations */
      document.onmousemove = null;
      document.onmouseup = null;
      placeholder?.remove();
      header.removeAttribute('style');
      header.removeAttribute('data-dragging');

      if (swapped) saveNewOrder();      
    };

    document.onmousemove = e => mouseMoveHandler(e);
    document.onmouseup = () => mouseUpHandler();
  }

  addColumn() {
    this.table.tableForm.title = 'Add Column',
    this.table.tableForm.header = `Column ${this.table.columns.length + 1}`;
    let existingHeaders = this.thead;
    let existingRows = this.table.tableBody.tbody.childNodes;

    let id = this.uuidv4;
    let cells = [...Array(this.table.columns[0].cells.length).keys()]
      .map(i => ({ id: i + 1, value: null }));
      
    this.table.tableForm.showForm();    
    this.table.tableForm.onSubmit()
    .then(prop => {
      existingHeaders.innerHTML += `
        <div class="header" data-col-id="${id}">
          <span class="header-value">${prop.header}</span>
          <button class="filter-btn ${this.table.filterCol == id ? 'active' : ''}">
            <i class="fas fa-sort-amount-${this.table.filterOrder == 'ASC' ? 'down-alt' : 'up'}" 
              title="${this.table.filterOrder == 'ASC' ? 'A-Z' : 'Z-A'}"></i>
          </button>
        </div>`;
      existingRows.forEach((row, index) => row.innerHTML += `
        <div 
        class="cell ${prop.alignment} ${!prop.editable ? 'non-editable' : ''}" 
        data-col-id="${id}" 
        data-cell-id="${index + 1}"
        data-format="${prop.format}">
          <span class="cell-value"></span>
        </div>`);
      
      this.table.columns.push({
        id,
        header: prop.header,
        format: prop.format,
        alignment: prop.alignment,
        order: this.table.columns.length + 1,
        editable: prop.editable,
        cells
      });

      this.table.saveToLocalStorage();
      this.table.cache.updateValue({
        columns: this.table.columns,
        origin: null
      });
    });
  }

  modifyColumn(id) {
    let column = this.table.columns.find(col => col.id == id);
    this.table.tableForm.title = 'Modify Column',
    this.table.tableForm.header = column.header;
    this.table.tableForm.format = column.format;
    this.table.tableForm.alignment = column.alignment;
    this.table.tableForm.editable = column.editable;

    this.table.tableForm.showForm();
    this.table.tableForm.onSubmit()
      .then(prop => {
        column.header = prop.header;
        column.format = prop.format;
        column.alignment = prop.alignment;
        column.editable = prop.editable;

        this.render();
        this.table.tableBody.render();
        this.table.saveToLocalStorage();
        this.table.cache.updateValue({
          columns: this.table.columns,
          origin: null
        });
      });
  }

  sortColumn(id, order, tbody = null) {
    tbody = !tbody? this.table.tableBody.tbody : tbody;
    let column = this.table.columns.find(col => col.id == id);
    let index = this.table.columns.indexOf(column);
    let unsorted = [...tbody.children];

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
    tbody.innerHTML = '';
    tbody.append(...unsorted);
    this.table.tableSheet.filterBy = { column: id, order };
    this.render();
    this.table.saveToLocalStorage();
  } 

  unsortColumn() {
    this.table.tableSheet.filterBy = { column: null, order: 'ASC' };
    this.render();
    this.table.tableBody.render();
    this.table.saveToLocalStorage();
  }

  clearColumn(id) {
    let column = this.table.columns.find(col => col.id == id);
   
    this.table.popup.title = `Clear "${column.header}" column?`;
    this.table.popup.showPopup();
    this.table.popup.onActionClick()
      .then(proceed => {
        if (proceed) {
          column.cells.map(cell => cell.value = null);

          this.table.tableBody.render();
          this.table.saveToLocalStorage();
          this.table.cache.updateValue({
            columns: this.table.columns,
            origin: null
          });
        }
      });
  }

  removeColumn(id) {
    if (this.table.columns.length == 1) return;

    let column = this.table.columns.find(col => col.id == id);
    this.table.popup.title = `Remove "${column.header}" column?`;
    this.table.popup.showPopup();
    this.table.popup.onActionClick()
      .then(proceed => {
        if (proceed) {
          this.table.columns = this.table.columns.filter(col => col.id !== id);

          this.render();
          this.table.tableBody.render();
          this.table.saveToLocalStorage();
          this.table.cache.updateValue({
            columns: this.table.columns,
            origin: null
          });
        }
      });
  }

  get uuidv4() {
    return 'xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}