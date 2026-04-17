import {toast} from '../../../backend/index.js'
import {openDatabase, formatMoney, formatMoneyReverse, dateTimeDatabase, dateTimeFriendly, endPeriod} from '../../../indexdb/database.js'

export function addRentModal(){
  $(document).off('click', '#addRentModalOpen').on('click', '#addRentModalOpen', function() {
    $('#addRentModalBody').load('pages/please_wait.html')

    setTimeout(() => {
      $('#addRentModalBody').load('pages/extensions/rents/addModalForm.html', function() {

        openDatabase().then(db => {   
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

              $('#addRentModalBelongings').html('')
              if(allBelongingsActive.length > 0){
                allBelongingsActive.forEach(belongingActive => {
                  $('#addRentModalBelongings').append(`
                    <div class="d-flex align-items-center justify-content-center gap-1 flex-column alert alert-secondary mb-0">
                      <div class="d-flex align-items-center justify-content-center">
                        <input type="checkbox" value="${belongingActive.belonging_id}-${belongingActive.belonging_name}" class="form-check-input m-0 add-rent-modal-belonging" id="addRentModalBelongings${belongingActive.belonging_id}"><label for="addRentModalBelongings${belongingActive.belonging_id}" class="form-label m-0">${belongingActive.belonging_name}</label>
                      </div>
                      <span>${formatMoney(belongingActive.charge)} PHP</span>
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

              $('#addRentModalRoomLowerBedsLeft').html('')
              $('#addRentModalRoomUpperBedsLeft').html('')
              if(allRoomsActive.length > 0){
                allRoomsActive.forEach(roomActive => {
                  $('#addRentModalRoom').append(`
                    <option value="${roomActive.room_id}-${roomActive.room_name}">${roomActive.room_name}</option>
                  `)
                  
                  $('#addRentModalRoomLowerBedsLeft').append(`
                    <span class='${(Number(roomActive.lower_beds_left) > 0 ? 'alert-success' : 'alert-danger')} m-0 alert add-rent-lower-beds-left add-rent-lower-beds-left-room-id-${roomActive.room_id}' data-lower-beds-left='${roomActive.lower_beds_left}'>Lower beds left: ${roomActive.lower_beds_left}</span>
                  `)
                  $('#addRentModalRoomUpperBedsLeft').append(`
                    <span class='${(Number(roomActive.upper_beds_left) > 0 ? 'alert-success' : 'alert-danger')} m-0 alert add-rent-upper-beds-left add-rent-upper-beds-left-room-id-${roomActive.room_id}' data-upper-beds-left='${roomActive.upper_beds_left}'>Upper beds left: ${roomActive.upper_beds_left}</span>
                  `)
                })
              }
            }
          }

        }).catch(() => toast('error', 'Database error.'))
      })
      
    }, TIMEOUT_MS)
  })

  $(document).off('input', '#addRentModalSearchBoarderName').on('input', '#addRentModalSearchBoarderName', function () { 
    const search = $(this).val().trim()

    if(search.length < 3){
      return $('#addRentModalBoarderName').html('<option value="" selected>Please input at least 3 characters</option>')
    }

    openDatabase().then(db => {
      const txBoarder = db.transaction('boarders', 'readonly')
      const storeBoarder = txBoarder.objectStore('boarders')
      const allBoardersActive = []
      storeBoarder.openCursor().onsuccess = function(e) {
        const cursor = e.target.result

        if(cursor) {
          const boarder = cursor.value       

          const fullName = (
            `${boarder.first_name} ${boarder.middle_name} ${boarder.last_name} ${boarder.suffix}`
          )
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
            
          const matchStatus = boarder.status === 'Active'
          const matchSearch = fullName.toLowerCase().includes(search.toLowerCase())

          if(matchSearch && matchStatus)
            allBoardersActive.push(boarder)
          cursor.continue()
        } else {
          allBoardersActive.sort((a, b) => {
            return a.first_name.localeCompare(b.first_name)
          });

          $('#addRentModalBoarderName').html(`<option value="" selected>--${allBoardersActive.length} results found--</option>`)
          
          if(allBoardersActive.length > 0){
            allBoardersActive.forEach(boarderActive => {
              const fullName = (
                `${boarderActive.first_name} ${boarderActive.middle_name} ${boarderActive.last_name} ${boarderActive.suffix}`
              ).replace(/\s+/g, ' ')
              .trim();
              
              $('#addRentModalBoarderName').append(`
                <option value="${boarderActive.boarder_id}-${boarderActive.nickname} - ${fullName}">${boarderActive.nickname} - ${fullName}</option>
              `)
            })
          } 
        }
      }
    })
  })

  $(document).off('change', '#addRentModalBoarderName').on('change', '#addRentModalBoarderName', function() {
    const [boarderId, boarderName] = [
      $(this).val().substring(0, $(this).val().indexOf('-')),
      $(this).val().substring($(this).val().indexOf('-')+1)
    ]
    
    openDatabase().then(db => {
      const tx = db.transaction('rents', 'readonly')
      const store = tx.objectStore('rents')
      store.openCursor().onsuccess = function(e){
        const cursor = e.target.result

        if(cursor) {
          const rent = cursor.value
          const matchStatus = rent.status === 'Ongoing' || rent.status === 'On Break' || rent.status === 'Unpaid'
          const matchBoarderId = rent.boarder_id == boarderId
          if(matchStatus && matchBoarderId){
            $('#addRentModalBoarderName').val('')
            toast('warning', `${boarderName} currently has ${rent.status.toLowerCase()} rent! Make sure the current rent is marked as completed before adding a new one.`)
            return
          }            
          cursor.continue()
        }
      }
    }).catch(() => toast('error', 'Database error.'))
  })

  $(document).off('change', '#addRentModalRoom').on('change', '#addRentModalRoom', function() {
    const roomId = $(this).val().substring(0, $(this).val().indexOf('-'))

    $('#addRentModalBedLevel').html('<option value=""></option>')
    if(roomId === undefined || roomId == '' || roomId === null){
      $('#addRentModalRoomBedsLeft').addClass('d-none')
      return
    } 

    $('#addRentModalRoomBedsLeft').removeClass('d-none')    

    $('.add-rent-lower-beds-left').addClass('d-none')
    $(`.add-rent-lower-beds-left-room-id-${roomId}`).removeClass('d-none')
    const lowerBedsLeft = Number($(`.add-rent-lower-beds-left-room-id-${roomId}`).attr('data-lower-beds-left'))
    if(lowerBedsLeft > 0){
      $('#addRentModalBedLevel').append('<option value="Lower">Lower</option>')
    }

    $('.add-rent-upper-beds-left').addClass('d-none')
    $(`.add-rent-upper-beds-left-room-id-${roomId}`).removeClass('d-none')
    const upperBedsLeft = Number($(`.add-rent-upper-beds-left-room-id-${roomId}`).attr('data-upper-beds-left'))
    if(upperBedsLeft > 0){
      $('#addRentModalBedLevel').append('<option value="Upper">Upper</option>')
    }
  })

  function notesOnBlur(){
    $(document).off('blur', '#addRentModalNotes').on('blur', '#addRentModalNotes', function() {
      $('#addRentModalNotes').val($(this).val().trim())
    })
  } notesOnBlur()

  function submitForm(){
    $(document).off('submit', '#addRentModalForm').on('submit', '#addRentModalForm', function(e){
      e.preventDefault();

      if(!confirm('Are you sure you want to submit?')) return

      function activateButton(status){
        switch(status){
          case true:
            $('#addRentModalSubmit').prop('disabled', true)
            $('#addRentModalSubmit .spinner-border').removeClass('visually-hidden')
            break;
          default:
            $('#addRentModalSubmit').prop('disabled', false)
            $('#addRentModalSubmit .spinner-border').addClass('visually-hidden')
            break;
        } 
      }
      activateButton(true)

      setTimeout(() => {    
        const [boarderId, boarderName] = [
          Number($('#addRentModalBoarderName').val().substring(0, $('#addRentModalBoarderName').val().indexOf('-'))),
          $('#addRentModalBoarderName').val().substring($('#addRentModalBoarderName').val().indexOf('-')+1)
        ]

        const [roomId, roomName] = [
          Number($('#addRentModalRoom').val().substring(0, $('#addRentModalRoom').val().indexOf('-'))),
          $('#addRentModalRoom').val().substring($('#addRentModalRoom').val().indexOf('-')+1)
        ]

        const bedLevel = $('#addRentModalBedLevel').val().trim()
        const [isRentTypeRegular, rentTypeRegularValue] = [$('#addRentModalRentTypeRegular')[0].checked, $('#addRentModalRentTypeRegular').val()]
        const [rentTypeTransientValue] = [$('#addRentModalRentTypeTransient').val()]
        const DATETIME_DATABASE = dateTimeDatabase().replace(/[-:]/g, '').split(' ')
        const rentCode = `RT${DATETIME_DATABASE[0]}-${DATETIME_DATABASE[1]}`

        const lowerBedsLeft = Number($(`.add-rent-lower-beds-left-room-id-${roomId}`).attr('data-lower-beds-left'))
        const upperBedsLeft = Number($(`.add-rent-upper-beds-left-room-id-${roomId}`).attr('data-upper-beds-left'))
        
        const rent = {
          rent_code: rentCode,
          status: 'Ongoing',
          boarder_id: boarderId,
          room_id: roomId,
          bed_level: bedLevel,
          rent_type: isRentTypeRegular ? rentTypeRegularValue : rentTypeTransientValue,
          discount_percent: $('#addRentModalDiscount').val().trim(),
          check_in: $('#addRentModalCheckIn').val().trim(),
          check_out: '',
          notes: $('#addRentModalNotes').val().trim(),
          last_modified: dateTimeDatabase(),
          date_created: dateTimeDatabase()
        }

        openDatabase().then(db => {
          const tx = db.transaction('rents', 'readwrite')
          const store = tx.objectStore('rents')
          const request = store.add(rent)
          let lastInsertedRentId

          request.onsuccess = (event) => {
            lastInsertedRentId = event.target.result
          }

          tx.oncomplete = () => {
            const txRentBelonging = db.transaction('rent_belongings', 'readwrite')
            const storeRentBelonging = txRentBelonging.objectStore('rent_belongings')
            const allBelongingNames = []
            $('.add-rent-modal-belonging').each(function(){
              if($(this)[0].checked){
                const [belongingId, belongingName] = [
                  Number($(this).val().substring(0, $(this).val().indexOf('-'))),
                  $(this).val().substring($(this).val().indexOf('-')+1)
                ]

                allBelongingNames.push(" "+belongingName)

                const rentBelonging = {
                  rent_id: lastInsertedRentId,
                  belonging_id: belongingId,
                  checked: '1',
                  last_modified: dateTimeDatabase(),
                  date_created: dateTimeDatabase()
                }
                storeRentBelonging.add(rentBelonging)
              }
            })

            const txRoom = db.transaction('rooms', 'readwrite')
            const storeRoom = txRoom.objectStore('rooms')

            // get the existing room
            const getRequestRoom = storeRoom.get(parseInt(roomId))
            getRequestRoom.onsuccess = () => {
              const room = getRequestRoom.result
              if(room){
                if(bedLevel === "Lower"){
                  room.lower_beds_left = String(lowerBedsLeft - 1)
                }else if(bedLevel === "Upper"){
                  room.upper_beds_left = String(upperBedsLeft - 1)
                }
                storeRoom.put(room)
              }
            }
            
            const DATETIME_DATABASE = dateTimeDatabase().replace(/[-:]/g, '').split(' ')
            const paymentCode = `PR${DATETIME_DATABASE[0]}-${DATETIME_DATABASE[1]}`
            const startPeriodDate = $('#addRentModalCheckIn').val().trim().split("T")[0]
            const endPeriodDate = endPeriod($('#addRentModalCheckIn').val().trim(),
              isRentTypeRegular ? 
                (localStorage.getItem('settings-boarders-billing-cycle-regular') || 30) :
                (localStorage.getItem('settings-boarders-billing-cycle-transient') || 1)
            )
            const amountDue = Number(isRentTypeRegular ? (formatMoneyReverse(localStorage.getItem('settings-boarders-billing-amount-per-cycle-regular') || '700.00')) : (formatMoneyReverse(localStorage.getItem('settings-boarders-billing-amount-per-cycle-transient') || '50.00'))).toFixed(2)
            const discountAmount = (amountDue * (Number($('#addRentModalDiscount').val().trim()) / 100)).toFixed(2)
            const dueDate = endPeriodDate
            const totalAmountDue = (amountDue - discountAmount).toFixed(2)

            const paymentRents = {
              boarder_id: boarderId,
              payment_code: paymentCode,
              status: 'Unpaid',
              rent_id: lastInsertedRentId,
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
            }
            const txPaymentRents = db.transaction('payment_rents', 'readwrite')
            const storePaymentRents = txPaymentRents.objectStore('payment_rents')
            storePaymentRents.add(paymentRents)

            $('#addRentModalButtonClose')[0].click()
            $('#tableRentsNoRentsFound').remove()
            toast('success', 'Successfully added.')
            activateButton(false)
            $('#addRentModalForm')[0].reset()
            $('#tableRents').prepend(`
              <tr data-bs-toggle="modal" data-bs-target="#viewEditRentModal" id="viewEditRentModal${lastInsertedRentId}" class="view-edit-rent-modal" data-rent-id="${lastInsertedRentId}" data-date-created="${rent.date_created}">
                <td class='bg-primary-subtle'>${rentCode}</td>
                <td class='bg-primary-subtle'><span class="badge ${rent.status === 'Completed' ? 'text-bg-success' : (rent.status === "Ongoing" ? 'text-bg-info' : 'text-bg-warning')}">${rent.status}</span></td>
                <td class='bg-primary-subtle'>${boarderName}</td>
                <td class='bg-primary-subtle'>${allBelongingNames}</td>
                <td class='bg-primary-subtle'>${roomName}</td>
                <td class='bg-primary-subtle'>${rent.bed_level}</td>
                <td class='bg-primary-subtle'>${rent.rent_type}</td>
                <td class='bg-primary-subtle'>${rent.discount_percent}</td>
                <td class='bg-primary-subtle'>${dateTimeFriendly(rent.check_in)}</td>
                <td class='bg-primary-subtle'>${dateTimeFriendly(rent.check_out)}</td>
                <td class='bg-primary-subtle'>${rent.notes}</td>
                <td class='bg-primary-subtle'>${dateTimeFriendly(rent.last_modified)}</td>
                <td class='bg-primary-subtle'>${dateTimeFriendly(rent.date_created)}</td>
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