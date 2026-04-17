import {openDatabase, formatNumber} from '../../../indexdb/database.js'

export function dashboardBoarders() {
  setTimeout(() => {
    $('#dashboardBoarders').load("pages/extensions/dashboard/boarders.html", () => {
      openDatabase().then(db => {
        const tx = db.transaction('boarders', 'readonly')
        const store = tx.objectStore('boarders')

        const indexStatus = store.index('status')
        const requestActive = indexStatus.count('Active')
        const requestInactive = indexStatus.count('Inactive')

        const indexStatusSex = store.index('status_sex')

        const requestActiveMale = indexStatusSex.count(['Active', 'Male'])
        const requestInactiveMale = indexStatusSex.count(['Inactive', 'Male'])
        
        const requestActiveFemale = indexStatusSex.count(['Active', 'Female'])
        const requestInactiveFemale = indexStatusSex.count(['Inactive', 'Female'])        
  
        requestActive.onsuccess = () => {
          $('#dashboardBoardersActive').text(formatNumber(requestActive.result))
        }
        requestInactive.onsuccess = () => {
          $('#dashboardBoardersInactive').text(formatNumber(requestInactive.result))
        }

        requestActiveMale.onsuccess = () => {
          $('#dashboardBoardersActiveMale').text(formatNumber(requestActiveMale.result))
        }
        requestInactiveMale.onsuccess = () => {
          $('#dashboardBoardersInactiveMale').text(formatNumber(requestInactiveMale.result))
        }

        requestActiveFemale.onsuccess = () => {
          $('#dashboardBoardersActiveFemale').text(formatNumber(requestActiveFemale.result))
        }
        requestInactiveFemale.onsuccess = () => {
          $('#dashboardBoardersInactiveFemale').text(formatNumber(requestInactiveFemale.result))
        }
      })
    })
  }, TIMEOUT_MS) 
}