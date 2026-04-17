import {openDatabase, formatNumber} from '../../../indexdb/database.js'

export function dashboardBelongings() {
  setTimeout(() => {
    $('#dashboardBelongings').load("pages/extensions/dashboard/belongings.html", () => {
      openDatabase().then(db => {
        const tx = db.transaction('belongings', 'readonly')
        const store = tx.objectStore('belongings')
        const index = store.index('status')  
        const requestActive = index.count('Active')
        const requestInactive = index.count('Inactive')
  
        requestActive.onsuccess = () => {
          $('#dashboardBelongingsActive').text(formatNumber(requestActive.result))
        }

        requestInactive.onsuccess = () => {
          $('#dashboardBelongingsInactive').text(formatNumber(requestInactive.result))
        }
      })
    })
  }, TIMEOUT_MS) 
}