import {toast} from '../../../backend/index.js'
import {openDatabase, dateTimeDatabase, dateTimeFriendly, formatMoney} from '../../../indexdb/database.js'

export function viewEditBelonginModalViewRents(){
  // $(document).off('click', '#viewEditBelongingModalViewRents').on('click', '#viewEditBelongingModalViewRents', () => {
  //   $('#viewEditBelongingModalButtonClose')[0].click()
    
  //   $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
  //   $('#rentsNavItem').addClass('bg-primary-subtle')

  //   $('#navbarSupportedContent .nav-link').removeClass('active')
  //   $('#rentsNavLink').addClass('active')

  //   $('#mainContent').load('pages/please_wait.html')

  //   const belongingId = $('#viewEditBelongingModalViewRents').attr('data-belonging-id');
  //   setTimeout(() => {
  //     $('#mainContent').load("pages/rents.html");
  //     console.log(belongingId)
  //   }, TIMEOUT_MS);
  // })
  return
}

export function viewEditBelonginModal(){
  let id, dateCreated
  $(document).off('click', '.view-edit-belonging-modal').on('click', '.view-edit-belonging-modal', function() {
    id = $(this).attr('data-belonging-id')
    dateCreated = $(this).attr('data-date-created')
    $('#viewEditBelongingModalBody').load('pages/please_wait.html')

    setTimeout(() => {
      $('#viewEditBelongingModalBody').load('pages/extensions/belongings/viewEditModalForm.html', function() {
        openDatabase().then(db => {
          const tx = db.transaction('belongings', 'readonly')
          const store = tx.objectStore('belongings')
          const request = store.get(Number(id));

          request.onsuccess = function (e) {
            const belonging = e.target.result;

            if(belonging.status === 'Active'){
              $('#viewEditBelongingModalStatusActive').prop('checked', true)
              $('#viewEditBelongingModalStatusInactive').prop('checked', false)
            } else{
              $('#viewEditBelongingModalStatusActive').prop('checked', false)
              $('#viewEditBelongingModalStatusInactive').prop('checked', true)
            }

            $('#viewEditBelongingModalBelongingName').val(belonging.belonging_name)

            if(belonging.belonging_type === 'Appliance'){
              $('#viewEditBelongingModalStatusAppliance').prop('checked', true)
              $('#viewEditBelongingModalStatusGadget').prop('checked', false)
            } else{
              $('#viewEditBelongingModalStatusAppliance').prop('checked', false)
              $('#viewEditBelongingModalStatusGadget').prop('checked', true)
            }

            $('#viewEditBelongingModalCharge').val(belonging.charge)
            $('#viewEditBelongingModalNotes').val(belonging.notes)
            $('#viewEditBelongingModalLastModified').val(dateTimeFriendly(belonging.last_modified))
            $('#viewEditBelongingModalDateCreated').val(dateTimeFriendly(belonging.date_created))
          };
        }).catch(() => toast('error', 'Database error.'))
      })
      
    }, TIMEOUT_MS)
  })

  function belongingNameOnBlur(){
    $(document).off('blur', '#viewEditBelongingModalBelongingName').on('blur', '#viewEditBelongingModalBelongingName', function() {
      $('#viewEditBelongingModalBelongingName').val($(this).val().trim())
    })
  }belongingNameOnBlur()

  function notesOnBlur(){
    $(document).off('blur', '#viewEditBelongingModalNotes').on('blur', '#viewEditBelongingModalNotes', function() {
      $('#viewEditBelongingModalNotes').val($(this).val().trim())
    })
  }notesOnBlur()

  function submitForm(){
    $(document).off('submit', '#viewEditBelongingModalForm').on('submit', '#viewEditBelongingModalForm', function(e){
      e.preventDefault();

      function activateButton(status){
        switch(status){
          case true:
            $('#viewEditBelongingModalUpdate').prop('disabled', true)
            $('#viewEditBelongingModalUpdate .spinner-border').removeClass('visually-hidden')
            break;
          default:
            $('#viewEditBelongingModalUpdate').prop('disabled', false)
            $('#viewEditBelongingModalUpdate .spinner-border').addClass('visually-hidden')
            break;
        } 
      }
      activateButton(true)

      setTimeout(() => {    
        const [isStatusActive, statusActiveValue] = [$('#viewEditBelongingModalStatusActive')[0].checked, $('#viewEditBelongingModalStatusActive').val()]
        const [statusInactiveValue] = [$('#viewEditBelongingModalStatusInactive').val()]

        const [isBelongingTypeAppliance, belongingTypeApplianceValue] = [$('#viewEditBelongingModalBelongingTypeAppliance')[0].checked, $('#viewEditBelongingModalBelongingTypeAppliance').val()]
        const [belongingTypeGadgeValue] = [$('#viewEditBelongingModalBelongingTypeGadget').val()]

        const belonging = {
          belonging_id: parseInt(id),
          status: isStatusActive ? statusActiveValue : statusInactiveValue,
          belonging_name: $('#viewEditBelongingModalBelongingName').val().trim(),
          belonging_type: isBelongingTypeAppliance ? belongingTypeApplianceValue : belongingTypeGadgeValue,
          charge: $('#viewEditBelongingModalCharge').val(),
          notes: $('#viewEditBelongingModalNotes').val().trim(),
          last_modified: dateTimeDatabase(),
          date_created: dateCreated
        }

        openDatabase().then(db => {
          const tx = db.transaction('belongings', 'readwrite')
          const store = tx.objectStore('belongings')
          const request = store.put(belonging)

          request.onerror = (event) => {
            if(event.target.error.name === 'ConstraintError'){
              toast('error', 'Belonging name already exists!')
              activateButton(false)
            }
          }

          tx.oncomplete = () => {
            $('#viewEditBelongingModalButtonClose')[0].click()
            toast('success', 'Successfully Updated.')
            activateButton(false)
            $(`#viewEditBelongingModal${id}`).html(`
              <td class='bg-primary-subtle'><span class="badge ${belonging.status === 'Active' ? 'text-bg-success' : 'text-bg-danger'}">${belonging.status}</span></td>
              <td class='bg-primary-subtle'>${belonging.belonging_name}</td>
              <td class='bg-primary-subtle'>${belonging.belonging_type}</td>
              <td class='bg-primary-subtle'>${formatMoney(belonging.charge)}</td>
              <td class='bg-primary-subtle'>${belonging.notes}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(belonging.last_modified)}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(belonging.date_created)}</td>
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
