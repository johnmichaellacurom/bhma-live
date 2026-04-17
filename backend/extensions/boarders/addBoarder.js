import {toast} from '../../../backend/index.js'
import {openDatabase, dateTimeDatabase, dateTimeFriendly, dateFriendly} from  '../../../indexdb/database.js'
import {getAge} from './getAge.js'

export function firstNameOnBlur(){
  $(document).off('blur', '#addBoarderModalFirstName').on('blur', '#addBoarderModalFirstName', function() {
    $('#addBoarderModalFirstName').val($(this).val().trim())
  })
}

export function middleNameOnBlur(){
  $(document).off('blur', '#addBoarderModalMiddleName').on('blur', '#addBoarderModalMiddleName', function() {
    $('#addBoarderModalMiddleName').val($(this).val().trim())
  })
}

export function lastNameOnBlur(){
  $(document).off('blur', '#addBoarderModalLastName').on('blur', '#addBoarderModalLastName', function() {
    $('#addBoarderModalLastName').val($(this).val().trim())
  })
}

export function suffixOnBlur(){
  $(document).off('blur', '#addBoarderModalSuffix').on('blur', '#addBoarderModalSuffix', function() {
    $('#addBoarderModalSuffix').val($(this).val().trim())
  })
}

export function nickNameOnBlur(){
  $(document).off('blur', '#addBoarderModalNickName').on('blur', '#addBoarderModalNickName', function() {
    $('#addBoarderModalNickName').val($(this).val().trim())
  })
}

export function addressOnBlur(){
  $(document).off('blur', '#addBoarderModalAddress').on('blur', '#addBoarderModalAddress', function() {
    $('#addBoarderModalAddress').val($(this).val().trim())
  })
}

export function mobileNoOnBlur(){
  $(document).off('blur', '#addBoarderModalMobileNo').on('blur', '#addBoarderModalMobileNo', function() {
    $('#addBoarderModalMobileNo').val($(this).val().trim())
  })
}

export function facebookAccOnBlur(){
  $(document).off('blur', '#addBoarderModalFacebookAcc').on('blur', '#addBoarderModalFacebookAcc', function() {
    $('#addBoarderModalFacebookAcc').val($(this).val().trim())
  })
}

export function notesOnBlur(){
  $(document).off('blur', '#addBoarderModalNotes').on('blur', '#addBoarderModalNotes', function() {
    $('#addBoarderModalNotes').val($(this).val().trim())
  })
}

export function submitForm(){
  $(document).off('submit', '#addBoarderModalForm').on('submit', '#addBoarderModalForm', function(e){
    e.preventDefault();

    function activateButton(status){
      switch(status){
        case true:
          $('#addBoarderModalSubmit').prop('disabled', true)
          $('#addBoarderModalSubmit .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#addBoarderModalSubmit').prop('disabled', false)
          $('#addBoarderModalSubmit .spinner-border').addClass('visually-hidden')
          break;
      } 
    }
    activateButton(true)

    setTimeout(() => {    
      const [isStatusActive, statusActiveValue] = [$('#addBoarderModalStatusActive')[0].checked, $('#addBoarderModalStatusActive').val()]
      const [statusInactiveValue] = [$('#addBoarderModalStatusInactive').val()]

      const [isSexMale, sexMaleValue] = [$('#addBoarderModalSexMale')[0].checked, $('#addBoarderModalSexMale').val()]
      const [sexFemaleValue] = [$('#addBoarderModalSexFemale').val()]

      const boarder = {
        status: isStatusActive ? statusActiveValue : statusInactiveValue,
        first_name: $('#addBoarderModalFirstName').val().trim(),
        middle_name: $('#addBoarderModalMiddleName').val(),
        last_name: $('#addBoarderModalLastName').val(),
        suffix: $('#addBoarderModalSuffix').val(),
        nickname: $('#addBoarderModalNickName').val(),
        birth_date: $('#addBoarderModalBirthDate').val(),
        sex: isSexMale ? sexMaleValue : sexFemaleValue,
        address: $('#addBoarderModalAddress').val(),
        mobile_no: $('#addBoarderModalMobileNo').val(),
        facebook_acc: $('#addBoarderModalFacebookAcc').val(),
        notes: $('#addBoarderModalNotes').val().trim(),
        last_modified: dateTimeDatabase(),
        date_created: dateTimeDatabase()
      }

      openDatabase().then(db => {
        const tx = db.transaction('boarders', 'readwrite')
        const store = tx.objectStore('boarders')
        const request = store.add(boarder)
        let lastInsertedId

        request.onsuccess = (event) => {
          lastInsertedId = event.target.result
        }

        tx.oncomplete = () => {
          $('#addBoarderModalButtonClose')[0].click()
          $('#tableBoardersNoBoardersFound').remove()
          toast('success', 'Successfully added.')
          activateButton(false)
          $('#addBoarderModalForm')[0].reset()
          $('#tableBoarders').prepend(`
            <tr data-bs-toggle="modal" data-bs-target="#viewEditBoarderModal" id="viewEditBoarderModal${lastInsertedId}" class="view-edit-boarder-modal" data-boarder-id="${lastInsertedId}" data-date-created="${boarder.date_created}">
              <td class='bg-primary-subtle'><span class="badge ${boarder.status === 'Active' ? 'text-bg-success' : 'text-bg-danger'}">${boarder.status}</span></td>
              <td class='bg-primary-subtle'>${boarder.first_name}</td>
              <td class='bg-primary-subtle'>${boarder.middle_name}</td>
              <td class='bg-primary-subtle'>${boarder.last_name}</td>
              <td class='bg-primary-subtle'>${boarder.suffix}</td>
              <td class='bg-primary-subtle'>${boarder.nickname}</td>
              <td class='bg-primary-subtle'>${dateFriendly(boarder.birth_date)}</td>
              <td class='bg-primary-subtle'>${getAge(boarder.birth_date)}</td>
              <td class='bg-primary-subtle'>${boarder.sex}</td>
              <td class='bg-primary-subtle'>${boarder.address}</td>
              <td class='bg-primary-subtle'>${boarder.mobile_no}</td>
              <td class='bg-primary-subtle'>${boarder.facebook_acc}</td>
              <td class='bg-primary-subtle'>${boarder.notes}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(boarder.last_modified)}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(boarder.date_created)}</td>
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