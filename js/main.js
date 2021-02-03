import { Table } from './table.js';
import { Popup } from './popup.js';

/* Class constructor accepts an existing set 
* of columns to render the table from;
* Table is rendered upon initialization
*/
const renderApp = () => {
  let app = document.createElement('main');
  app.className = 'app-body';
  app.innerHTML = `
  <header class="app-header">
    <div class="sheet-title">
      <div class="sheet-title-label">
        <span class="sheet-title-label-inner"></span>
      </div>
      <input class="sheet-title-input" 
             type="text" name="sheet-title" aria-label="Rename"
             spellcheck="false" maxlength="58"> 
    </div>
    <div class="action-buttons">
      <button type="button" data-action="add-column">Add Column</button>
      <button type="button" data-action="add-row">Add Row</button>
      <button type="button" data-action="records">Log Recods</button>
    </div>
  </header>
  <section class="app-cta"></section>`;
  document.body.prepend(app);
}

const loadTable = (startNew = false) => {
  let app = document.querySelector('.app-body');
  let table = document.createElement('dynamic-table');
  app.classList.add('active');
  
  if (startNew) {
    if (localStorage.getItem('dynamic-table')) {
      table.tableSheet = JSON.parse(localStorage.getItem('dynamic-table'));
    }
    app.insertBefore(table, app.lastElementChild);
  } else {
    fetch('./api/presets.json')
      .then(res => res.json())
      .then(tableSheet => {
        table.tableSheet = tableSheet;
        app.insertBefore(table, app.lastElementChild);
      })
      .catch(err => console.log(err.message));
  }
}

(() => {
  renderApp();

  if (!JSON.parse(localStorage.getItem('dynamic-table'))) {
    let popup = new Popup({
      title: 'Hey there, person!',
      btn1Label: 'Load Mockup',
      btn2Label: 'Start Anew'
    });
    popup.showPopup();
    popup.onActionClick().then(loadTable);
  } else {
    loadTable(true);
  }
})();


