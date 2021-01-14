export class Popup {
  constructor({ title, btn1Label, btn2Label }) { 
    this.title = title || 'Default Title';
    this.btn1Label = btn1Label || 'Cancel';
    this.btn2Label = btn2Label || 'Confirm';
  }

  initOverlay() {
    this.overlay = document.createElement('div');
    this.popup = document.createElement('div');
    this.overlay.className = 'table-overlay';
    this.popup.className = 'popup';

    this.popup.innerHTML = `
    <h3>${this.title}</h3>
    <div class="action-btns">
      <button type="button" data-cancel>${this.btn1Label}</button>
      <button type="button" data-confirm>${this.btn2Label}</button>
    </div>`;
    this.actionBtns = this.popup.querySelector('.action-btns');
    this.overlay.append(this.popup);
  }

  onActionClick() {
    return new Promise((resolve, reject) => {
      this.actionBtns.addEventListener('click', e => {
        if (e.target.hasAttribute('data-cancel')) {
          this.hidePopup();
          resolve(false);
        } 
        if (e.target.hasAttribute('data-confirm')) {
          this.hidePopup();
          resolve(true);
        } 
      });

      document.onkeyup = e => {
        if (e.key === 'Escape') {
          this.hidePopup();
          resolve(false);
          document.onkeyup = null;
        }
      }
    });
  }

  showPopup() {
    this.initOverlay();
    document.body.classList.add('active-modal');
    document.body.append(this.overlay);
  }

  hidePopup() {
    this.overlay.classList.add('hide');
    this.overlay.addEventListener('animationend', () => {
      document.body.classList.remove('active-modal');
      this.overlay.remove();
    });
  }
}
