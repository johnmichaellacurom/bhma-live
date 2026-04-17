import {toast} from '../../../backend/index.js'
import {openDatabase, dateTimeDatabase, dateTimeFriendly, dateFriendly} from '../../../indexdb/database.js'
import {getAge} from './getAge.js'
import {loadRents} from '../rents/loadRents.js'

export function viewEditBoarderModalViewRents(){
  $(document).off('click', '#viewEditBoarderModalViewRents').on('click', '#viewEditBoarderModalViewRents', () => {
    $('#viewEditBoarderModalButtonClose')[0].click()
    
    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#rentsNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#rentsNavLink').addClass('active')

    $('#mainContent').load('pages/please_wait.html')

    const boarderId = Number($('#viewEditBoarderModalViewRents').attr('data-boarder-id'));
    const entriesPerPage = Number(localStorage.getItem('settings-rents-entries-per-page')) || 10
    const currentPage = 1
    const offset = 0
    const showFrom = 1
    const showTo = entriesPerPage
    const status = ''
    const sort = 'Ascending'
    const bedLevel = ''
    const rentType = ''    
    const search = boarderId

    sessionStorage.setItem('rents-current-page', currentPage)
    sessionStorage.setItem('rents-offset', offset)
    sessionStorage.setItem('rents-show-from', showFrom)
    sessionStorage.setItem('rents-show-to', showTo)
    sessionStorage.setItem('rents-status', status)
    sessionStorage.setItem('rents-sort', sort)
    sessionStorage.setItem('rents-bed-level', bedLevel)
    sessionStorage.setItem('rents-rent-type', rentType)
    sessionStorage.setItem('rents-search', search)

    setTimeout(() => {
      $('#mainContent').load("pages/rents.html", function() {
        loadRents(entriesPerPage, offset, currentPage, showFrom, showTo, status, sort, bedLevel, rentType, search, true, false)
      });
    }, TIMEOUT_MS);
  })
}

export function viewEditBoarderModalViewPayments(){
  // $(document).off('click', '#viewEditBoarderModalViewPayments').on('click', '#viewEditBoarderModalViewPayments', () => {
  //   $('#viewEditBoarderModalButtonClose')[0].click()
    
  //   $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
  //   $('#paymentsNavItem').addClass('bg-primary-subtle')

  //   $('#navbarSupportedContent .nav-link').removeClass('active')
  //   $('#paymentsNavLink').addClass('active')

  //   $('#mainContent').load('pages/please_wait.html')

  //   const boarderId = $('#viewEditBoarderModalViewPayments').attr('data-boarder-id');
  //   const paymentType = $('#viewEditBoarderModalViewPayments').attr('data-payment-type');
  //   setTimeout(() => {
  //     $('#mainContent').load("pages/payments.html", () => {
  //       $('#paymentsContentDisplay').load("pages/extensions/payments/rent/contentDisplay.html", () => {

  //         // set the current tab
  //         if(paymentType !== 'rent') return

  //         $('#viewEditPaymentModalNavLinkRent').addClass('active')
  //         $('#viewEditPaymentModalNavLinkRent').attr('aria-current', 'page')
  //         $('#viewEditPaymentModalNavLinkRent').prop('disabled', true)   

  //         $('#viewEditPaymentModalNavLinkBill').removeClass('active')
  //         $('#viewEditPaymentModalNavLinkBill').removeAttr('aria-current')
  //         $('#viewEditPaymentModalNavLinkBill').prop('disabled', false)

  //         $(document).off('click', '#viewEditPaymentModalNavLinkRent').on('click', '#viewEditPaymentModalNavLinkRent', function() {
  //           $(this).addClass('active')
  //           $(this).attr('aria-current', 'page')
  //           $(this).prop('disabled', true)

  //           $('#viewEditPaymentModalNavLinkBill').removeClass('active')
  //           $('#viewEditPaymentModalNavLinkBill').removeAttr('aria-current')
  //           $('#viewEditPaymentModalNavLinkBill').prop('disabled', false)

  //           $('#paymentsContentDisplay').load('pages/please_wait.html')
  //           setTimeout(() => {
  //             $('#paymentsContentDisplay').load('pages/extensions/payments/rent/contentDisplay.html')
  //           }, TIMEOUT_MS)
  //         })

  //         $(document).off('click', '#viewEditPaymentModalNavLinkBill').on('click', '#viewEditPaymentModalNavLinkBill', function() {
  //           $(this).addClass('active')
  //           $(this).attr('aria-current', 'page')
  //           $(this).prop('disabled', true)

  //           $('#viewEditPaymentModalNavLinkRent').removeClass('active')
  //           $('#viewEditPaymentModalNavLinkRent').removeAttr('aria-current')
  //           $('#viewEditPaymentModalNavLinkRent').prop('disabled', false)          

  //           $('#paymentsContentDisplay').load('pages/please_wait.html')
  //           setTimeout(() => {
  //             $('#paymentsContentDisplay').load('pages/extensions/payments/bill/contentDisplay.html')
  //           }, TIMEOUT_MS)
  //         })

  //       })
  //     });
  //     console.log(boarderId)
  //   }, TIMEOUT_MS);
  // })
  return
}

