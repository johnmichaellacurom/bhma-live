import {toast} from '../../../backend/index.js'
import {openDatabase, dateTimeDatabase, dateTimeFriendly, formatMoney} from  '../../../indexdb/database.js'

export function belongingNameOnBlur(){
  $(document).off('blur', '#addBelongingModalBelongingName').on('blur', '#addBelongingModalBelongingName', function() {
    $('#addBelongingModalBelongingName').val($(this).val().trim())
  })
}

export function notesOnBlur(){
  $(document).off('blur', '#addBelongingModalNotes').on('blur', '#addBelongingModalNotes', function() {
    $('#addBelongingModalNotes').val($(this).val().trim())
  })
}

export function submitForm(){
  $(document).off('submit', '#addBelongingModalForm').on('submit', '#addBelongingModalForm', function(e){
    e.preventDefault();

    function activateButton(status){
      switch(status){
        case true:
          $('#addBelongingModalSubmit').prop('disabled', true)
          $('#addBelongingModalSubmit .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#addBelongingModalSubmit').prop('disabled', false)
          $('#addBelongingModalSubmit .spinner-border').addClass('visually-hidden')
          break;
      } 
    }
    activateButton(true)

    setTimeout(() => {    
      const [isStatusActive, statusActiveValue] = [$('#addBelongingModalStatusActive')[0].checked, $('#addBelongingModalStatusActive').val()]
      const [statusInactiveValue] = [$('#addBelongingModalStatusInactive').val()]

      const [isBelongingTypeAppliance, belongingTypeApplianceValue] = [$('#addBelongingModalBelongingTypeAppliance')[0].checked, $('#addBelongingModalBelongingTypeAppliance').val()]
      const [belongingTypeGadgeValue] = [$('#addBelongingModalBelongingTypeGadget').val()]

      const belonging = {
        status: isStatusActive ? statusActiveValue : statusInactiveValue,
        belonging_name: $('#addBelongingModalBelongingName').val().trim(),
        belonging_type: isBelongingTypeAppliance ? belongingTypeApplianceValue : belongingTypeGadgeValue,
        charge: $('#addBelongingModalCharge').val(),
        notes: $('#addBelongingModalNotes').val().trim(),
        last_modified: dateTimeDatabase(),
        date_created: dateTimeDatabase()
      }

      openDatabase().then(db => {
        const tx = db.transaction('belongings', 'readwrite')
        const store = tx.objectStore('belongings')
        const request = store.add(belonging)
        let lastInsertedId

        request.onsuccess = (event) => {
          lastInsertedId = event.target.result
        }

        request.onerror = (event) => {
          if(event.target.error.name === 'ConstraintError'){
            toast('error', 'Belonging name already exists!')
            activateButton(false)
          }
        }

        tx.oncomplete = () => {
          $('#addBelongingModalButtonClose')[0].click()
          $('#tableBelongingsNoBelongingsFound').remove()
          toast('success', 'Successfully added.')
          activateButton(false)
          $('#addBelongingModalForm')[0].reset()
          $('#tableBelongings').prepend(`
            <tr data-bs-toggle="modal" data-bs-target="#viewEditBelongingModal" id="viewEditBelongingModal${lastInsertedId}" class="view-edit-belonging-modal" data-belonging-id="${lastInsertedId}" data-date-created="${belonging.date_created}">
              <td class='bg-primary-subtle'><span class="badge ${belonging.status === 'Active' ? 'text-bg-success' : 'text-bg-danger'}">${belonging.status}</span></td>
              <td class='bg-primary-subtle'>${belonging.belonging_name}</td>
              <td class='bg-primary-subtle'>${belonging.belonging_type}</td>
              <td class='bg-primary-subtle'>${formatMoney(belonging.charge)}</td>
              <td class='bg-primary-subtle'>${belonging.notes}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(belonging.last_modified)}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(belonging.date_created)}</td>
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