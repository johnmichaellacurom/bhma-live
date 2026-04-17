import {openDatabase, dateTimeDatabase} from '../../../../indexdb/database.js'

export function autoUpdateOverduePaymentBills() {
  openDatabase().then(db => {
    const electricLateFeePercent = Number(localStorage.getItem('settings-bills-late-fee-per-day-electric') || '0') / 100
    const waterLateFeePercent = Number(localStorage.getItem('settings-bills-late-fee-per-day-water') || '0') / 100

    const tx = db.transaction(['payment_bills', 'bills'], 'readwrite')
    const store = tx.objectStore('payment_bills')
    const billStore = tx.objectStore('bills')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    store.openCursor().onsuccess = function(e) {
      const cursor = e.target.result
      if(cursor){
        const paymentBill = cursor.value
        
        if(paymentBill.status === "Unpaid" || paymentBill.status === "Partially"){
          const dueDate = new Date(paymentBill.due_date)
          dueDate.setHours(0, 0, 0, 0)

          // number of days after due date
          const diffDays = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))          
 
          if(today > dueDate){
            const billRequest = billStore.get(Number(paymentBill.bill_id))
            billRequest.onsuccess = () => {
              const billRecord = billRequest.result
              if(billRecord) {
                const amountDue = Number(paymentBill.amount_due)
                const lateFeeAmount = (billRecord.bill_type === "Electric") ?
                  (amountDue * electricLateFeePercent) * diffDays : // Electric
                  (amountDue * waterLateFeePercent) * diffDays // Water

                const totalAmountDue = Number(paymentBill.total_amount_due) + lateFeeAmount

                paymentBill.status = "Overdue"
                paymentBill.late_fee = lateFeeAmount.toFixed(2)
                paymentBill.total_amount_due = totalAmountDue.toFixed(2)
                paymentBill.last_modified = dateTimeDatabase()
                store.put(paymentBill)
              }
            }
          }
        }        
        cursor.continue();
      }
    }
  })
}