export function viewEditBoarderModal(){
  let id, dateCreated
  $(document).off('click', '.view-edit-boarder-modal').on('click', '.view-edit-boarder-modal', function() {
    id = $(this).attr('data-boarder-id')
    dateCreated = $(this).attr('data-date-created')
    $('#viewEditBoarderModalBody').load('pages/please_wait.html')

    setTimeout(() => {
      $('#viewEditBoarderModalBody').load('pages/extensions/boarders/viewEditModalForm.html', function() {
        openDatabase().then(db => {
          const tx = db.transaction('boarders', 'readonly')
          const store = tx.objectStore('boarders')
          const request = store.get(Number(id));

          request.onsuccess = function (e) {
            const boarder = e.target.result;
            $('#viewEditBoarderModalViewRents').attr('data-boarder-id', id)

            if(boarder.status === 'Active'){
              $('#viewEditBoarderModalStatusActive').prop('checked', true)
              $('#viewEditBoarderModalStatusInactive').prop('checked', false)
            } else{
              $('#viewEditBoarderModalStatusActive').prop('checked', false)
              $('#viewEditBoarderModalStatusInactive').prop('checked', true)
            }

            $('#viewEditBoarderModalFirstName').val(boarder.first_name)
            $('#viewEditBoarderModalMiddleName').val(boarder.middle_name)
            $('#viewEditBoarderModalLastName').val(boarder.last_name)
            $('#viewEditBoarderModalSuffix').val(boarder.suffix)
            $('#viewEditBoarderModalNickName').val(boarder.nickname)
            $('#viewEditBoarderModalBirthDate').val(boarder.birth_date)
            $('#viewEditBoarderModalAge').val(getAge(boarder.birth_date))

            if(boarder.sex === 'Male'){
              $('#viewEditBoarderModalSexMale').prop('checked', true)
              $('#viewEditBoarderModalSexFemale').prop('checked', false)
            } else{
              $('#viewEditBoarderModalSexMale').prop('checked', false)
              $('#viewEditBoarderModalSexFemale').prop('checked', true)
            }

            $('#viewEditBoarderModalAddress').val(boarder.address)
            $('#viewEditBoarderModalMobileNo').val(boarder.mobile_no)
            $('#viewEditBoarderModalFacebookAcc').val(boarder.facebook_acc)
            $('#viewEditBoarderModalNotes').val(boarder.notes)
            $('#viewEditBoarderModalLastModified').val(dateTimeFriendly(boarder.last_modified))
            $('#viewEditBoarderModalDateCreated').val(dateTimeFriendly(boarder.date_created))
          };
        }).catch(() => toast('error', 'Database error.'))
      })
      
    }, TIMEOUT_MS)
  })

  function firstNameOnBlur(){
    $(document).off('blur', '#viewEditBoarderModalFirstName').on('blur', '#viewEditBoarderModalFirstName', function() {
      $('#viewEditBoarderModalFirstName').val($(this).val().trim())
    })
  } firstNameOnBlur()

  function middleNameOnBlur(){
    $(document).off('blur', '#viewEditBoarderModalMiddleName').on('blur', '#viewEditBoarderModalMiddleName', function() {
      $('#viewEditBoarderModalMiddleName').val($(this).val().trim())
    })
  } middleNameOnBlur()

  function lastNameOnBlur(){
    $(document).off('blur', '#viewEditBoarderModalLastName').on('blur', '#viewEditBoarderModalLastName', function() {
      $('#viewEditBoarderModalLastName').val($(this).val().trim())
    })
  } lastNameOnBlur()

  function suffixOnBlur(){
    $(document).off('blur', '#viewEditBoarderModalSuffix').on('blur', '#viewEditBoarderModalSuffix', function() {
      $('#viewEditBoarderModalSuffix').val($(this).val().trim())
    })
  } suffixOnBlur()

  function nickNameOnBlur(){
    $(document).off('blur', '#viewEditBoarderModalNickName').on('blur', '#viewEditBoarderModalNickName', function() {
      $('#viewEditBoarderModalNickName').val($(this).val().trim())
    })
  } nickNameOnBlur()

  function addressOnBlur(){
    $(document).off('blur', '#viewEditBoarderModalAddress').on('blur', '#viewEditBoarderModalAddress', function() {
      $('#viewEditBoarderModalAddress').val($(this).val().trim())
    })
  } addressOnBlur()

  function mobileNoOnBlur(){
    $(document).off('blur', '#viewEditBoarderModalMobileNo').on('blur', '#viewEditBoarderModalMobileNo', function() {
      $('#viewEditBoarderModalMobileNo').val($(this).val().trim())
    })
  } mobileNoOnBlur()

  function facebookAccOnBlur(){
    $(document).off('blur', '#viewEditBoarderModalFacebookAcc').on('blur', '#viewEditBoarderModalFacebookAcc', function() {
      $('#viewEditBoarderModalFacebookAcc').val($(this).val().trim())
    })
  } facebookAccOnBlur()

  function notesOnBlur(){
    $(document).off('blur', '#viewEditBoarderModalNotes').on('blur', '#viewEditBoarderModalNotes', function() {
      $('#viewEditBoarderModalNotes').val($(this).val().trim())
    })
  } notesOnBlur()

  function submitForm(){
    $(document).off('submit', '#viewEditBoarderModalForm').on('submit', '#viewEditBoarderModalForm', function(e){
      e.preventDefault();

      function activateButton(status){
        switch(status){
          case true:
            $('#viewEditBoarderModalUpdate').prop('disabled', true)
            $('#viewEditBoarderModalUpdate .spinner-border').removeClass('visually-hidden')
            break;
          default:
            $('#viewEditBoarderModalUpdate').prop('disabled', false)
            $('#viewEditBoarderModalUpdate .spinner-border').addClass('visually-hidden')
            break;
        } 
      }
      activateButton(true)

      setTimeout(() => {    
        const [isStatusActive, statusActiveValue] = [$('#viewEditBoarderModalStatusActive')[0].checked, $('#viewEditBoarderModalStatusActive').val()]
        const [statusInactiveValue] = [$('#viewEditBoarderModalStatusInactive').val()]

        const [isSexMale, sexMaleValue] = [$('#viewEditBoarderModalSexMale')[0].checked, $('#viewEditBoarderModalSexMale').val()]
        const [sexFemaleValue] = [$('#viewEditBoarderModalSexFemale').val()]
        

        const boarder = {
          boarder_id: parseInt(id),
          status: isStatusActive ? statusActiveValue : statusInactiveValue,
          first_name: $('#viewEditBoarderModalFirstName').val().trim(),
          middle_name: $('#viewEditBoarderModalMiddleName').val(),
          last_name: $('#viewEditBoarderModalLastName').val(),
          suffix: $('#viewEditBoarderModalSuffix').val(),
          nickname: $('#viewEditBoarderModalNickName').val(),
          birth_date: $('#viewEditBoarderModalBirthDate').val(),
          sex: isSexMale ? sexMaleValue : sexFemaleValue,
          address: $('#viewEditBoarderModalAddress').val(),
          mobile_no: $('#viewEditBoarderModalMobileNo').val(),
          facebook_acc: $('#viewEditBoarderModalFacebookAcc').val(),
          notes: $('#viewEditBoarderModalNotes').val().trim(),
          last_modified: dateTimeDatabase(),
          date_created: dateCreated
        }

        openDatabase().then(db => {
          const tx = db.transaction('boarders', 'readwrite')
          const store = tx.objectStore('boarders')
          store.put(boarder)

          tx.oncomplete = () => {
            $('#viewEditBoarderModalButtonClose')[0].click()
            toast('success', 'Successfully Updated.')
            activateButton(false)
            $(`#viewEditBoarderModal${id}`).html(`
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
