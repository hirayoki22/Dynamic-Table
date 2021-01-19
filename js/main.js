import { Table } from './table.js';
import { Popup } from './popup.js';

/* Class constructor accepts an existing set 
* of columns to render the table from;
* Table is rendered upon initialization
*/
const loadTable = startNew => {
  document.querySelector('.app-container').classList.add('active');

  if (startNew) {
    let table = new Table();
  } else {
    fetch('./api/presets.json')
      .then(res => res.json())
      .then(table => new Table(table))
      .catch(err => console.log(err.message));
  }
}

(() => {
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