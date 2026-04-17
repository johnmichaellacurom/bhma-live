import {toast} from '../backend/index.js'
import {updateStorageBar} from '../backend/database.js'

// Shared IndexedDB connection
export function openDatabase() {
  return new Promise((resolve, reject) => {
    // open or create database
    // if there is a new columns or tables just increment the version by 1 to update the database
    const request = indexedDB.open('bhma', 1) 

    request.onupgradeneeded = function(e) {
      const db = e.target.result

      // create rooms
      if (!db.objectStoreNames.contains('rooms')) {
        const roomsStore = db.createObjectStore('rooms', {
          keyPath: 'room_id',
          autoIncrement: true
        });
        roomsStore.createIndex('status', 'status', {unique: false})
        roomsStore.createIndex('room_name', 'room_name', {unique: true})
        roomsStore.createIndex('total_lower_beds', 'total_lower_beds', {unique: false})
        roomsStore.createIndex('lower_beds_left', 'lower_beds_left', {unique: false})
        roomsStore.createIndex('total_upper_beds', 'total_upper_beds', {unique: false})
        roomsStore.createIndex('upper_beds_left', 'upper_beds_left', {unique: false})
        roomsStore.createIndex('notes', 'notes', {unique: false})
        roomsStore.createIndex('last_modified', 'last_modified', {unique: false})
        roomsStore.createIndex('date_created', 'date_created', {unique: false})
      }

      // create boarders
      if (!db.objectStoreNames.contains('boarders')) {
        const boardersStore = db.createObjectStore('boarders', {
          keyPath: 'boarder_id',
          autoIncrement: true
        })
        boardersStore.createIndex('status', 'status', {unique: false})
        boardersStore.createIndex('first_name', 'first_name', {unique: false})
        boardersStore.createIndex('middle_name', 'middle_name', {unique: false})
        boardersStore.createIndex('last_name', 'last_name', {unique: false})
        boardersStore.createIndex('suffix', 'suffix', {unique: false})
        boardersStore.createIndex('nickname', 'nickname', {unique: false})
        boardersStore.createIndex('birth_date', 'birth_date', {unique: false})
        boardersStore.createIndex('sex', 'sex', {unique: false})
        boardersStore.createIndex('address', 'address', {unique: false})
        boardersStore.createIndex('mobile_no', 'mobile_no', {unique: false})
        boardersStore.createIndex('facebook_acc', 'facebook_acc', {unique: false})
        boardersStore.createIndex('notes', 'notes', {unique: false})
        boardersStore.createIndex('last_modified', 'last_modified', {unique: false})
        boardersStore.createIndex('date_created', 'date_created', {unique: false})

        // ✅ compound index for counting by status + sex
        boardersStore.createIndex('status_sex', ['status', 'sex'], { unique: false})
      }

      // create belongings
      if (!db.objectStoreNames.contains('belongings')) {
        const belongingsStore = db.createObjectStore('belongings', {
          keyPath: 'belonging_id',
          autoIncrement: true
        })
        belongingsStore.createIndex('status', 'status', {unique: false})
        belongingsStore.createIndex('belonging_name', 'belonging_name', {unique: true})
        belongingsStore.createIndex('belonging_type', 'belonging_type', {unique: false})
        belongingsStore.createIndex('charge', 'charge', {unique: false})
        belongingsStore.createIndex('notes', 'notes', {unique: false})
        belongingsStore.createIndex('last_modified', 'last_modified', {unique: false})
        belongingsStore.createIndex('date_created', 'date_created', {unique: false})
      }

      // create rents
      if (!db.objectStoreNames.contains('rents')) {
        const rentsStore = db.createObjectStore('rents', {
          keyPath: 'rent_id',
          autoIncrement: true
        })
        rentsStore.createIndex('rent_code', 'rent_code', {unique: true})
        rentsStore.createIndex('status', 'status', {unique: false})
        rentsStore.createIndex('boarder_id', 'boarder_id', {unique: false}) // FK - reference to boardersStore
        rentsStore.createIndex('room_id', 'room_id', {unique: false}) // FK - reference to roomsStore
        rentsStore.createIndex('bed_level', 'bed_level', {unique: false})
        rentsStore.createIndex('rent_type', 'rent_type', {unique: false})
        rentsStore.createIndex('discount_percent', 'discount_percent', {unique: false})
        rentsStore.createIndex('check_in', 'check_in', {unique: false})
        rentsStore.createIndex('check_out', 'check_out', {unique: false})
        rentsStore.createIndex('notes', 'notes', {unique: false})
        rentsStore.createIndex('last_modified', 'last_modified', {unique: false})
        rentsStore.createIndex('date_created', 'date_created', {unique: false})
      }

      // create rent belongings
      if (!db.objectStoreNames.contains('rent_belongings')) {
        const rentBelongingsStore = db.createObjectStore('rent_belongings', {
          keyPath: 'rent_belonging_id',
          autoIncrement: true
        })
        rentBelongingsStore.createIndex('rent_id', 'rent_id', {unique: false}) // FK - reference to rentsStore
        rentBelongingsStore.createIndex('belonging_id', 'belonging_id', {unique: false}) // FK - reference to belongingsStore
        rentBelongingsStore.createIndex('checked', 'checked', {unique: false})
        rentBelongingsStore.createIndex('last_modified', 'last_modified', {unique: false})
        rentBelongingsStore.createIndex('date_created', 'date_created', {unique: false})
      }

      // create bills
      if (!db.objectStoreNames.contains('bills')) {
        const billsStore = db.createObjectStore('bills', {
          keyPath: 'bill_id',
          autoIncrement: true
        })
        billsStore.createIndex('bill_code', 'bill_code', {unique: true})
        billsStore.createIndex('status', 'status', {unique: false})
        billsStore.createIndex('bill_type', 'bill_type', {unique: false})
        billsStore.createIndex('room_name', 'room_name', {unique: false})
        billsStore.createIndex('start_period', 'start_period', {unique: false})
        billsStore.createIndex('end_period', 'end_period', {unique: false})
        billsStore.createIndex('due_date', 'due_date', {unique: false})
        billsStore.createIndex('amount', 'amount', {unique: false})
        billsStore.createIndex('remaining', 'remaining', {unique: false})
        billsStore.createIndex('late_fees', 'late_fees', {unique: false})
        billsStore.createIndex('notes', 'notes', {unique: false})
        billsStore.createIndex('last_modified', 'last_modified', {unique: false})
        billsStore.createIndex('date_created', 'date_created', {unique: false})
      }

      // create payment rents
      if (!db.objectStoreNames.contains('payment_rents')) {
        const paymentRentsStore = db.createObjectStore('payment_rents', {
          keyPath: 'payment_rent_id',
          autoIncrement: true
        })
        paymentRentsStore.createIndex('boarder_id', 'boarder_id', {unique: false}) // FK - reference to boardersStore
        paymentRentsStore.createIndex('payment_code', 'payment_code', {unique: true})
        paymentRentsStore.createIndex('status', 'status', {unique: false})
        paymentRentsStore.createIndex('rent_id', 'rent_id', {unique: false}) // FK - reference to rentsStore
        paymentRentsStore.createIndex('start_period', 'start_period', {unique: false})
        paymentRentsStore.createIndex('end_period', 'end_period', {unique: false})
        paymentRentsStore.createIndex('amount_due', 'amount_due', {unique: false})
        paymentRentsStore.createIndex('discount_amount', 'discount_amount', {unique: false})
        paymentRentsStore.createIndex('due_date', 'due_date', {unique: false})
        paymentRentsStore.createIndex('late_fee', 'late_fee', {unique: false})
        paymentRentsStore.createIndex('total_amount_due', 'total_amount_due', {unique: false})
        paymentRentsStore.createIndex('payment_datetime', 'payment_datetime', {unique: false})
        paymentRentsStore.createIndex('payment_method', 'payment_method', {unique: false})
        paymentRentsStore.createIndex('notes', 'notes', {unique: false})
        paymentRentsStore.createIndex('last_modified', 'last_modified', {unique: false})
        paymentRentsStore.createIndex('date_created', 'date_created', {unique: false})
      }

      // create payment bills
      if (!db.objectStoreNames.contains('payment_bills')) {
        const paymentBillsStore = db.createObjectStore('payment_bills', {
          keyPath: 'payment_bill_id',
          autoIncrement: true
        })
        paymentBillsStore.createIndex('boarder_id', 'boarder_id', {unique: false})
        paymentBillsStore.createIndex('payment_code', 'payment_code', {unique: true})
        paymentBillsStore.createIndex('status', 'status', {unique: false})
        paymentBillsStore.createIndex('rent_id', 'rent_id', {unique: false})
        paymentBillsStore.createIndex('bill_id', 'bill_id', {unique: false})
        paymentBillsStore.createIndex('start_period', 'start_period', {unique: false})
        paymentBillsStore.createIndex('end_period', 'end_period', {unique: false})
        paymentBillsStore.createIndex('amount_due', 'amount_due', {unique: false})
        paymentBillsStore.createIndex('belongings', 'belongings', {unique: false})
        paymentBillsStore.createIndex('due_date', 'due_date', {unique: false})
        paymentBillsStore.createIndex('late_fee', 'late_fee', {unique: false})
        paymentBillsStore.createIndex('total_amount_due', 'total_amount_due', {unique: false})
        paymentBillsStore.createIndex('payment_datetime', 'payment_datetime', {unique: false})
        paymentBillsStore.createIndex('payment_method', 'payment_method', {unique: false})
        paymentBillsStore.createIndex('notes', 'notes', {unique: false})
        paymentBillsStore.createIndex('last_modified', 'last_modified', {unique: false})
        paymentBillsStore.createIndex('date_created', 'date_created', {unique: false})
      }

      // create reminders
      if(!db.objectStoreNames.contains('reminders')){
        const remindersStore = db.createObjectStore('reminders', {
          keyPath: 'reminder_id',
          autoIncrement: true
        })
        remindersStore.createIndex('morph_type', 'morph_type', {unique: false})
        remindersStore.createIndex('morph_id', 'morph_id', {unique: false})
        remindersStore.createIndex('description', 'description', {unique: false})
        remindersStore.createIndex('read_at', 'read_at', {unique: false})
        remindersStore.createIndex('date_created', 'date_created', {unique: false})

        remindersStore.createIndex('morph_type_morph_id', ['morph_type', 'morph_id'], { unique: false})
      }
    }

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// database date time
export function dateTimeDatabase() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Manila' }).replace('T', ' ')
}

// database date
export function dateDatabase(){
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'Asia/Manila'
  }).split(' ')[0];
}

