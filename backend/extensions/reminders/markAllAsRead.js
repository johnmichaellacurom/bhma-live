import {openDatabase, dateTimeDatabase} from '../../../indexdb/database.js'

export function markAllAsRead(){
  openDatabase().then(db => {
    const tx = db.transaction('reminders', 'readwrite')
    const store = tx.objectStore('reminders')
    store.openCursor().onsuccess = function(e) {
      const cursor = e.target.result
      if(cursor) {
        const reminder = cursor.value
        if(reminder.read_at === '') {
          reminder.read_at = dateTimeDatabase()
          store.put(reminder)

          $(`.reminder-mark-as-read-${reminder.reminder_id}`).addClass('d-none')
          $(`.reminders-dot-${reminder.reminder_id}`).addClass('d-none')
        }
        cursor.continue();
      }
    }
  })
}