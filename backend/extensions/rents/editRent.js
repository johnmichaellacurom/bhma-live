import {toast} from '../../../backend/index.js'
import {openDatabase, formatMoney, formatMoneyReverse, dateTimeDatabase, dateDatabase,  dateTimeFriendly, endPeriod} from '../../../indexdb/database.js'
import { loadBoarders } from '../boarders/loadBoarders.js'
import { loadPaymentRents } from '../payments/rent/loadPaymentRents.js'

export function viewEditRentModalViewPayments(){
  $(document).off('click', '#viewEditRentModalViewPayments').on('click', '#viewEditRentModalViewPayments', () => {
    $('#viewEditRentModalButtonClose')[0].click()
    
    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#paymentsNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#paymentsNavLink').addClass('active')

    $('#mainContent').load('pages/please_wait.html')

    const rentId = Number($('#viewEditRentModalViewPayments').attr('data-rent-id'));
    const entriesPerPage = Number(localStorage.getItem('settings-payments-entries-per-page')) || 10
    const currentPage = 1
    const offset = 0
    const showFrom = 1
    const showTo = entriesPerPage
    const status = ''
    const sort = 'Ascending'
    const method = ''  
    const search = rentId

    sessionStorage.setItem('payment-rents-current-page', currentPage)
    sessionStorage.setItem('payment-rents-offset', offset)
    sessionStorage.setItem('payment-rents-show-from', showFrom)
    sessionStorage.setItem('payment-rents-show-to', showTo)
    sessionStorage.setItem('payment-rents-status', status)
    sessionStorage.setItem('payment-rents-sort', sort)
    sessionStorage.setItem('payment-rents-payment-method', method)
    sessionStorage.setItem('payment-rents-search', search)
    setTimeout(() => {
      $('#mainContent').load("pages/payments.html", () => {
        $('#paymentsContentDisplay').load("pages/extensions/payments/rent/contentDisplay.html", () => {

          loadPaymentRents(entriesPerPage, offset, currentPage, showFrom, showTo, status, sort, method, search, true)

          $('#viewEditPaymentModalNavLinkRent').addClass('active')
          $('#viewEditPaymentModalNavLinkRent').attr('aria-current', 'page')
          $('#viewEditPaymentModalNavLinkRent').prop('disabled', true)   

          $('#viewEditPaymentModalNavLinkBill').removeClass('active')
          $('#viewEditPaymentModalNavLinkBill').removeAttr('aria-current')
          $('#viewEditPaymentModalNavLinkBill').prop('disabled', false)

          $(document).off('click', '#viewEditPaymentModalNavLinkRent').on('click', '#viewEditPaymentModalNavLinkRent', function() {
            $(this).addClass('active')
            $(this).attr('aria-current', 'page')
            $(this).prop('disabled', true)

            $('#viewEditPaymentModalNavLinkBill').removeClass('active')
            $('#viewEditPaymentModalNavLinkBill').removeAttr('aria-current')
            $('#viewEditPaymentModalNavLinkBill').prop('disabled', false)

            $('#paymentsContentDisplay').load('pages/please_wait.html')
            setTimeout(() => {
              $('#paymentsContentDisplay').load('pages/extensions/payments/rent/contentDisplay.html')
            }, TIMEOUT_MS)
          })

          $(document).off('click', '#viewEditPaymentModalNavLinkBill').on('click', '#viewEditPaymentModalNavLinkBill', function() {
            $(this).addClass('active')
            $(this).attr('aria-current', 'page')
            $(this).prop('disabled', true)

            $('#viewEditPaymentModalNavLinkRent').removeClass('active')
            $('#viewEditPaymentModalNavLinkRent').removeAttr('aria-current')
            $('#viewEditPaymentModalNavLinkRent').prop('disabled', false)          

            $('#paymentsContentDisplay').load('pages/please_wait.html')
            setTimeout(() => {
              $('#paymentsContentDisplay').load('pages/extensions/payments/bill/contentDisplay.html')
            }, TIMEOUT_MS)
          })
        })
      });
    }, TIMEOUT_MS);
  })
}

