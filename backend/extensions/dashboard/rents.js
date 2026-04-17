import {openDatabase, formatNumber} from '../../../indexdb/database.js'

export function dashboardRents() {
  setTimeout(() => {
    $('#dashboardRents').load("pages/extensions/dashboard/rents.html", () => {
      openDatabase().then(db => {
        const tx = db.transaction('rents', 'readonly')
        const store = tx.objectStore('rents')
        const index = store.index('status')  
        const requestOngoing = index.count('Ongoing')
        const requestOnBreak = index.count('On Break')
        const requestUnpaid = index.count('Unpaid')
        const requestCompleted = index.count('Completed')
  
        requestOngoing.onsuccess = () => {
          $('#dashboardRentsOngoing').text(formatNumber(requestOngoing.result))
        }

        requestOnBreak.onsuccess = () => {
          $('#dashboardRentsOnBreak').text(formatNumber(requestOnBreak.result))
        }

        requestUnpaid.onsuccess = () => {
          $('#dashboardRentsUnpaid').text(formatNumber(requestUnpaid.result))
        }

        requestCompleted.onsuccess = () => {
          $('#dashboardRentsCompleted').text(formatNumber(requestCompleted.result))
        }
      })
    })
  }, TIMEOUT_MS) 
}