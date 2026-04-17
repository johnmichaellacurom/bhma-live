import {toast} from '../../../backend/index.js'
import {openDatabase, dateTimeDatabase, dateTimeFriendly} from  '../../../indexdb/database.js'

export function roomNameOnBlur(){
  $(document).off('blur', '#addRoomModalRoomName').on('blur', '#addRoomModalRoomName', function() {
    $('#addRoomModalRoomName').val($(this).val().trim())
  })
}

export function totalLowerBedsCount(){
  let totalLowerBeds
  let lowerBedsLeft

  $(document).off('click', '#addRoomModalTotalLowerBedsMinus').on('click', '#addRoomModalTotalLowerBedsMinus', function() {
    totalLowerBeds = Number($('#addRoomModalTotalLowerBeds').val())
    lowerBedsLeft = Number($('#addRoomModalLowerBedsLeft').val())
    if(totalLowerBeds <= 0 || lowerBedsLeft < 0) return
    $('#addRoomModalTotalLowerBeds').val(totalLowerBeds -= 1)
    $('#addRoomModalLowerBedsLeft').val(lowerBedsLeft -= 1)
  })

  $(document).off('click', '#addRoomModalTotalLowerBedsPlus').on('click', '#addRoomModalTotalLowerBedsPlus', function() {
    totalLowerBeds = Number($('#addRoomModalTotalLowerBeds').val())
    lowerBedsLeft = Number($('#addRoomModalLowerBedsLeft').val())
    if(totalLowerBeds >= 10) return
    $('#addRoomModalTotalLowerBeds').val(totalLowerBeds += 1)
    $('#addRoomModalLowerBedsLeft').val(lowerBedsLeft += 1)
  })
}

export function totalUpperBedsCount(){
  let totalUpperBeds
  let upperBedsLeft

  $(document).off('click', '#addRoomModalTotalUpperBedsMinus').on('click', '#addRoomModalTotalUpperBedsMinus', function() {
    totalUpperBeds = Number($('#addRoomModalTotalUpperBeds').val())
    upperBedsLeft = Number($('#addRoomModalUpperBedsLeft').val())
    if(totalUpperBeds <= 0 || upperBedsLeft < 0) return
    $('#addRoomModalTotalUpperBeds').val(totalUpperBeds -= 1)
    $('#addRoomModalUpperBedsLeft').val(upperBedsLeft -= 1)
  })

  $(document).off('click', '#addRoomModalTotalUpperBedsPlus').on('click', '#addRoomModalTotalUpperBedsPlus', function() {
    totalUpperBeds = Number($('#addRoomModalTotalUpperBeds').val())
    upperBedsLeft = Number($('#addRoomModalUpperBedsLeft').val())
    if(totalUpperBeds >= 10) return
    $('#addRoomModalTotalUpperBeds').val(totalUpperBeds += 1)
    $('#addRoomModalUpperBedsLeft').val(upperBedsLeft += 1)
  })
}

export function notesOnBlur(){
  $(document).off('blur', '#addRoomModalNotes').on('blur', '#addRoomModalNotes', function() {
    $('#addRoomModalNotes').val($(this).val().trim())
  })
}

export function submitForm(){
  $(document).off('submit', '#addRoomModalForm').on('submit', '#addRoomModalForm', function(e){
    e.preventDefault();

    function activateButton(status){
      switch(status){
        case true:
          $('#submitRoomModalButton').prop('disabled', true)
          $('#submitRoomModalButton .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#submitRoomModalButton').prop('disabled', false)
          $('#submitRoomModalButton .spinner-border').addClass('visually-hidden')
          break;
      } 
    }
    activateButton(true)

    setTimeout(() => {    
      const [isStatusActive, statusActiveValue] = [$('#addRoomModalStatusActive')[0].checked, $('#addRoomModalStatusActive').val()]
      const [statusInactiveValue] = [$('#addRoomModalStatusInactive').val()]

      const room = {
        status: isStatusActive ? statusActiveValue : statusInactiveValue,
        room_name: $('#addRoomModalRoomName').val().trim(),
        total_lower_beds: $('#addRoomModalTotalLowerBeds').val(),
        lower_beds_left: $('#addRoomModalLowerBedsLeft').val(),
        total_upper_beds: $('#addRoomModalTotalUpperBeds').val(),
        upper_beds_left: $('#addRoomModalUpperBedsLeft').val(),
        notes: $('#addRoomModalNotes').val().trim(),
        last_modified: dateTimeDatabase(),
        date_created: dateTimeDatabase()
      }

      openDatabase().then(db => {
        const tx = db.transaction('rooms', 'readwrite')
        const store = tx.objectStore('rooms')
        const request = store.add(room)
        let lastInsertedId

        request.onsuccess = (event) => {
          lastInsertedId = event.target.result
        }

        request.onerror = (event) => {
          if(event.target.error.name === 'ConstraintError'){
            toast('error', 'Room name already exists!')
            activateButton(false)
          }
        }

        tx.oncomplete = () => {
          $('#addRoomModalButtonClose')[0].click()
          $('#tableRoomsNoRoomsFound').remove()
          toast('success', 'Successfully added.')
          activateButton(false)
          $('#addRoomModalForm')[0].reset()
          $('#tableRooms').prepend(`
            <tr data-bs-toggle="modal" data-bs-target="#viewEditRoomModal" id="viewEditRoomModal${lastInsertedId}" class="view-edit-room-modal" data-room-id="${lastInsertedId}" data-date-created="${room.date_created}">
              <td class='bg-primary-subtle'><span class="badge ${room.status === 'Active' ? 'text-bg-success' : 'text-bg-danger'}">${room.status}</span></td>
              <td class='bg-primary-subtle'>${room.room_name}</td>
              <td class='bg-primary-subtle'>${room.total_lower_beds}</td>
              <td class='bg-primary-subtle'>${room.lower_beds_left}</td>
              <td class='bg-primary-subtle'>${room.total_upper_beds}</td>
              <td class='bg-primary-subtle'>${room.upper_beds_left}</td>
              <td class='bg-primary-subtle'>${room.notes}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(room.last_modified)}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(room.date_created)}</td>
            </tr>
          `)
        }
      }).catch(() => {
        toast('error', 'Database error.')
        activateButton(false)
      })
    }, TIMEOUT_MS)
  })
}