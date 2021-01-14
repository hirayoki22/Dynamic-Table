export class Calendar {
  months = {
    0: 'JAN',
    1: 'FEB',
    2: 'MAR',
    3: 'APR',
    4: 'MAY',
    5: 'JUN',
    6: 'JUL',
    7: 'AUG',
    8: 'SEP',
    9: 'OCT',
    10: 'NOV',
    11: 'DEC'
  };

  constructor() { }

  get monthAndYear() {
    return `${this.months[this.month]} - ${this.year}`;
  }

  initCalendar(date) {
    this.date = date || new Date();
    this.year = new Date(this.date).getFullYear();
    this.month = new Date(this.date).getMonth();

    this._createCalendar();
    this._createDaysGrid();
    return this.calendar;
  }

  _createCalendar() {
    this.calendar = document.createElement('section');
    this.header = document.createElement('header');
    this.calendar.className = 'calendar';
    this.header.className = 'cal-header';
    this.header.innerHTML = `
      <nav class="year-nav">
        <button class="material-icons nav-btn" data-nav="prev">keyboard_arrow_left</button>
        <div class="year">${this.monthAndYear}</div>
        <button class="material-icons nav-btn" data-nav="next">keyboard_arrow_right</button>
      </nav>
      <div class="days-name-wrapper">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>`;
    this.calendar.append(this.header);
  }

  _createDaysGrid() {
    this.daysGrid = document.createElement('article');
    this.daysGrid.className = 'days-wrapper';

    const totalDays = () => new Date(this.year, this.month + 1, 0).getDate();

    // Add past month's days
    let lastDay = new Date(this.year, this.month, 0).getDate();
    this.daysGrid.innerHTML += Array(new Date(this.year, this.month).getDay())
      .fill('')
      .map((val, i) => {
        return `<span class="day inactive" prev-month>${lastDay - i}</span>`;
      }).reverse().join('');
  
    // Add current month's days
    for (let i = 1; i <= totalDays(); i++) {    
      if (
        new Date(this.date).getDate() == i && 
        this.year == new Date(this.date).getFullYear() &&
        this.month == new Date(this.date).getMonth()
      ) {
        this.daysGrid.innerHTML += `<span class="day active">${i}</span>`;
      } else {
        this.daysGrid.innerHTML += `<span class="day">${i}</span>`;
      }
    }
  
    // Add next mnonth's days
    this.daysGrid.innerHTML += Array(42 - this.daysGrid.children.length)
      .fill('')
      .map((val, i) => `<span class="day inactive" next-month>${i + 1}</span>`).join('');
      
    this.calendar.append(this.daysGrid);
  }

  _updateHeader() {
    this.header.querySelector('.year').innerHTML = this.monthAndYear;
  }

  _updateDays() {
    this.daysGrid.remove();
    this._createDaysGrid();
  }
  
  onClick() {
    return new Promise((resolve, reject) => {
      this.calendar.addEventListener('click', e => {
        if (e.target.classList.contains('nav-btn')) {       
          if (e.target.dataset.nav === 'prev') {
            if (this.year == 1970 && this.month == 0) {
              return;
            } 
            this.month = this.month > 0 ? this.month -= 1 : 11;
            this.year = this.month == 11 ? this.year -= 1 : this.year; 
          } else {
            this.month = this.month < 11 ? this.month += 1 : 0;
            this.year = this.month == 0 ? this.year += 1 : this.year; 
          }
          this._updateHeader();
          this._updateDays();
        }
        else if (e.target.classList.contains('day')) {
          let day = +e.target.textContent;

          this.month = (e.target.hasAttribute('prev-month'))
            ? this.month -= 1 
            : (e.target.hasAttribute('next-month'))
            ? this.month += 1
            : this.month;

          resolve(new Date(this.year, this.month, day));
        }
      });
    });
  }
}