export function viewEditRentModalBoarderName(){
  $(document).off('click', '#viewEditRentModalBoarderName').on('click', '#viewEditRentModalBoarderName', () => {
    $('#viewEditRentModalButtonClose')[0].click()

    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#boardersNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#boardersNavLink').addClass('active')

    $('#mainContent').load('pages/please_wait.html')

    const boarderId = Number($('#viewEditRentModalBoarderName').attr('data-boarder-id'));
    const entriesPerPage = Number(localStorage.getItem('settings-boarders-entries-per-page')) || 10
    const currentPage = 1
    const offset = 0
    const showFrom = 1
    const showTo = entriesPerPage
    const status = ''
    const sort = 'Ascending'
    const sex = ''  
    const search = boarderId

    sessionStorage.setItem('boarders-current-page', currentPage)
    sessionStorage.setItem('boarders-offset', offset)
    sessionStorage.setItem('boarders-show-from', showFrom)
    sessionStorage.setItem('boarders-show-to', showTo)
    sessionStorage.setItem('boarders-status', status)
    sessionStorage.setItem('boarders-sort', sort)
    sessionStorage.setItem('boarders-sex', sex)
    sessionStorage.setItem('boarders-search', search)
    setTimeout(() => {
      $('#mainContent').load("pages/boarders.html", () => {
        loadBoarders(entriesPerPage, offset, currentPage, showFrom, showTo, status, sort, sex, search, true)
      });
    }, TIMEOUT_MS);
  })
}

