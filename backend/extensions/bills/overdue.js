import {openDatabase, dateTimeDatabase} from '../../../indexdb/database.js'

export function autoUpdateOverdueBills() {
  openDatabase().then(db => {
    const tx = db.transaction('bills', 'readwrite')
    const store = tx.objectStore('bills')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    store.openCursor().onsuccess = function(e) {
      const cursor = e.target.result
      if(cursor){
        const bill = cursor.value
        if(bill.status === "Unpaid" || bill.status === "Partially"){
          const dueDate = new Date(bill.due_date)
          dueDate.setHours(0, 0, 0, 0)

          if(today > dueDate){
            bill.status = "Overdue"
            bill.last_modified = dateTimeDatabase()
            store.put(bill)
          }
        }        
        cursor.continue();
      }
    }
  })
}