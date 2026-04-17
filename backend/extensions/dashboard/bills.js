import {openDatabase, formatNumber} from '../../../indexdb/database.js'

export function dashboardBills() {
  setTimeout(() => {
    $('#dashboardBills').load("pages/extensions/dashboard/bills.html", () => {
      openDatabase().then(db => {
        const tx = db.transaction('bills', 'readonly')
        const store = tx.objectStore('bills')
        const index = store.index('status')  
        const requestUnpaid = index.count('Unpaid')
        const requestPaid = index.count('Paid')
        const requestPartially = index.count('Partially')
        const requestOverdue = index.count('Overdue')
        const requestUnbilled = index.count('Unbilled')
  
        requestUnpaid.onsuccess = () => {
          $('#dashboardBillsUnpaid').text(formatNumber(requestUnpaid.result))
        }

        requestPaid.onsuccess = () => {
          $('#dashboardBillsPaid').text(formatNumber(requestPaid.result))
        }

        requestPartially.onsuccess = () => {
          $('#dashboardBillsPartially').text(formatNumber(requestPartially.result))
        }

        requestOverdue.onsuccess = () => {
          $('#dashboardBillsOverdue').text(formatNumber(requestOverdue.result))
        }

        requestUnbilled.onsuccess = () => {
          $('#dashboardBillsUnbilled').text(formatNumber(requestUnbilled.result))
        }
      })
    })
  }, TIMEOUT_MS) 
}