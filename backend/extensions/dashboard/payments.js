import {openDatabase, formatNumber} from '../../../indexdb/database.js'

export function dashboardPayments() {
  setTimeout(() => {
    $('#dashboardPayments').load("pages/extensions/dashboard/payments.html", () => {
      openDatabase().then(db => {
        const tx = db.transaction('payment_rents', 'readonly')
        const store = tx.objectStore('payment_rents')
        const index = store.index('status')  
        const requestUnpaid = index.count('Unpaid')
        const requestPaid = index.count('Paid')
        const requestPartially = index.count('Partially')
        const requestOverdue = index.count('Overdue')
        const requestUnbilled = index.count('Unbilled')
  
        requestUnpaid.onsuccess = () => {
          $('#dashboardPaymentRentsUnpaid').text(formatNumber(requestUnpaid.result))
        }

        requestPaid.onsuccess = () => {
          $('#dashboardPaymentRentsPaid').text(formatNumber(requestPaid.result))
        }

        requestPartially.onsuccess = () => {
          $('#dashboardPaymentRentsPartially').text(formatNumber(requestPartially.result))
        }

        requestOverdue.onsuccess = () => {
          $('#dashboardPaymentRentsOverdue').text(formatNumber(requestOverdue.result))
        }

        requestUnbilled.onsuccess = () => {
          $('#dashboardPaymentRentsUnbilled').text(formatNumber(requestUnbilled.result))
        }
      })

      openDatabase().then(db => {
        const tx = db.transaction('payment_bills', 'readonly')
        const store = tx.objectStore('payment_bills')
        const index = store.index('status')  
        const requestUnpaid = index.count('Unpaid')
        const requestPaid = index.count('Paid')
        const requestPartially = index.count('Partially')
        const requestOverdue = index.count('Overdue')
        const requestUnbilled = index.count('Unbilled')
  
        requestUnpaid.onsuccess = () => {
          $('#dashboardPaymentsBillsUnpaid').text(formatNumber(requestUnpaid.result))
        }

        requestPaid.onsuccess = () => {
          $('#dashboardPaymentsBillsPaid').text(formatNumber(requestPaid.result))
        }

        requestPartially.onsuccess = () => {
          $('#dashboardPaymentsBillsPartially').text(formatNumber(requestPartially.result))
        }

        requestOverdue.onsuccess = () => {
          $('#dashboardPaymentsBillsOverdue').text(formatNumber(requestOverdue.result))
        }

        requestUnbilled.onsuccess = () => {
          $('#dashboardPaymentsBillsUnbilled').text(formatNumber(requestUnbilled.result))
        }
      })
    })
  }, TIMEOUT_MS) 
}