import {openDatabase, dateTimeDatabase, dateFriendly} from '../../../indexdb/database.js'
import {getAge} from '../boarders/getAge.js'

function reminderCreateIfNotExists(db, today, reminderDate, morphType, morphId, description) {  
  if(today >= reminderDate) {
    const tx = db.transaction('reminders', 'readwrite')
    const store = tx.objectStore('reminders')
    const index = store.index('morph_type_morph_id')
    const count = index.count([morphType, morphId])

    count.onsuccess = () => {
      if(count.result <= 0){
        db.transaction('reminders', 'readwrite').objectStore('reminders').add({
          morph_type: morphType,
          morph_id: morphId,
          description: description,
          read_at: '',
          date_created: dateTimeDatabase()
        })
      }
    }
  }
}

export function dashboardReminders() {
  openDatabase().then(db => {
    const paymentDueDaysBefore = localStorage.getItem("settings-reminders-payment-due") || 'off'
    const birthdayDaysBefore = localStorage.getItem("settings-reminders-birthday") || 'off'
    const currentDate = new Date()
    const today = currentDate.setHours(0, 0, 0, 0)
    const tx = db.transaction(['payment_rents', 'payment_bills', 'boarders'], 'readonly')

    // Payment Due Reminder
    if(paymentDueDaysBefore !== 'off'){
      const paymentRentsStore = tx.objectStore('payment_rents')
      const paymentBillsStore = tx.objectStore('payment_bills')

      // Payment Rent
      paymentRentsStore.openCursor().onsuccess = function(e) {
        const cursor = e.target.result
        if(cursor) {
          const paymentRent = cursor.value
          const dueDate = new Date(paymentRent.due_date)
          const reminderDate = new Date(dueDate.getTime() - (Number(paymentDueDaysBefore) * 24 * 60 * 60 * 1000)).setHours(0, 0, 0, 0)
          const description = `Rent payment is due on ${dateFriendly(paymentRent.due_date)} with code: ${paymentRent.payment_code}.`
          reminderCreateIfNotExists(db, today, reminderDate, 'payment_rent', paymentRent.payment_rent_id, description)
          cursor.continue()
        }
      }

      // Payment Bill
      paymentBillsStore.openCursor().onsuccess = function(e) {
        const cursor = e.target.result
        if(cursor) {
          const paymentBill = cursor.value
          const dueDate = new Date(paymentBill.due_date)
          const reminderDate = new Date(dueDate.getTime() - (Number(paymentDueDaysBefore) * 24 * 60 * 60 * 1000)).setHours(0, 0, 0, 0)
          const description = `Bill payment is due on ${dateFriendly(paymentBill.due_date)} with code: ${paymentBill.payment_code}.`
          reminderCreateIfNotExists(db, today, reminderDate, 'payment_bill', paymentBill.payment_bill_id, description)
          cursor.continue()
        }
      }
    }

    // Birthday Reminder
    if(birthdayDaysBefore !== 'off'){
      const boardersStore = tx.objectStore('boarders')
      boardersStore.openCursor().onsuccess = function(e) {
        const cursor = e.target.result
        if(cursor) {
          const boarder = cursor.value

          if(boarder.birth_date !== '') {
            const birthDate = new Date(boarder.birth_date)
            birthDate.setFullYear(new Date().getFullYear())
            const reminderDate = new Date(birthDate.getTime() - (Number(birthdayDaysBefore) * 24 * 60 * 60 * 1000)).setHours(0, 0, 0, 0)
            const fullName = (
                `${boarder.first_name} ${boarder.middle_name} ${boarder.last_name} ${boarder.suffix}`
              ).replace(/\s+/g, ' ')
              .trim();
            const boarderName = `${boarder.nickname} - ${fullName}`
            const callAs = boarder.sex === 'Male' ? ['he', 'his'] : ['she', 'her']
            const description = `${boarderName}'s birthday is on ${dateFriendly(boarder.birth_date)} and ${callAs[0]} will celebrate ${callAs[1]} ${getAge(boarder.birth_date)}th birthday on ${dateFriendly(`${currentDate.getFullYear()}-${currentDate.getMonth()+1}-${currentDate.getDate()}`)}, turning ${getAge(boarder.birth_date)} years old.`
            reminderCreateIfNotExists(db, today, reminderDate, 'boarder', boarder.boarder_id, description)
          }
          cursor.continue()
        }
      }
    }
  })
}