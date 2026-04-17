import {toast} from '../../../backend/index.js'
import {openDatabase, formatMoney, formatMoneyReverse, dateTimeDatabase, dateTimeFriendly, dateFriendly} from '../../../indexdb/database.js'

export function addBillModal(){

  function getNumberOfRegularRents(room){
    openDatabase().then(db => {

      const [roomId, roomName] = [
        Number(room.substring(0, room.indexOf('-'))),
        room.substring(room.indexOf('-')+1)
      ]
      
      const txRoom = db.transaction('rents', 'readonly')
      const storeRoom = txRoom.objectStore('rents')
      let numberOfRegularRents = 0

      storeRoom.openCursor().onsuccess = (e) => {
        const cursor = e.target.result

        if(cursor){
          if(room === ''){ // for all boarders if room is empty
            if(cursor.value.rent_type === "Regular" && cursor.value.status === "Ongoing"){
              numberOfRegularRents+=1
            }
          } else{ // for boarders specific room name
            if(cursor.value.room_id === roomId && cursor.value.rent_type === "Regular" && cursor.value.status === "Ongoing"){
              numberOfRegularRents+=1
            }
          }
          cursor.continue()
        } else{
          $('#addBillModalNumberOngoingRegularRents').html(`
            <span id='addBillModalNumberOngoingRegularRentsData' class='${(Number(numberOfRegularRents) > 0 ? 'alert-success' : 'alert-danger')} m-0 alert' data-number-ongoing-regular-rents='${numberOfRegularRents}'>Number of ongoing regular rents: ${numberOfRegularRents}</span>
          `)
        }
      }
    }).catch(() => {
      toast('error', 'Database error.')
    })
  }

  $(document).off('click', '#addBillModalOpen').on('click', '#addBillModalOpen', function() {
    $('#addBillModalBody').load('pages/please_wait.html')

    setTimeout(() => {
      $('#addBillModalBody').load('pages/extensions/bills/addModalForm.html', function() {
        openDatabase().then(db => {
          const txRoom = db.transaction('rooms', 'readonly')
          const storeRoom = txRoom.objectStore('rooms')
          const allRoomsActive = []
          storeRoom.openCursor().onsuccess = function(e) {
            const cursor = e.target.result

            if(cursor) {
              const room = cursor.value
              const matchStatus = room.status === 'Active'
              if(matchStatus)
                allRoomsActive.push(room)
              cursor.continue()
            } else {
              allRoomsActive.sort((a, b) => {
                return a.room_name.localeCompare(b.room_name)
              })

              if(allRoomsActive.length > 0){
                allRoomsActive.forEach(roomActive => {
                  $('#addBillModalRoomName').append(`
                    <option value="${roomActive.room_id}-${roomActive.room_name}">${roomActive.room_name}</option>
                  `)
                })
              }

              getNumberOfRegularRents('') // no parameters means 'all'
            }
          }

        }).catch(() => toast('error', 'Database error.'))
      })
      
    }, TIMEOUT_MS)
  })

  $(document).off('click', '#addBillModalRoomTypeAll').on('click', '#addBillModalRoomTypeAll', function() {
    if($(this)[0].checked){
      $('#addBillModalRoomName').val('')
      $('#addBillModalRoomName').addClass('d-none')
      $('#addBillModalRoomName').prop('required', false)
      $('#addBillModalNumberOngoingRegularRents').removeClass('d-none')
      getNumberOfRegularRents('')
    }
  })

  $(document).off('click', '#addBillModalRoomTypeSpecific').on('click', '#addBillModalRoomTypeSpecific', function() {
    if($(this)[0].checked){
      $('#addBillModalRoomName').removeClass('d-none')
      $('#addBillModalRoomName').prop('required', true)      
      $('#addBillModalNumberOngoingRegularRents').addClass('d-none')
    }
  })

  $(document).off('change', '#addBillModalRoomName').on('change', '#addBillModalRoomName', function() {
    if($(this).val().trim() === '') 
      return $('#addBillModalNumberOngoingRegularRents').addClass('d-none')

    $('#addBillModalNumberOngoingRegularRents').removeClass('d-none')
    getNumberOfRegularRents($(this).val().trim())
  })

  // bill amount
  $(document).off('focus', '#addBillModalAmount').on('focus', '#addBillModalAmount', function() {
    $(this).val(formatMoneyReverse($(this).val()))
    $(this).attr('type', 'number')
  })
  $(document).off('blur', '#addBillModalAmount').on('blur', '#addBillModalAmount', function() {
    if($(this).val().trim() === '') return
    $(this).attr('type', 'text')
    $(this).val(formatMoney($(this).val()))
  })

  function notesOnBlur(){
    $(document).off('blur', '#addBillModalNotes').on('blur', '#addBillModalNotes', function() {
      $('#addBillModalNotes').val($(this).val().trim())
    })
  } notesOnBlur()

  function submitForm(){
    $(document).off('submit', '#addBillModalForm').on('submit', '#addBillModalForm', function(e){
      e.preventDefault();

      if(!confirm('Are you sure you want to submit?')) return

      function activateButton(status){
        switch(status){
          case true:
            $('#addBillModalSubmit').prop('disabled', true)
            $('#addBillModalSubmit .spinner-border').removeClass('visually-hidden')
            break;
          default:
            $('#addBillModalSubmit').prop('disabled', false)
            $('#addBillModalSubmit .spinner-border').addClass('visually-hidden')
            break;
        } 
      }      
      const numberOfRegularRents = $('#addBillModalNumberOngoingRegularRentsData').attr('data-number-ongoing-regular-rents')
      if(Number(numberOfRegularRents) <= 0){
        return toast('error', 'Number of ongoing regular rents must be greater than 0.')
      }
      activateButton(true)

      setTimeout(() => {
        const DATETIME_DATABASE = dateTimeDatabase().replace(/[-:]/g, '').split(' ')
        const billCode = `BL${DATETIME_DATABASE[0]}-${DATETIME_DATABASE[1]}`
        const [isBillTypeElectric, billTypeElectricValue] = [$('#addBillModalBillTypeElectric')[0].checked, $('#addBillModalBillTypeElectric').val().trim()]
        const [billTypeWaterValue] = [$('#addBillModalBillTypeWater').val().trim()]

        const [isRoomTypeSpecific] = [$('#addBillModalRoomTypeSpecific')[0].checked]
        const [roomId, roomName] = [
          $('#addBillModalRoomName').val().substring(0, $('#addBillModalRoomName').val().indexOf('-')),
          $('#addBillModalRoomName').val().substring($('#addBillModalRoomName').val().indexOf('-') + 1)
        ]

        const startPeriodDate = $('#addBillModalStartPeriod').val().trim()
        const endPeriodDate = $('#addBillModalEndPeriod').val().trim()
        const dueDate = $('#addBillModalDueDate').val().trim()
        const amountDue = formatMoneyReverse($('#addBillModalAmount').val().trim())
        const notes = $('#addBillModalNotes').val().trim()

        const bill = {
          bill_code: billCode,
          status: 'Unpaid',
          bill_type: isBillTypeElectric ? billTypeElectricValue : billTypeWaterValue,
          room_name: isRoomTypeSpecific ? roomName : 'All',
          start_period: startPeriodDate,
          end_period: endPeriodDate,
          due_date: dueDate,
          amount: amountDue,
          remaining: amountDue,
          late_fees: '',
          notes: notes,
          last_modified: dateTimeDatabase(),
          date_created: dateTimeDatabase()
        }

        openDatabase().then(db => {
          const tx = db.transaction('bills', 'readwrite')
          const store = tx.objectStore('bills')
          const request = store.add(bill)
          let lastInsertedBillId

          request.onsuccess = (event) => {
            lastInsertedBillId = event.target.result
          }

          tx.oncomplete = () => {            
            const bilingAmountPerCycleTransient = Number(formatMoneyReverse(localStorage.getItem('settings-boarders-billing-amount-per-cycle-transient') || '50.00'))
            const electricPercent = Number(localStorage.getItem('settings-boarders-billing-amount-per-cycle-electric-percent-transient') || 20)
            const waterPercent = Number(localStorage.getItem('settings-boarders-billing-amount-per-cycle-water-percent-transient') || 0)

            if (isRoomTypeSpecific) {
              if (isBillTypeElectric) { // Electric Bill
                let regularsCount = 0
                let ongoingRentsTransientCount = 0
                let belongingsRegularsTotalAmount = 0
                let pendingRegulars = 0
                let belongingsRegularsRent = []

                const txRent = db.transaction('rents', 'readonly')
                const storeRent = txRent.objectStore('rents')
                storeRent.openCursor().onsuccess = (e) => {
                  const cursor = e.target.result
                  if (cursor) {
                    if (
                      cursor.value.status === "Ongoing" &&
                      cursor.value.rent_type === 'Regular' &&
                      cursor.value.room_id == roomId
                    ) {
                      regularsCount++
                      pendingRegulars++

                      const rentId = cursor.value.rent_id
                      const boarderId = cursor.value.boarder_id
                      let perRentBelongings = 0
                      let pendingBelongings = 0
                      let rbDone = false 

                      const txRB = db.transaction(['rent_belongings', 'belongings'], 'readonly')
                      const storeRB = txRB.objectStore('rent_belongings')
                      const storeB = txRB.objectStore('belongings')
                      storeRB.openCursor().onsuccess = (e1) => {
                        const rbCursor = e1.target.result
                        if (rbCursor) {
                          if (
                            rbCursor.value.rent_id === rentId &&
                            rbCursor.value.checked == '1'
                          ) {
                            pendingBelongings++
                            const getReq = storeB.get(rbCursor.value.belonging_id)
                            getReq.onsuccess = () => {
                              perRentBelongings += Number(getReq.result.charge)
                              pendingBelongings--
                              if (rbDone && pendingBelongings === 0) finishRent()
                            }
                          }
                          rbCursor.continue()
                        } else {
                          rbDone = true
                          if (pendingBelongings === 0) finishRent()
                        }
                      }

                      function finishRent() {
                        belongingsRegularsRent.push({
                          boarderId: boarderId,
                          rentId: rentId,
                          billId: lastInsertedBillId,
                          belongingsTotalAmount: perRentBelongings,
                        })

                        belongingsRegularsTotalAmount += perRentBelongings
                        pendingRegulars--
                        if (pendingRegulars === 0) finalize()
                      }

                    } else if (
                      cursor.value.status === "Ongoing" &&
                      cursor.value.rent_type === 'Transient' &&
                      cursor.value.room_id == roomId
                    ) {
                      ongoingRentsTransientCount++
                    }

                    cursor.continue()
                  }
                }

                function finalize() {
                  const totalBill = Number(amountDue)
                  const transientDiscount = (bilingAmountPerCycleTransient * ongoingRentsTransientCount) * (electricPercent / 100) 
                  const DATETIME_DATABASE = dateTimeDatabase().replace(/[-:]/g, '').split(' ')
                  const paymentCodeBase = `PB${DATETIME_DATABASE[0]}-${DATETIME_DATABASE[1]}`
                  let totalAmountDueAllBoarders = 0

                  for(let i=0; i<belongingsRegularsRent.length; i++){
                    const paymentCode = `${paymentCodeBase}-${belongingsRegularsRent[i].rentId}`

                    const partialPerRegular = Number(belongingsRegularsRent[i].belongingsTotalAmount) / belongingsRegularsTotalAmount * totalBill
                    const discountRatio = (totalBill < transientDiscount) ? totalBill / transientDiscount : transientDiscount / totalBill
                    const totalAmountDue = partialPerRegular * (1 - discountRatio)
                    totalAmountDueAllBoarders += totalAmountDue

                    const paymentBills = {
                      boarder_id: belongingsRegularsRent[i].boarderId,
                      payment_code: paymentCode,
                      status: 'Unpaid',
                      rent_id: belongingsRegularsRent[i].rentId,
                      bill_id: belongingsRegularsRent[i].billId,
                      start_period: startPeriodDate,
                      end_period: endPeriodDate,
                      belongings: belongingsRegularsRent[i].belongingsTotalAmount.toFixed(2),
                      amount_due: totalAmountDue.toFixed(2),
                      due_date: dueDate,
                      late_fee: '',
                      total_amount_due: totalAmountDue.toFixed(2),
                      payment_datetime: '',
                      payment_method: '',
                      notes: '',
                      last_modified: dateTimeDatabase(),
                      date_created: dateTimeDatabase()
                    }
                    const txPaymentBills = db.transaction('payment_bills', 'readwrite')
                    const storePaymentBills = txPaymentBills.objectStore('payment_bills')
                    storePaymentBills.add(paymentBills)
                  }             

                  // update the remaining balance
                  const billUpdate = {
                    bill_id: parseInt(lastInsertedBillId),
                    bill_code: billCode,
                    status: 'Unpaid',
                    bill_type: isBillTypeElectric ? billTypeElectricValue : billTypeWaterValue,
                    room_name: isRoomTypeSpecific ? roomName : 'All',
                    start_period: startPeriodDate,
                    end_period: endPeriodDate,
                    due_date: dueDate,
                    amount: amountDue,
                    remaining: totalAmountDueAllBoarders.toFixed(2),
                    late_fees: '',
                    notes: notes,
                    last_modified: dateTimeDatabase(),
                    date_created: dateTimeDatabase()
                  }
                  const txBillUpdate = db.transaction('bills', 'readwrite')
                  const store = txBillUpdate.objectStore('bills')
                  store.put(billUpdate)
                  
                }
              } else { // water bill
                let regularsCount = 0
                let ongoingRentsTransientCount = 0
                let belongingsRegularsRent = []

                const txRent = db.transaction('rents', 'readonly')
                const storeRent = txRent.objectStore('rents')

                storeRent.openCursor().onsuccess = (e) => {
                  const cursor = e.target.result

                  if (cursor) {

                    if (
                      cursor.value.status === "Ongoing" &&
                      cursor.value.rent_type === 'Regular' &&
                      cursor.value.room_id == roomId
                    ) {

                      regularsCount++

                      belongingsRegularsRent.push({
                        boarderId: cursor.value.boarder_id,
                        rentId: cursor.value.rent_id,
                        billId: lastInsertedBillId
                      })

                    } else if (
                      cursor.value.status === "Ongoing" &&
                      cursor.value.rent_type === 'Transient' &&
                      cursor.value.room_id == roomId
                    ) {
                      ongoingRentsTransientCount++
                    }

                    cursor.continue()

                  } else {
                    finalize()
                  }
                }

                function finalize() {
                  const totalBill = Number(amountDue)
                  const transientDiscount = ongoingRentsTransientCount * (bilingAmountPerCycleTransient * (waterPercent / 100))

                  const DATETIME_DATABASE = dateTimeDatabase().replace(/[-:]/g, '').split(' ')
                  const paymentCodeBase = `PB${DATETIME_DATABASE[0]}-${DATETIME_DATABASE[1]}`
                  let totalAmountDueAllBoarders = 0

                  for (let i = 0; i < belongingsRegularsRent.length; i++) {
                    const paymentCode = `${paymentCodeBase}-${belongingsRegularsRent[i].rentId}`

                    const partialPerRegular = totalBill / regularsCount 
                    const discountRatio = (totalBill < transientDiscount) ? totalBill / transientDiscount : transientDiscount / totalBill
                    const totalAmountDue = partialPerRegular * (1 - discountRatio)
                    totalAmountDueAllBoarders += totalAmountDue

                    const paymentBills = {
                      boarder_id: belongingsRegularsRent[i].boarderId,
                      payment_code: paymentCode,
                      status: 'Unpaid',
                      rent_id: belongingsRegularsRent[i].rentId,
                      bill_id: belongingsRegularsRent[i].billId,
                      start_period: startPeriodDate,
                      end_period: endPeriodDate,
                      amount_due: totalAmountDue.toFixed(2),
                      belongings: '',
                      due_date: dueDate,
                      late_fee: '',
                      total_amount_due: totalAmountDue.toFixed(2),
                      payment_datetime: '',
                      payment_method: '',
                      notes: '',
                      last_modified: dateTimeDatabase(),
                      date_created: dateTimeDatabase()
                    }

                    db.transaction('payment_bills', 'readwrite')
                      .objectStore('payment_bills')
                      .add(paymentBills)
                  }

                  // update the remaining balance
                  const billUpdate = {
                    bill_id: parseInt(lastInsertedBillId),
                    bill_code: billCode,
                    status: 'Unpaid',
                    bill_type: isBillTypeElectric ? billTypeElectricValue : billTypeWaterValue,
                    room_name: isRoomTypeSpecific ? roomName : 'All',
                    start_period: startPeriodDate,
                    end_period: endPeriodDate,
                    due_date: dueDate,
                    amount: amountDue,
                    remaining: totalAmountDueAllBoarders.toFixed(2),
                    late_fees: '',
                    notes: notes,
                    last_modified: dateTimeDatabase(),
                    date_created: dateTimeDatabase()
                  }
                  const txBillUpdate = db.transaction('bills', 'readwrite')
                  const store = txBillUpdate.objectStore('bills')
                  store.put(billUpdate)
                }
              }
            } else { // All rooms
              if(isBillTypeElectric){ // Electric Bill
                let regularsCount = 0
                let ongoingRentsTransientCount = 0
                let belongingsRegularsTotalAmount = 0
                let pendingRegulars = 0
                let belongingsRegularsRent = []

                const txRent = db.transaction('rents', 'readonly')
                const storeRent = txRent.objectStore('rents')
                storeRent.openCursor().onsuccess = (e) => {
                  const cursor = e.target.result
                  if (cursor) {
                    if (
                      cursor.value.status === "Ongoing" &&
                      cursor.value.rent_type === 'Regular'
                    ) {
                      regularsCount++
                      pendingRegulars++

                      const rentId = cursor.value.rent_id
                      const boarderId = cursor.value.boarder_id
                      let perRentBelongings = 0
                      let pendingBelongings = 0
                      let rbDone = false 

                      const txRB = db.transaction(['rent_belongings', 'belongings'], 'readonly')
                      const storeRB = txRB.objectStore('rent_belongings')
                      const storeB = txRB.objectStore('belongings')
                      storeRB.openCursor().onsuccess = (e1) => {
                        const rbCursor = e1.target.result
                        if (rbCursor) {
                          if (
                            rbCursor.value.rent_id === rentId &&
                            rbCursor.value.checked == '1'
                          ) {
                            pendingBelongings++
                            const getReq = storeB.get(rbCursor.value.belonging_id)
                            getReq.onsuccess = () => {
                              perRentBelongings += Number(getReq.result.charge)
                              pendingBelongings--
                              if (rbDone && pendingBelongings === 0) finishRent()
                            }
                          }
                          rbCursor.continue()
                        } else {
                          rbDone = true
                          if (pendingBelongings === 0) finishRent()
                        }
                      }

                      function finishRent() {
                        belongingsRegularsRent.push({
                          boarderId: boarderId,
                          rentId: rentId,
                          billId: lastInsertedBillId,
                          belongingsTotalAmount: perRentBelongings,
                        })
                        belongingsRegularsTotalAmount += perRentBelongings
                        pendingRegulars--
                        if (pendingRegulars === 0) finalize()
                      }
                    } else if (
                      cursor.value.status === "Ongoing" &&
                      cursor.value.rent_type === 'Transient'
                    ) {
                      ongoingRentsTransientCount++
                    }
                    cursor.continue()
                  }
                }

                function finalize() {
                  const totalBill = Number(amountDue)
                  const transientDiscount = (bilingAmountPerCycleTransient * ongoingRentsTransientCount) * (electricPercent / 100)
                  
                  const DATETIME_DATABASE = dateTimeDatabase().replace(/[-:]/g, '').split(' ')
                  const paymentCodeBase = `PB${DATETIME_DATABASE[0]}-${DATETIME_DATABASE[1]}`
                  let totalAmountDueAllBoarders = 0

                  for(let i=0; i<belongingsRegularsRent.length; i++){
                    const paymentCode = `${paymentCodeBase}-${belongingsRegularsRent[i].rentId}`

                    const partialPerRegular = Number(belongingsRegularsRent[i].belongingsTotalAmount) / belongingsRegularsTotalAmount * totalBill
                    const discountRatio = (totalBill < transientDiscount) ? totalBill / transientDiscount : transientDiscount / totalBill
                    const totalAmountDue = partialPerRegular * (1 - discountRatio)
                    totalAmountDueAllBoarders += totalAmountDue

                    const paymentBills = {
                      boarder_id: belongingsRegularsRent[i].boarderId,
                      payment_code: paymentCode,
                      status: 'Unpaid',
                      rent_id: belongingsRegularsRent[i].rentId,
                      bill_id: belongingsRegularsRent[i].billId,
                      start_period: startPeriodDate,
                      end_period: endPeriodDate,
                      belongings: belongingsRegularsRent[i].belongingsTotalAmount.toFixed(2),
                      amount_due: totalAmountDue.toFixed(2),
                      due_date: dueDate,
                      late_fee: '',
                      total_amount_due: totalAmountDue.toFixed(2),
                      payment_datetime: '',
                      payment_method: '',
                      notes: '',
                      last_modified: dateTimeDatabase(),
                      date_created: dateTimeDatabase()
                    }
                    const txPaymentBills = db.transaction('payment_bills', 'readwrite')
                    const storePaymentBills = txPaymentBills.objectStore('payment_bills')
                    storePaymentBills.add(paymentBills)
                  }       
                      
                  // update the remaining balance
                  const billUpdate = {
                    bill_id: parseInt(lastInsertedBillId),
                    bill_code: billCode,
                    status: 'Unpaid',
                    bill_type: isBillTypeElectric ? billTypeElectricValue : billTypeWaterValue,
                    room_name: isRoomTypeSpecific ? roomName : 'All',
                    start_period: startPeriodDate,
                    end_period: endPeriodDate,
                    due_date: dueDate,
                    amount: amountDue,
                    remaining: totalAmountDueAllBoarders.toFixed(2),
                    late_fees: '',
                    notes: notes,
                    last_modified: dateTimeDatabase(),
                    date_created: dateTimeDatabase()
                  }
                  const txBillUpdate = db.transaction('bills', 'readwrite')
                  const store = txBillUpdate.objectStore('bills')
                  store.put(billUpdate)
                  
                }

              } else { // Water Bill
                let regularsCount = 0
                let ongoingRentsTransientCount = 0
                let belongingsRegularsRent = []

                const txRent = db.transaction('rents', 'readonly')
                const storeRent = txRent.objectStore('rents')

                storeRent.openCursor().onsuccess = (e) => {
                  const cursor = e.target.result
                  if (cursor) {
                    if (
                      cursor.value.status === "Ongoing" &&
                      cursor.value.rent_type === 'Regular'
                    ) {
                      regularsCount++
                      belongingsRegularsRent.push({
                        boarderId: cursor.value.boarder_id,
                        rentId: cursor.value.rent_id,
                        billId: lastInsertedBillId
                      })

                    } else if (
                      cursor.value.status === "Ongoing" &&
                      cursor.value.rent_type === 'Transient'
                    ) {
                      ongoingRentsTransientCount++
                    }
                    cursor.continue()
                  } else {
                    finalize()
                  }
                }

                function finalize() {
                  const totalBill = Number(amountDue)
                  const transientDiscount = ongoingRentsTransientCount * (bilingAmountPerCycleTransient * (waterPercent / 100))

                  const DATETIME_DATABASE = dateTimeDatabase().replace(/[-:]/g, '').split(' ')
                  const paymentCodeBase = `PB${DATETIME_DATABASE[0]}-${DATETIME_DATABASE[1]}`
                  let totalAmountDueAllBoarders = 0

                  for (let i = 0; i < belongingsRegularsRent.length; i++) {
                    const paymentCode = `${paymentCodeBase}-${belongingsRegularsRent[i].rentId}`

                    const partialPerRegular = totalBill / regularsCount 
                    const discountRatio = (totalBill < transientDiscount) ? totalBill / transientDiscount : transientDiscount / totalBill
                    const totalAmountDue = partialPerRegular * (1 - discountRatio)
                    totalAmountDueAllBoarders += totalAmountDue

                    const paymentBills = {
                      boarder_id: belongingsRegularsRent[i].boarderId,
                      payment_code: paymentCode,
                      status: 'Unpaid',
                      rent_id: belongingsRegularsRent[i].rentId,
                      bill_id: belongingsRegularsRent[i].billId,
                      start_period: startPeriodDate,
                      end_period: endPeriodDate,
                      amount_due: totalAmountDue.toFixed(2),
                      belongings: '',
                      due_date: dueDate,
                      late_fee: '',
                      total_amount_due: totalAmountDue.toFixed(2),
                      payment_datetime: '',
                      payment_method: '',
                      notes: '',
                      last_modified: dateTimeDatabase(),
                      date_created: dateTimeDatabase()
                    }

                    db.transaction('payment_bills', 'readwrite')
                      .objectStore('payment_bills')
                      .add(paymentBills)
                  }

                  // update the remaining balance
                  const billUpdate = {
                    bill_id: parseInt(lastInsertedBillId),
                    bill_code: billCode,
                    status: 'Unpaid',
                    bill_type: isBillTypeElectric ? billTypeElectricValue : billTypeWaterValue,
                    room_name: isRoomTypeSpecific ? roomName : 'All',
                    start_period: startPeriodDate,
                    end_period: endPeriodDate,
                    due_date: dueDate,
                    amount: amountDue,
                    remaining: totalAmountDueAllBoarders.toFixed(2),
                    late_fees: '',
                    notes: notes,
                    last_modified: dateTimeDatabase(),
                    date_created: dateTimeDatabase()
                  }
                  const txBillUpdate = db.transaction('bills', 'readwrite')
                  const store = txBillUpdate.objectStore('bills')
                  store.put(billUpdate)
                }
              }
            }        
            
            $('#addBillModalButtonClose')[0].click()
            $('#tableBillsNoBillsFound').remove()
            toast('success', 'Successfully added.')
            activateButton(false)
            $('#addBillModalForm')[0].reset()
            $('#tableBills').prepend(`
              <tr data-bs-toggle="modal" data-bs-target="#viewEditBillModal" id="viewEditBillModal${lastInsertedBillId}" class="view-edit-bill-modal" data-bill-id="${lastInsertedBillId}" data-date-created="${bill.date_created}">
                <td class='bg-primary-subtle'>${bill.bill_code}</td>
                <td class='bg-primary-subtle'><span class="badge ${
                  bill.status === 'Unpaid' ? 'text-bg-warning' : (
                    bill.status === 'Partially' ? 'text-bg-info' : (
                      bill.status === 'Paid' ? 'text-bg-success' : (
                        bill.status === 'Overdue' ? 'text-bg-danger' : 'text-bg-primary'
                      )
                    )
                  )
                }">${bill.status}</span></td>
                <td class='bg-primary-subtle'>${bill.bill_type}</td>
                <td class='bg-primary-subtle'>${bill.room_name}</td>
                <td class='bg-primary-subtle'>${dateFriendly(bill.start_period)}</td>
                <td class='bg-primary-subtle'>${dateFriendly(bill.end_period)}</td>
                <td class='bg-primary-subtle'>${dateFriendly(bill.due_date)}</td>
                <td class='bg-primary-subtle'>${formatMoney(bill.amount)}</td>
                <td class='bg-primary-subtle'>${formatMoney(bill.remaining)}</td>
                <td class='bg-primary-subtle'>${formatMoney(bill.late_fees)}</td>
                <td class='bg-primary-subtle'>${bill.notes}</td>
                <td class='bg-primary-subtle'>${dateTimeFriendly(bill.last_modified)}</td>
                <td class='bg-primary-subtle'>${dateTimeFriendly(bill.date_created)}</td>
              </tr>
            `)
          }
        }).catch(() => {
          toast('error', 'Database error.')
          activateButton(false)
        })
      }, TIMEOUT_MS)
    })
  } submitForm()
}