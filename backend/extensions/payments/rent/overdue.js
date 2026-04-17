import {openDatabase, dateTimeDatabase, formatMoneyReverse} from '../../../../indexdb/database.js'

export function autoUpdateOverduePaymentRents() {
  openDatabase().then(db => {
    const regularLateFeePercent = Number(localStorage.getItem('settings-boarders-late-fee-per-day-regular') || '0') / 100
    const transientLateFeePercent = Number(localStorage.getItem('settings-boarders-late-fee-per-day-transient') || '0') / 100

    const tx = db.transaction(['payment_rents', 'rents'], 'readwrite')
    const store = tx.objectStore('payment_rents')
    const rentStore = tx.objectStore('rents')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    store.openCursor().onsuccess = function(e) {
      const cursor = e.target.result
      if(cursor){
        const paymentRent = cursor.value
        if(paymentRent.status === "Unpaid" || paymentRent.status === "Partially"){
          const dueDate = new Date(paymentRent.due_date)
          dueDate.setHours(0, 0, 0, 0)

          // number of days after due date
          const diffDays = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))          

          if(today > dueDate){
            const rentRequest = rentStore.get(Number(paymentRent.rent_id))
            rentRequest.onsuccess = () => {
              const rentRecord = rentRequest.result
              if(rentRecord) {
                const amountDue = Number(paymentRent.amount_due)     
                const lateFeeAmount = (rentRecord.rent_type === "Regular") ? 
                  (amountDue * regularLateFeePercent) * diffDays : // Regular
                  (amountDue * transientLateFeePercent) * diffDays // Transient
    
                const totalAmountDue = Number(paymentRent.total_amount_due) + lateFeeAmount
    
                paymentRent.status = "Overdue"
                paymentRent.late_fee = lateFeeAmount.toFixed(2)
                paymentRent.total_amount_due = totalAmountDue.toFixed(2)
                paymentRent.last_modified = dateTimeDatabase()
                store.put(paymentRent)
              }
            } 
          }
        }        
        cursor.continue();
      }
    }
  })
}