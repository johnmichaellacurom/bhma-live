import {toast} from '../../../backend/index.js'
import {openDatabase, dateTimeDatabase, dateTimeFriendly} from '../../../indexdb/database.js'
// import {loadRents} from '../rents/loadRents.js'

export function viewEditRoomModalViewRents(){
  // $(document).off('click', '#viewEditRoomModalViewRents').on('click', '#viewEditRoomModalViewRents', () => {
  //   $('#viewEditRoomModalButtonClose')[0].click()
    
  //   $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
  //   $('#rentsNavItem').addClass('bg-primary-subtle')

  //   $('#navbarSupportedContent .nav-link').removeClass('active')
  //   $('#rentsNavLink').addClass('active')

  //   $('#mainContent').load('pages/please_wait.html')

  //   const roomId = $('#viewEditRoomModalViewRents').attr('data-room-id');
  //   setTimeout(() => {
  //     $('#mainContent').load("pages/rents.html");
  //     loadRents(limit, offset, currentPage, showFrom, showTo, status, sort, bedLevel, rentType, search, false)
  //   }, TIMEOUT_MS);
  // })
  return
}

export function viewEditRoomModalViewBills(){
  // $(document).off('click', '#viewEditRoomModalViewBills').on('click', '#viewEditRoomModalViewBills', () => {
  //   $('#viewEditRoomModalButtonClose')[0].click()
    
  //   $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
  //   $('#billsNavItem').addClass('bg-primary-subtle')

  //   $('#navbarSupportedContent .nav-link').removeClass('active')
  //   $('#billsNavLink').addClass('active')

  //   $('#mainContent').load('pages/please_wait.html')

  //   const roomName = $('#viewEditRoomModalViewBills').attr('data-room-name');
  //   setTimeout(() => {
  //     $('#mainContent').load("pages/bills.html");
  //     console.log(roomName)
  //   }, TIMEOUT_MS);
  // })
  return
}

