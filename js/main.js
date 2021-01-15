import { Table } from './table.js';
import { Popup } from './popup.js';

/* Class constructor accepts an existing set 
* of columns to render the table from;
* Table is rendered upon initialization
*/
const loadTable = startNew => {
  document.querySelector('.table-wrapper').classList.add('active');

  if (startNew) {
    let table = new Table();
  } else {
    fetch('./api/default-table.json')
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

let users = [
  {
    id: 4578,
    login: 'hirayki22',
    active: true
  },
  {
    id: 1466,
    login: 'markus68',
    active: true
  },
  {
    id: 8946,
    login: 'rosemaiden',
    active: true
  },
  {
    id: 3460,
    login: 'sephiroth',
    active: true
  }
];

let usersObj = users.reduce((acc, user) => ({...acc, [user.id]: user}), {});

console.log(usersObj);