export function viewEditRentModal(){
  let id, dateCreated, currentBedLevel, currentRoomId

  $(document).off('click', '.view-edit-rent-modal').on('click', '.view-edit-rent-modal', function() {
    id = $(this).attr('data-rent-id')
    dateCreated = $(this).attr('data-date-created')
    $('#viewEditRentModalBody').load('pages/please_wait.html')

    setTimeout(() => {
      $('#viewEditRentModalBody').load('pages/extensions/rents/viewEditModalForm.html', function() {
        openDatabase().then(db => {

          const txRent = db.transaction('rents', 'readonly')
          const storeRent = txRent.objectStore('rents')
          const getRequestRent = storeRent.get(parseInt(id))
          getRequestRent.onsuccess = () => {
            const rent = getRequestRent.result
            currentBedLevel = rent.bed_level
            currentRoomId = rent.room_id

            const currentStatus = rent.status

            if(currentStatus === "Completed" || currentStatus === "Unpaid" || currentStatus === 'On Break'){
              $('#viewEditRentModalFields').removeClass('d-none')
              $('#viewEditRentModalCheckOutDiv').removeClass('d-none')
              $('#viewEditRentModalCheckOut').prop('required', true)
            }

            $('#viewEditRentModalRentCode').val(rent.rent_code)
            $('#viewEditRentModalViewPayments').attr('data-rent-id', rent.rent_id)           

            // boarder
            const txBoarder = db.transaction('boarders', 'readonly')
            const storeBoarder = txBoarder.objectStore('boarders')
            const getRequestBoarder = storeBoarder.get(parseInt(rent.boarder_id))
            getRequestBoarder.onsuccess = () => {
              const boarder = getRequestBoarder.result
              const fullName = (
                  `${boarder.first_name} ${boarder.middle_name} ${boarder.last_name} ${boarder.suffix}`
                ).replace(/\s+/g, ' ')
                .trim();
              $('#viewEditRentModalBoarderName').text(`${boarder.nickname} - ${fullName}`)
              $('#viewEditRentModalBoarderName').attr('data-boarder-id', `${rent.boarder_id}`)
              
              submitForm(rent.boarder_id)
            }

            // rent belongings
            const txRentBelonging = db.transaction("rent_belongings", "readonly");
            const storeRentBelonging = txRentBelonging.objectStore("rent_belongings");
            const index = storeRentBelonging.index("rent_id");

            const detailsBelongings = [];
            const request = index.openCursor(IDBKeyRange.only(Number(rent.rent_id)));
            request.onsuccess = (e) => {
              const cursor = e.target.result;
              if (cursor) {
                const rentBelongings = cursor.value
                const txBelonging = db.transaction('belongings', 'readonly')
                const storeBelonging = txBelonging.objectStore('belongings')

                if(rentBelongings.checked == '1'){
                  // get the existing Belonging
                  const getRequestBelonging = storeBelonging.get(parseInt(rentBelongings.belonging_id))
                  getRequestBelonging.onsuccess = () => {
                    detailsBelongings.push(getRequestBelonging.result)
                  }
                }
                cursor.continue(); // get next
              } 
            }

            const txBelonging = db.transaction('belongings', 'readonly')
            const storeBelonging = txBelonging.objectStore('belongings')
            const allBelongingsActive = []
            storeBelonging.openCursor().onsuccess = function(e) {
              const cursor = e.target.result

              if(cursor){
                const belonging = cursor.value
                const matchStatus = belonging.status === 'Active'
                if(matchStatus)
                  allBelongingsActive.push(belonging)
                cursor.continue()
              } else {
                allBelongingsActive.sort((a, b) => {
                  return a.belonging_name.localeCompare(b.belonging_name)
                })

                $('#viewEditRentModalBelongings').html('')
                let finalBelongings = []
                if(allBelongingsActive.length > 0){
                  allBelongingsActive.forEach(belongingActive => {

                    detailsBelongings.forEach(detailsBelonging => {
                      if(belongingActive.belonging_id == detailsBelonging.belonging_id){
                        finalBelongings.push({
                          checked: true,
                          id: belongingActive.belonging_id,
                          name: belongingActive.belonging_name,
                          charge: belongingActive.charge
                        })
                      }
                    })

                    const exists = finalBelongings.some(item => item.id === belongingActive.belonging_id)
                    if(!exists){
                      finalBelongings.push({
                        checked: false,
                        id: belongingActive.belonging_id,
                        name: belongingActive.belonging_name,
                        charge: belongingActive.charge
                      })
                    }
                  })

                  finalBelongings.forEach(finalBelonging => {
                    $('#viewEditRentModalBelongings').append(`
                      <div class="d-flex align-items-center justify-content-center gap-1 flex-column alert alert-secondary mb-0">
                        <div class="d-flex align-items-center justify-content-center">
                          <input ${rent.status === 'On Break' || rent.status === 'Unpaid' || rent.status === "Completed" ? 'disabled' : ''} ${finalBelonging.checked ? 'checked' : ''} type="checkbox" value="${finalBelonging.id}-${finalBelonging.name}" class="form-check-input m-0 view-edit-rent-modal-belonging" id="viewEditRentModalBelongings${finalBelonging.id}"><label for="viewEditRentModalBelongings${finalBelonging.id}" class="form-label m-0">${finalBelonging.name}</label>
                        </div>
                        <span>${formatMoney(finalBelonging.charge)} PHP</span>
                      </div>
                    `)
                  })
                }
              }
            }

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

                $('#viewEditRentModalRoomLowerBedsLeft').html('')
                $('#viewEditRentModalRoomUpperBedsLeft').html('')
                if(allRoomsActive.length > 0){
                  allRoomsActive.forEach(roomActive => {
                    $('#viewEditRentModalRoom').append(`
                      <option ${rent.room_id == roomActive.room_id ? 'selected' : ''} value="${roomActive.room_id}-${roomActive.room_name}">${roomActive.room_name}</option>
                    `)
                    
                    if(currentStatus === "Ongoing"){
                      $('#viewEditRentModalRoomLowerBedsLeft').append(`
                        <span class='${(Number(roomActive.lower_beds_left) > 0 ? 'alert-success' : 'alert-danger')} ${rent.room_id == roomActive.room_id ? '' : 'd-none'} m-0 alert view-edit-rent-lower-beds-left view-edit-rent-lower-beds-left-room-id-${roomActive.room_id}' data-lower-beds-left='${roomActive.lower_beds_left}'>Lower beds left: ${roomActive.lower_beds_left}</span>
                      `)
                      $('#viewEditRentModalRoomUpperBedsLeft').append(`
                        <span class='${(Number(roomActive.upper_beds_left) > 0 ? 'alert-success' : 'alert-danger')} ${rent.room_id == roomActive.room_id ? '' : 'd-none'} m-0 alert view-edit-rent-upper-beds-left view-edit-rent-upper-beds-left-room-id-${roomActive.room_id}' data-upper-beds-left='${roomActive.upper_beds_left}'>Upper beds left: ${roomActive.upper_beds_left}</span>
                      `)
                    }

                    if(rent.room_id == roomActive.room_id){
                      $('#viewEditRentModalRoomBedsLeft').removeClass('d-none')    

                      $('.view-edit-rent-lower-beds-left').addClass('d-none')
                      $(`.view-edit-rent-lower-beds-left-room-id-${rent.room_id}`).removeClass('d-none')
                      const lowerBedsLeft = Number($(`.view-edit-rent-lower-beds-left-room-id-${rent.room_id}`).attr('data-lower-beds-left'))
                      if(lowerBedsLeft > 0 || rent.bed_level === "Lower"){
                        $('#viewEditRentModalBedLevel').append(`<option ${rent.bed_level === "Lower" ? 'selected' : ''} value="Lower">Lower</option>`)
                      }

                      $('.view-edit-rent-upper-beds-left').addClass('d-none')
                      $(`.view-edit-rent-upper-beds-left-room-id-${rent.room_id}`).removeClass('d-none')
                      const upperBedsLeft = Number($(`.view-edit-rent-upper-beds-left-room-id-${rent.room_id}`).attr('data-upper-beds-left'))
                      if(upperBedsLeft > 0 || rent.bed_level === "Upper"){
                        $('#viewEditRentModalBedLevel').append(`<option ${rent.bed_level === "Upper" ? 'selected' : ''} value="Upper">Upper</option>`)
                      }
                    }
                    
                  })
                }
              }
            }

            // rent type
            if(rent.rent_type === "Regular"){
              $('#viewEditRentModalRentTypeRegular').prop('checked', true)
              $('#viewEditRentModalRentTypeTransient').prop('checked', false)
            } else {
              $('#viewEditRentModalRentTypeRegular').prop('checked', false)
              $('#viewEditRentModalRentTypeTransient').prop('checked', true)
            }
            
            $('#viewEditRentModalDiscount').val(rent.discount_percent)
            $('#viewEditRentModalCheckIn').val(dateTimeFriendly(rent.check_in))
            $('#viewEditRentModalNotes').val(rent.notes)
            $('#viewEditRentModalLastModified').val(dateTimeFriendly(rent.last_modified))
            $('#viewEditRentModalDateCreated').val(dateTimeFriendly(rent.date_created))
            viewEditRentModalDetails(rent.status, false, rent.check_out)
          }


        }).catch(() => toast('error', 'Database error.'))
      })
      
    }, TIMEOUT_MS)
  })

  function notesOnBlur(){
    $(document).off('blur', '#viewEditRentModalNotes').on('blur', '#viewEditRentModalNotes', function() {
      $('#viewEditRentModalNotes').val($(this).val().trim())
    })
  } notesOnBlur()

  $(document).off('change', '#viewEditRentModalRoom').on('change', '#viewEditRentModalRoom', function() {
    const roomId = $(this).val().substring(0, $(this).val().indexOf('-'))

    $('#viewEditRentModalBedLevel').html('')
    if(roomId === undefined || roomId == '' || roomId === null){
      $('#viewEditRentModalRoomBedsLeft').addClass('d-none')
      return
    } 

    $('#viewEditRentModalRoomBedsLeft').removeClass('d-none')    

    $('.view-edit-rent-lower-beds-left').addClass('d-none')
    $(`.view-edit-rent-lower-beds-left-room-id-${roomId}`).removeClass('d-none')
    const lowerBedsLeft = Number($(`.view-edit-rent-lower-beds-left-room-id-${roomId}`).attr('data-lower-beds-left'))
    if(lowerBedsLeft > 0){
      $('#viewEditRentModalBedLevel').append('<option value="Lower">Lower</option>')
    }

    $('.view-edit-rent-upper-beds-left').addClass('d-none')
    $(`.view-edit-rent-upper-beds-left-room-id-${roomId}`).removeClass('d-none')
    const upperBedsLeft = Number($(`.view-edit-rent-upper-beds-left-room-id-${roomId}`).attr('data-upper-beds-left'))
    if(upperBedsLeft > 0){
      $('#viewEditRentModalBedLevel').append('<option value="Upper">Upper</option>')
    }
  })

  $(document).off('change', '#viewEditRentModalLikeToDo').on('change', '#viewEditRentModalLikeToDo', function() {
    const likeToDo = $(this).val().trim()

    $(this).prop('disabled', true)

    $('#viewEditRentModalFields').removeClass('d-none')

    if(likeToDo !== "Ongoing"){
      $('#viewEditRentModalFields input, select').prop('disabled', true)
      $('#viewEditRentModalCheckOut').prop('disabled', false)
    }

    viewEditRentModalDetails(likeToDo, true, null)
  })

  function viewEditRentModalDetails(status, isRentModalLikeTodo, rentCheckOut){
    switch(isRentModalLikeTodo){
      case true:
        let modalAlert = '<span class="text">After this action, you can update the fields at any time.</span>'    
        $('#viewEditRentModalAlert .text').remove()

        if(status === "Ongoing"){          
          $('#viewEditRentModalCheckOutDiv').addClass('d-none')
          $('#viewEditRentModalCheckOut').prop('required', false)
          $('#viewEditRentModalUpdate .status').text('Update')
          $('#viewEditRentModalUpdate')
            .addClass('btn-primary')
            .removeClass('btn-warning btn-success')
          modalAlert = '<span class="text">After this action, you can update the fields at any time.</span>'
    
        } else if (status === 'On Break') {
          $('#viewEditRentModalCheckOutDiv').addClass('d-none')
          $('#viewEditRentModalCheckOut').prop('required', false)
          $('#viewEditRentModalUpdate .status').text('Mark as On Break')
          $('#viewEditRentModalUpdate')
            .addClass('btn-primary')
            .removeClass('btn-warning btn-success')
          modalAlert = '<span class="text">After this action, you can change the status to Ongoing.</span>'

        } else {
          $('#viewEditRentModalCheckOutDiv').removeClass('d-none')
          $('#viewEditRentModalCheckOut').prop('required', true)

          if(status === "Unpaid"){
            $('#viewEditRentModalUpdate')
              .addClass('btn-warning')
              .removeClass('btn-primary btn-success')
            $('#viewEditRentModalUpdate .status').text('Set as Unpaid')
            modalAlert = '<span class="text">After this action, you cannot change the fields anymore, but you can still change the status to Complete.</span>'
          } else {
            $('#viewEditRentModalUpdate')
              .addClass('btn-success')
              .removeClass('btn-warning btn-primary')
            $('#viewEditRentModalUpdate .status').text('Mark as Complete')
            modalAlert = '<span class="text">After this action, all fields can no longer be changed.</span>'
          }
        }

        $('#viewEditRentModalAlert').append(modalAlert)   
        break;
      case false:
        if(status === "Ongoing"){
          $('#viewEditRentModalStatus')
            .text(status)
            .addClass('text-bg-info')
            .removeClass('text-bg-warning text-bg-success text-bg-primary')

        } else { 
          $('#viewEditRentModalCheckOut')
            .attr('type', 'text')
            .val(dateTimeFriendly(rentCheckOut))
            .removeAttr('required')
            .prop('disabled', true)
          $('#viewEditRentModalNotes')
            .removeAttr('required')
            .prop('disabled', status === "Completed")          
          $('#viewEditRentModalAlert').addClass('d-none')
          $('#viewEditRentModalRoom').prop('disabled', true)
          $('#viewEditRentModalBedLevel').prop('disabled', true)
          $('#viewEditRentModalRentTypeRegular').prop('disabled', true)
          $('#viewEditRentModalRentTypeTransient').prop('disabled', true)
          $('#viewEditRentModalDiscount').prop('disabled', true)

          if(status === 'On Break'){
             $('#viewEditRentModalLikeToDo')
              .val('Ongoing')
              .prop('disabled', true)
            $('#viewEditRentModalStatus')
              .text(status)
              .addClass('text-bg-primary')
              .removeClass('text-bg-warning text-bg-success text-bg-info')
            $('#viewEditRentModalUpdate .status')
              .text('Ongoing')

          } else if(status === "Unpaid"){
            $('#viewEditRentModalLikeToDo')
              .val('Completed')
              .prop('disabled', true)
            $('#viewEditRentModalStatus')
              .text(status)
              .addClass('text-bg-warning')
              .removeClass('text-bg-info text-bg-success text-bg-primary')
            $('#viewEditRentModalUpdate .status')
              .text('Mark as Complete')
            $('#viewEditRentModalUpdate')
              .prop('disabled', false)
              .removeClass('d-none btn-warning btn-primary')
              .addClass('btn-success')

          } else {
            $('#viewEditRentModalLikeToDoDiv')
              .addClass('d-none')
            $('#viewEditRentModalStatus')
              .text(status)
              .addClass('text-bg-success')
              .removeClass('text-bg-info text-bg-warning text-bg-primary')
            $('#viewEditRentModalUpdate')
              .prop('disabled', true)
              .addClass('d-none')
          }
        }
        break;
    }
  }

  function submitForm(boarderId){
    $(document).off('submit', '#viewEditRentModalForm').on('submit', '#viewEditRentModalForm', function(e){
      e.preventDefault();

      const rentStatus = $('#viewEditRentModalStatus').text()
      const likeToDo = $('#viewEditRentModalLikeToDo').val()
      let confirmMessage = ''
      
      if(rentStatus === 'Ongoing'){
        confirmMessage = (likeToDo === 'Ongoing') ? 'Update' : (
          (likeToDo === 'On Break') ? 'Mark as On Break' : (
            (likeToDo === 'Unpaid') ? 'Set as Unpaid' : 'Mark as Complete'
          )    
        )
      } else if (rentStatus === 'On Break'){
        confirmMessage = 'Set as Ongoing'
      } else if(rentStatus === 'Unpaid') {
        confirmMessage = 'Mark as Compete'
      } 

      if(!confirm(`Are you sure you want to ${confirmMessage}?`)) return

      function activateButton(status){
        switch(status){
          case true:
            $('#viewEditRentModalUpdate').prop('disabled', true)
            $('#viewEditRentModalUpdate .spinner-border').removeClass('visually-hidden')
            break;
          default:
            $('#viewEditRentModalUpdate').prop('disabled', false)
            $('#viewEditRentModalUpdate .spinner-border').addClass('visually-hidden')
            break;
        } 
      }
      activateButton(true)

      setTimeout(() => {        
        const [roomId, roomName] = [
          Number($('#viewEditRentModalRoom').val().substring(0, $('#viewEditRentModalRoom').val().indexOf('-'))),
          $('#viewEditRentModalRoom').val().substring($('#viewEditRentModalRoom').val().indexOf('-')+1)
        ]
        const bedLevel = $('#viewEditRentModalBedLevel').val().trim()
        const [isRentTypeRegular, rentTypeRegularValue] = [$('#viewEditRentModalRentTypeRegular')[0].checked, $('#viewEditRentModalRentTypeRegular').val()]
        const [rentTypeTransientValue] = [$('#viewEditRentModalRentTypeTransient').val()]
        const discountPercent = $('#viewEditRentModalDiscount').val().trim()
        const checkOut = $('#viewEditRentModalCheckOut').val()
        const notes = $('#viewEditRentModalNotes').val().trim()

        openDatabase().then(db => {
          // Rent
          const tx = db.transaction('rents', 'readwrite')
          const store = tx.objectStore('rents')
          const getRequest = store.get(parseInt(id))
          getRequest.onsuccess = () => {
            const rent = getRequest.result
            if(rent){
              // generate re-payment if the status set to Ongoing from On Break
              if(rent.status === "On Break") {
                const DATETIME_DATABASE = dateTimeDatabase().replace(/[-:]/g, '').split(' ')
                const paymentCode = `PR${DATETIME_DATABASE[0]}-${DATETIME_DATABASE[1]}`
                const startPeriodDate = dateDatabase()
                const endPeriodDate = endPeriod(startPeriodDate,
                  (isRentTypeRegular) ? 
                    (localStorage.getItem('settings-boarders-billing-cycle-regular') || 30) :
                    (localStorage.getItem('settings-boarders-billing-cycle-transient') || 1)
                )
                const amountDue = Number((isRentTypeRegular) ? (formatMoneyReverse(localStorage.getItem('settings-boarders-billing-amount-per-cycle-regular') || '700.00')) : (formatMoneyReverse(localStorage.getItem('settings-boarders-billing-amount-per-cycle-transient') || '50.00'))).toFixed(2)
                const discountAmount = (amountDue * (Number(rent.discount_percent) / 100)).toFixed(2)
                const dueDate = endPeriodDate
                const totalAmountDue = (amountDue - discountAmount).toFixed(2)
                db.transaction('payment_rents', 'readwrite').objectStore('payment_rents').add({
                  boarder_id: boarderId,
                  payment_code: paymentCode,
                  status: 'Unpaid',
                  rent_id: id,
                  start_period: startPeriodDate,
                  end_period: endPeriodDate,
                  amount_due: amountDue,
                  discount_amount: discountAmount,
                  due_date: dueDate,
                  late_fee: '',
                  total_amount_due: totalAmountDue,
                  payment_datetime: '',
                  payment_method: '',
                  notes: '',
                  last_modified: dateTimeDatabase(),
                  date_created: dateTimeDatabase()
                })
              }

              rent.status = likeToDo
              rent.room_id = roomId
              rent.bed_level = bedLevel
              rent.rent_type = isRentTypeRegular ? rentTypeRegularValue : rentTypeTransientValue
              rent.discount_percent = discountPercent
              rent.check_out = checkOut
              rent.notes = notes
              rent.last_modified = dateTimeDatabase()
              store.put(rent)              

              if(likeToDo === "Completed"){
                const txRoom = db.transaction('rooms', 'readwrite')
                const storeRoom = txRoom.objectStore('rooms')
                const getRequestRoom = storeRoom.get(parseInt(roomId))
                getRequestRoom.onsuccess = () => {
                  const resultRoom = getRequestRoom.result
                  if(resultRoom){
                    switch(currentBedLevel){
                      case 'Lower':
                        resultRoom.lower_beds_left = String(Number(resultRoom.lower_beds_left) + 1)
                        break;
                      case 'Upper':
                        resultRoom.upper_beds_left = String(Number(resultRoom.upper_beds_left) + 1)
                        break;
                    }
                    storeRoom.put(resultRoom)
                  }
                }

              } else if(currentRoomId == roomId && currentBedLevel != bedLevel){
                const txRoom = db.transaction('rooms', 'readwrite')
                const storeRoom = txRoom.objectStore('rooms')
                const getRequestRoom = storeRoom.get(parseInt(roomId))
                getRequestRoom.onsuccess = () => {
                  const resultRoom = getRequestRoom.result
                  if(resultRoom){
                    switch(bedLevel){
                      case 'Lower':
                        resultRoom.lower_beds_left = String(Number(resultRoom.lower_beds_left) - 1)
                        resultRoom.upper_beds_left = String(Number(resultRoom.upper_beds_left) + 1)
                        break;
                      case 'Upper':
                        resultRoom.lower_beds_left = String(Number(resultRoom.lower_beds_left) + 1)
                        resultRoom.upper_beds_left = String(Number(resultRoom.upper_beds_left) - 1)
                        break;
                    }
                    storeRoom.put(resultRoom)
                  }
                }

              } else if(currentRoomId != roomId){
                // return the number of beds left to the current 
                const txRoomCurrent = db.transaction('rooms', 'readwrite')
                const storeRoomCurrent = txRoomCurrent.objectStore('rooms')
                const getRequestRoomCurrent = storeRoomCurrent.get(currentRoomId)
                getRequestRoomCurrent.onsuccess = () => {
                  const resultRoomCurrent = getRequestRoomCurrent.result
                  if(resultRoomCurrent){
                    switch(currentBedLevel){
                      case 'Lower':
                        resultRoomCurrent.lower_beds_left = String(Number(resultRoomCurrent.lower_beds_left) + 1)
                        break;
                      case 'Upper':
                        resultRoomCurrent.upper_beds_left = String(Number(resultRoomCurrent.upper_beds_left) + 1)
                        break;
                    }
                    storeRoomCurrent.put(resultRoomCurrent)
                  }
                }

                // set the new room and bed level
                const txRoomNew = db.transaction('rooms', 'readwrite')
                const storeRoomNew = txRoomNew.objectStore('rooms')
                const getRequestRoomNew = storeRoomNew.get(roomId)
                getRequestRoomNew.onsuccess = () => {
                  const resultRoomNew = getRequestRoomNew.result
                  if(resultRoomNew){
                    switch(bedLevel){
                      case 'Lower':
                        resultRoomNew.lower_beds_left = String(Number(resultRoomNew.lower_beds_left) - 1)
                        break;
                      case 'Upper':
                        resultRoomNew.upper_beds_left = String(Number(resultRoomNew.upper_beds_left) - 1)
                        break;
                    }
                    storeRoomNew.put(resultRoomNew)
                  }
                }
              }        

              // belonging
              const txRentBelonging = db.transaction('rent_belongings', 'readwrite')
              const storeRentBelonging = txRentBelonging.objectStore('rent_belongings')
              const allBelongingNames = []

              // STEP 1 — set all to 0
              const index = storeRentBelonging.index('rent_id'); // must have index on rent_id
              const range = IDBKeyRange.only(Number(id));

              index.openCursor(range).onsuccess = e => {
                const cursor = e.target.result;
                if (cursor) {
                  const record = cursor.value;
                  record.checked = '0';
                  record.last_modified = dateTimeDatabase();
                  cursor.update(record).onsuccess = () => {
                    cursor.continue();
                  };

                } else {

                  // STEP 2 — now check checked checkboxes
                  $('.view-edit-rent-modal-belonging').each(function () {
                    if ($(this)[0].checked) {

                      const [belongingId, belongingName] = [
                        Number($(this).val().substring(0, $(this).val().indexOf('-'))),
                        $(this).val().substring($(this).val().indexOf('-') + 1)
                      ]

                      allBelongingNames.push(" "+belongingName)

                      // NEW LOGIC (no variable replaced, nothing removed)
                      let exists = false;

                      const txCheck = db.transaction('rent_belongings', 'readwrite');
                      const storeCheck = txCheck.objectStore('rent_belongings');
                      const indexCheck = storeCheck.index('rent_id');
                      const rangeCheck = IDBKeyRange.only(Number(id));

                      indexCheck.openCursor(rangeCheck).onsuccess = ev => {
                        const cur = ev.target.result;

                        if (cur) {
                          const rec = cur.value;

                          if (rec.belonging_id === belongingId) {
                            exists = true;
                            rec.checked = '1';
                            rec.last_modified = dateTimeDatabase();
                            cur.update(rec);
                          }

                          cur.continue();
                        } else {

                          // if not exists → ADD NEW (your original behavior)
                          if (!exists) {
                            storeCheck.add({
                              rent_id: Number(id),
                              belonging_id: belongingId,
                              checked: '1',
                              last_modified: dateTimeDatabase(),
                              date_created: dateTimeDatabase()
                            });
                          }

                        }
                      };

                    }
                  });

                  $('#viewEditRentModalButtonClose')[0].click()
                  toast('success', `Successfully ${
                      likeToDo === 'Ongoing' ? 'Updated.' : (
                        likeToDo === 'On Break' ? 'mark as On Break.' : (
                          likeToDo === 'Unpaid' ? 'set as Unpaid.' : 'mark as Completed.'
                        )
                      )
                    }`
                  )

                  activateButton(false)
                  $(`#viewEditRentModal${id}`).html(`
                    <td class='bg-primary-subtle'>${rent.rent_code}</td>
                    <td class='bg-primary-subtle'><span class='badge ${
                      likeToDo === 'Ongoing' ? 'text-bg-info' : (
                        likeToDo === 'On Break' ? 'text-bg-primary' : (
                          likeToDo === 'Unpaid' ? 'text-bg-warning' : 'text-bg-success'
                        )
                      )
                    }'>${likeToDo}</span></td>
                    <td class='bg-primary-subtle'>${$('#viewEditRentModalBoarderName').text()}</td>
                    <td class='bg-primary-subtle'>${allBelongingNames}</td>
                    <td class='bg-primary-subtle'>${roomName}</td>
                    <td class='bg-primary-subtle'>${bedLevel}</td>
                    <td class='bg-primary-subtle'>${isRentTypeRegular ? rentTypeRegularValue : rentTypeTransientValue}</td>
                    <td class='bg-primary-subtle'>${discountPercent}</td>
                    <td class='bg-primary-subtle'>${dateTimeFriendly(rent.check_in)}</td>
                    <td class='bg-primary-subtle'>${dateTimeFriendly(checkOut)}</td>
                    <td class='bg-primary-subtle'>${notes}</td>
                    <td class='bg-primary-subtle'>${dateTimeFriendly(dateTimeDatabase())}</td>
                    <td class='bg-primary-subtle'>${dateTimeFriendly(rent.date_created)}</td>
                  `)
                }
              }
            }
          }
        }).catch(() => {
          toast('error', 'Database error.')
          activateButton(false)
        })
      }, TIMEOUT_MS)
    })
  } 
}