// format money
export function formatMoney(value) {
  return Number(value).toLocaleString('en-PH', {
    minimumFractionDigits: 2
  })
}

// format money reverse remove comma (,)
export function formatMoneyReverse(value){
  return value.replace(/,/g, '')
}

// user friendly date for users
export function dateTimeFriendly(datetime){
  if (!datetime) return '-'; // or '—' to show blank instead of crashing

  // Convert to Date object
  const date = new Date(datetime.replace(" ", "T"));

  // Format options
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };

  // Convert to friendly string
  return date.toLocaleString('en-PH', options);
}

// user friendly date for users
export function dateFriendly(dateString){
   if (!dateString) return '-';

  // Convert to Date object
  const d = new Date(dateString.replace(" ", "T"));

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  return d.toLocaleDateString('en-PH', options);
}

// compute for end period
export function endPeriod(date, days) {
  const d = new Date(date.split("T")[0] + "T00:00:00"); // prevent timezone shift
  d.setDate(d.getDate() + Number(days) + 1);

  return d.toISOString().split("T")[0]; // format to YYYY-MM-DD
}

// format numbers with comma
export function formatNumber(value) {
  return Number(value).toLocaleString('en-PH', {
    minimumFractionDigits: 0
  })
}

// activation code
export function formattedActivationCode(activationCode, secretKey){

  // Get local date
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const dateNow = `${year}-${month}-${day}`;

  if(activationCode && secretKey){
    let bytes = CryptoJS.AES.decrypt(activationCode, secretKey);
    let decrypted = bytes.toString(CryptoJS.enc.Utf8);
  
    if(!decrypted) return false  
    
    const activationDate = decrypted.split('_')[0]
    const activationDuration = decrypted.split('_')[1]
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}_${activationDuration}`;
  
    if(dateNow !== activationDate) return false
    localStorage.setItem('activation_code', formatted)
    return true
  } else { // for default activation 
    localStorage.setItem('activation_code', `${year}-${month}-${day}T${hours}:${minutes}_15`)
    return true
  }
}

$(document).ready(function() {
  openDatabase().then(() => {
    updateStorageBar()
  }).catch(() => toast('error', 'Database error.'))
})