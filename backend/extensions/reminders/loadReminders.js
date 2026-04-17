import {toast} from '../../../backend/index.js'
import {openDatabase, dateTimeFriendly} from '../../../indexdb/database.js'

export function loadReminders(limit, offset, isSeeMore) {
  openDatabase().then(db => {
    const tx = db.transaction('reminders', 'readonly')
    const store = tx.objectStore('reminders')
    const filteredTotal = []

    store.openCursor().onsuccess = function(e) {
      const cursor = e.target.result;

      if(cursor) {
        const reminders = cursor.value
        filteredTotal.push(reminders)
        cursor.continue()
      } else {

        filteredTotal.sort((a, b) => b.reminder_id - a.reminder_id)
        const finalReminders = filteredTotal.slice(offset, offset + limit)
        displayReminders(finalReminders, isSeeMore)
      }
    }

  }).catch(() => toast('error', 'Database error.'))
}

function displayReminders(reminders, isSeeMore) {
  const remindersData = $('#remindersData')
  
  $('#remindersMarkAllAsRead').removeClass('d-none')
  $('#remindersSeeMore').removeClass('d-none')
  if(!isSeeMore) {
    remindersData.empty()    
  } 

  if(reminders.length <= 0 && !isSeeMore) {
    $('#remindersMarkAllAsRead').addClass('d-none')
    remindersData.html('<p class="my-3">No Reminders Yet.</p>')
    $('#remindersSeeMore').addClass('d-none')
    return;
  }

  if(reminders.length <= 0 && isSeeMore) {
    $('#remindersSeeMore').addClass('d-none')
  }

  reminders.forEach(reminder => {
    const reminderType = reminder.morph_type
    remindersData.append(`
      <div class="shadow p-3 rounded w-100 border reminder-data-${reminder.reminder_id}">
        <header class="d-flex align-items-center justify-content-between gap-2 flex-wrap bg-primary-subtle p-3 rounded">
          <aside class="d-flex justify-content-center align-items-center gap-2 flex-column">
            <h4 class="mb-0 d-flex align-items-center justify-content-start gap-2">
              <div class="d-flex align-items-center justify-content-center p-1 bg-light rounded-circle border">
                <img src="assets/svg/${reminderType === 'boarder' ? 'boarder' : 'payment'}.svg" alt="logo" width="25" height="25" width="25" height="25">
              </div>
              ${reminderType === "boarder" ? 'Boarder' : 'Payment'}
            </h4>
            <p class="mb-0 fst-italic" style="font-size: small; opacity: 80%;">${dateTimeFriendly(reminder.date_created)}</p>
          </aside>
          <aside class="${reminder.read_at === '' ? 'd-block' : 'd-none'} reminder-mark-as-read-${reminder.reminder_id}">
            <button class="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 flex-nowrap reminder-mark-as-read" data-id="${reminder.reminder_id}" type="button">
              <span class="spinner-border spinner-border-sm visually-hidden" aria-hidden="true"></span>
              <span role="status" class="status">Mark as Read</span>
            </button>
          </aside>
        </header>
        <hr>
        <div class="d-flex align-items-start justify-content-start gap-3">
          <div class="w-10 reminders-dot-${reminder.reminder_id} ${reminder.read_at === '' ? 'd-block' : 'd-none'}">
            <div class="bg-primary rounded-circle" style="width:10px; height:10px;"></div>
          </div>
          <p class="mb-0">${reminder.description}</p>
        </div>
      </div>
    `)
  })
}