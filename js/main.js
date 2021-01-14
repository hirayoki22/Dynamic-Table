import { Table } from './table.js';

/* Class constructor accepts an existing set 
* of columns to render the table from;
* Table is rendered upon initialization
*/
fetch('./api/default-table.json')
  .then(res => res.json())
  .then(table => new Table(table))
  .catch(err => console.log(err.message));