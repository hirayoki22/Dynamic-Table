## Overview:
I made this app as part of little challenge, but then went a bit overboard about it and ended up making it more intricate and complete than it was originally intended.

The challenge consisted of creating a table that was fully dynamic, with the option to add/modify columns and rows, edit cell values, have typed columns, and several others. Al this would have to be achieved using vanilla JS and CSS, no libraries allowed, and a modern approach using ES6 syntax.

The table uses a very simple data structure:

```javascript
const SheetModel = {
  id: 'AZCYU-9971-0096',
  title: 'Table Title',
  creationDate: new Date(),
  lastModified: null,
  filterBy: { column: null, order: 'ASC' },
  currentPage: 1,
  preferences: {
    paginateRows: true,
    pageRowLimit: 10
  },
  editHistory: [],
  columns: [
    {
      id: 1,
      header: 'Column 1',
      format: 'text',
      textAlign: 'left',
      order: 1,
      editable: true,
      cells: [{ id: 1, value: null }]
    }
  ]
}
```
The ID is there for future expansions, such as adding enabling multiple table sheets, allowing to distinguish them.

## Feature list
+ Add/modify columns
+ Sort columns DESC/ASC
+ Add/modify rows
+ Rearrangeable columns
+ Typed columns
+ Styled cell values based off column type
+ Editable cells
+ Highlight cells
+ Move and quick edit cells with keyboard
+ Limit total visible rows
+ Dynamic pagination
+ Basic undo/redo system
+ Export records as JSON and CSV format
+ Save table sheet to local storage

## About the table columns
Columns are typed, and the cell values are styled and shown according to their type when rendered on the page, and store as the corresponding column's format when entering new data. It's a quick and easy parsing process that flows both ways.

Clicking on the Add Column button will open a modal form where you can choose the column's header label, type/format, cell text alignment, and where the column is editable or locked. this same form will come up when modifying an existing column, but this time it will proload the current's column properties to make it easier to manage.

#### Supported formats/types
+ **text**: displayed as plain text
+ **URL**: displayed as underline colored text
+ **email**: displayed as underline colored text
+ **number**: displayed as plain text
+ **money-usd**: displayed as two decimal points number prefixed with the $ sign
+ **money-eur**: displayed as two decimal points number prefixed with the € sign
+ **datetime**: displayed as friendly
+ **boolean**: displayed as YES/NO

#### Actions:
+ Open column options menu on right click/context menu. (Menus can be closed on blur and un ESC key press) 
  - Modify Column
  - Sort A-Z
  - Sort Z-A
  - Clear column
  - Remove column
+ Drag & drop on mousedown to switch the header's position. Will automatically change the entire column's position.
+ Quick sort ASC/DESC a previously sorted column via the quick sort button that will only show up for said column.

**Note:** Clear and Remove Column options trigger a popup confirmation to show up.

_More to come... :D_