import {openDatabase, formatNumber} from '../../../indexdb/database.js'

export function dashboardRooms() {
  setTimeout(() => {
    $('#dashboardRooms').load("pages/extensions/dashboard/rooms.html", () => {
      openDatabase().then(db => {
        const tx = db.transaction('rooms', 'readonly')
        const store = tx.objectStore('rooms')
        const index = store.index('status')  
        const requestActive = index.count('Active')
        const requestInactive = index.count('Inactive')
  
        requestActive.onsuccess = () => {
          $('#dashboardRoomsActive').text(formatNumber(requestActive.result))
        }

        requestInactive.onsuccess = () => {
          $('#dashboardRoomsInactive').text(formatNumber(requestInactive.result))
        }
      })
    })
  }, TIMEOUT_MS) 
}