export function viewEditRoomModal(){
  let id, dateCreated
  $(document).off('click', '.view-edit-room-modal').on('click', '.view-edit-room-modal', function() {
    id = $(this).attr('data-room-id')
    dateCreated = $(this).attr('data-date-created')
    $('#viewEditRoomModalBody').load('pages/please_wait.html')

    setTimeout(() => {
      $('#viewEditRoomModalBody').load('pages/extensions/rooms/viewEditModalForm.html', function() {
        openDatabase().then(db => {
          const tx = db.transaction('rooms', 'readonly')
          const store = tx.objectStore('rooms')
          const request = store.get(Number(id));

          request.onsuccess = function (e) {
            const room = e.target.result;
            $('#viewEditRoomModalViewRents').attr('data-room-id', room.room_id)

            if(room.status === 'Active'){
              $('#viewEditRoomModalStatusActive').prop('checked', true)
              $('#viewEditRoomModalStatusInactive').prop('checked', false)
            } else{
              $('#viewEditRoomModalStatusActive').prop('checked', false)
              $('#viewEditRoomModalStatusInactive').prop('checked', true)
            }

            $('#viewEditRoomModalRoomName').val(room.room_name)
            $('#viewEditRoomModalTotalLowerBeds').val(room.total_lower_beds)
            $('#viewEditRoomModalLowerBedsLeft').val(room.lower_beds_left)
            $('#viewEditRoomModalTotalUpperBeds').val(room.total_upper_beds)
            $('#viewEditRoomModalUpperBedsLeft').val(room.upper_beds_left)
            $('#viewEditRoomModalNotes').val(room.notes)
            $('#viewEditRoomModalLastModified').val(dateTimeFriendly(room.last_modified))
            $('#viewEditRoomModalDateCreated').val(dateTimeFriendly(room.date_created))
          };
        }).catch(() => toast('error', 'Database error.'))
      })
      
    }, TIMEOUT_MS)
  })

  function roomNameOnBlur(){
    $(document).off('blur', '#viewEditRoomModalRoomName').on('blur', '#viewEditRoomModalRoomName', function() {
      $('#viewEditRoomModalRoomName').val($(this).val().trim())
    })
  } roomNameOnBlur()

  function totalLowerBedsCount(){
    let totalLowerBeds
    let lowerBedsLeft

    $(document).off('click', '#viewEditRoomModalTotalLowerBedsMinus').on('click', '#viewEditRoomModalTotalLowerBedsMinus', function() {
      totalLowerBeds = Number($('#viewEditRoomModalTotalLowerBeds').val())
      lowerBedsLeft = Number($('#viewEditRoomModalLowerBedsLeft').val())
      if(totalLowerBeds <= 1 || lowerBedsLeft < 1) return
      $('#viewEditRoomModalTotalLowerBeds').val(totalLowerBeds -= 1)
      $('#viewEditRoomModalLowerBedsLeft').val(lowerBedsLeft -= 1)
    })

    $(document).off('click', '#viewEditRoomModalTotalLowerBedsPlus').on('click', '#viewEditRoomModalTotalLowerBedsPlus', function() {
      totalLowerBeds = Number($('#viewEditRoomModalTotalLowerBeds').val())
      lowerBedsLeft = Number($('#viewEditRoomModalLowerBedsLeft').val())
      if(totalLowerBeds >= 10) return
      $('#viewEditRoomModalTotalLowerBeds').val(totalLowerBeds += 1)
      $('#viewEditRoomModalLowerBedsLeft').val(lowerBedsLeft += 1)
    })
  } totalLowerBedsCount()

  function totalUpperBedsCount(){
    let totalUpperBeds
    let upperBedsLeft

    $(document).off('click', '#viewEditRoomModalTotalUpperBedsMinus').on('click', '#viewEditRoomModalTotalUpperBedsMinus', function() {
      totalUpperBeds = Number($('#viewEditRoomModalTotalUpperBeds').val())
      upperBedsLeft = Number($('#viewEditRoomModalUpperBedsLeft').val())
      if(totalUpperBeds <= 1 || upperBedsLeft < 1) return
      $('#viewEditRoomModalTotalUpperBeds').val(totalUpperBeds -= 1)
      $('#viewEditRoomModalUpperBedsLeft').val(upperBedsLeft -= 1)
    })

    $(document).off('click', '#viewEditRoomModalTotalUpperBedsPlus').on('click', '#viewEditRoomModalTotalUpperBedsPlus', function() {
      totalUpperBeds = Number($('#viewEditRoomModalTotalUpperBeds').val())
      upperBedsLeft = Number($('#viewEditRoomModalUpperBedsLeft').val())
      if(totalUpperBeds >= 10) return
      $('#viewEditRoomModalTotalUpperBeds').val(totalUpperBeds += 1)
      $('#viewEditRoomModalUpperBedsLeft').val(upperBedsLeft += 1)
    })
  } totalUpperBedsCount()

  function notesOnBlur(){
    $(document).off('blur', '#viewEditRoomModalNotes').on('blur', '#viewEditRoomModalNotes', function() {
      $('#viewEditRoomModalNotes').val($(this).val().trim())
    })
  } notesOnBlur()

  function submitForm(){
    $(document).off('submit', '#viewEditRoomModalForm').on('submit', '#viewEditRoomModalForm', function(e){
      e.preventDefault();

      function activateButton(status){
        switch(status){
          case true:
            $('#updateRoomModalButton').prop('disabled', true)
            $('#updateRoomModalButton .spinner-border').removeClass('visually-hidden')
            break;
          default:
            $('#updateRoomModalButton').prop('disabled', false)
            $('#updateRoomModalButton .spinner-border').addClass('visually-hidden')
            break;
        } 
      }
      activateButton(true)

      setTimeout(() => {    
        const [isStatusActive, statusActiveValue] = [$('#viewEditRoomModalStatusActive')[0].checked, $('#viewEditRoomModalStatusActive').val()]
        const [statusInactiveValue] = [$('#viewEditRoomModalStatusInactive').val()]

        const room = {
          room_id: parseInt(id),
          status: isStatusActive ? statusActiveValue : statusInactiveValue,
          room_name: $('#viewEditRoomModalRoomName').val().trim(),
          total_lower_beds: $('#viewEditRoomModalTotalLowerBeds').val(),
          lower_beds_left: $('#viewEditRoomModalLowerBedsLeft').val(),
          total_upper_beds: $('#viewEditRoomModalTotalUpperBeds').val(),
          upper_beds_left: $('#viewEditRoomModalUpperBedsLeft').val(),
          notes: $('#viewEditRoomModalNotes').val().trim(),
          last_modified: dateTimeDatabase(),
          date_created: dateCreated
        }

        openDatabase().then(db => {
          const tx = db.transaction('rooms', 'readwrite')
          const store = tx.objectStore('rooms')
          const request = store.put(room)

          request.onerror = (event) => {
            if(event.target.error.name === 'ConstraintError'){
              toast('error', 'Room name already exists!')
              activateButton(false)
            }
          }

          tx.oncomplete = () => {
            $('#viewEditRoomModalButtonClose')[0].click()
            toast('success', 'Successfully Updated.')
            activateButton(false)
            $(`#viewEditRoomModal${id}`).html(`
              <td class='bg-primary-subtle'><span class="badge ${room.status === 'Active' ? 'text-bg-success' : 'text-bg-danger'}">${room.status}</span></td>
              <td class='bg-primary-subtle'>${room.room_name}</td>
              <td class='bg-primary-subtle'>${room.total_lower_beds}</td>
              <td class='bg-primary-subtle'>${room.lower_beds_left}</td>
              <td class='bg-primary-subtle'>${room.total_upper_beds}</td>
              <td class='bg-primary-subtle'>${room.upper_beds_left}</td>
              <td class='bg-primary-subtle'>${room.notes}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(room.last_modified)}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(dateCreated)}</td>
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

