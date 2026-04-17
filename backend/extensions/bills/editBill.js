import {toast} from '../../../backend/index.js'
import {openDatabase, formatMoney, dateTimeDatabase, dateTimeFriendly, dateFriendly} from '../../../indexdb/database.js'
import { loadPaymentBills } from '../payments/bill/loadPaymentBills.js'

export function viewEditBillModalViewPayments(){
  $(document).off('click', '#viewEditBillModalViewPayments').on('click', '#viewEditBillModalViewPayments', () => {
    $('#viewEditBillModalButtonClose')[0].click()
    
    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#paymentsNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#paymentsNavLink').addClass('active')

    $('#mainContent').load('pages/please_wait.html')

    const billId = Number($('#viewEditBillModalViewPayments').attr('data-bill-id'));
    const entriesPerPage = Number(localStorage.getItem('settings-payments-entries-per-page')) || 10
    const currentPage = 1
    const offset = 0
    const showFrom = 1
    const showTo = entriesPerPage
    const status = ''
    const sort = 'Ascending'
    const method = ''  
    const search = billId

    sessionStorage.setItem('payment-bills-current-page', currentPage)
    sessionStorage.setItem('payment-bills-offset', offset)
    sessionStorage.setItem('payment-bills-show-from', showFrom)
    sessionStorage.setItem('payment-bills-show-to', showTo)
    sessionStorage.setItem('payment-bills-status', status)
    sessionStorage.setItem('payment-bills-sort', sort)
    sessionStorage.setItem('payment-bills-payment-method', method)
    sessionStorage.setItem('payment-bills-search', search)

    setTimeout(() => {
      $('#mainContent').load("pages/payments.html", () => {
        $('#paymentsContentDisplay').load("pages/extensions/payments/bill/contentDisplay.html", () => {

          loadPaymentBills(entriesPerPage, offset, currentPage, showFrom, showTo, status, sort, method, search, true)

          $('#viewEditPaymentModalNavLinkBill').addClass('active')
          $('#viewEditPaymentModalNavLinkBill').attr('aria-current', 'page')
          $('#viewEditPaymentModalNavLinkBill').prop('disabled', true)   

          $('#viewEditPaymentModalNavLinkRent').removeClass('active')
          $('#viewEditPaymentModalNavLinkRent').removeAttr('aria-current')
          $('#viewEditPaymentModalNavLinkRent').prop('disabled', false)

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

export function viewEditPaymentBillModalBillCode(){
  return
  $(document).off('click', '#viewEditPaymentBillModalBillCode').on('click', '#viewEditPaymentBillModalBillCode', () => {
    $('#viewEditPaymentBillModalButtonClose')[0].click()

    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#billsNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#billsNavLink').addClass('active')

    $('#mainContent').load('pages/please_wait.html')

    const billId = Number($('#viewEditPaymentBillModalBillCode').attr('data-bill-id'))
    const entriesPerPage = Number(localStorage.getItem('settings-bills-entries-per-page')) || 10
    const currentPage = 1
    const offset = 0
    const showFrom = 1
    const showTo = entriesPerPage
    const status = ''
    const sort = 'Ascending'
    const bedLevel = ''
    const rentType = ''    
    const search = rentId

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
      $('#mainContent').load("pages/rents.html", () => {
        loadRents(entriesPerPage, offset, currentPage, showFrom, showTo, status, sort, bedLevel, rentType, search, false, true)
      });
    }, TIMEOUT_MS);
  })
}

export function viewEditPaymentBillModalBoarderName(){
  return
  $(document).off('click', '#viewEditPaymentBillModalBoarderName').on('click', '#viewEditPaymentBillModalBoarderName', () => {
    $('#viewEditPaymentBillModalButtonClose')[0].click()

    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#boardersNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#boardersNavLink').addClass('active')

    $('#mainContent').load('pages/please_wait.html')

    const boarderId = Number($('#viewEditPaymentBillModalBoarderName').attr('data-boarder-id'))
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

export function viewEditBillModal() {
  let id, dateCreated

  $(document).off('click', '.view-edit-bill-modal').on('click', '.view-edit-bill-modal', function() {
    id = $(this).attr('data-bill-id')
    dateCreated = $(this).attr('data-date-created')
    $('#viewEditBillModalBody').load('pages/please_wait.html')

    setTimeout(() => {
      $('#viewEditBillModalBody').load('pages/extensions/bills/viewEditModalForm.html', function() {
        openDatabase().then(db => {

          const txBill = db.transaction('bills', 'readonly')
          const storeBill = txBill.objectStore('bills')
          const getRequestBill = storeBill.get(parseInt(id))
          getRequestBill.onsuccess = () => {
            const bill = getRequestBill.result
            $('#viewEditBillModalViewPayments').attr('data-bill-id', bill.bill_id)

            $('#viewEditBillModalBillCode').val(bill.bill_code)
            if(bill.status !== 'Unpaid'){
              $('#viewEditBillModalNotes').prop('disabled', true)
              $('#viewEditBillModalAlert').remove()
              $('#viewEditBillModalUpdate').prop('disabled', true)
              $('#viewEditBillModalUpdate').remove()
            }
            $('#viewEditBillModalStatus').val(bill.status)
            $('#viewEditBillModalBillType').val(bill.bill_type) 
            $('#viewEditBillModalRoom').val(bill.room_name) 
            $('#viewEditBillModalStartPeriod').val(dateFriendly(bill.start_period)) 
            $('#viewEditBillModalEndPeriod').val(dateFriendly(bill.end_period)) 
            $('#viewEditBillModalDueDate').val(dateFriendly(bill.due_date)) 
            $('#viewEditBillModalAmount').val(formatMoney(bill.amount)) 
            $('#viewEditBillModalRemaining').val(formatMoney(bill.remaining)) 
            $('#viewEditBillModalLateFees').val(formatMoney(bill.late_fees)) 
            $('#viewEditBillModalNotes').val(bill.notes)
            $('#viewEditBillModalLastModified').val(dateTimeFriendly(bill.last_modified))
            $('#viewEditBillModalDateCreated').val(dateTimeFriendly(bill.date_created))
          }
        })
      })
    }, TIMEOUT_MS)
  })

  function notesOnBlur(){
    $(document).off('blur', '#viewEditBillModalNotes').on('blur', '#viewEditBillModalNotes', function() {
      $('#viewEditBillModalNotes').val($(this).val().trim())
    })
  } notesOnBlur()

  function submitForm() {
    $(document).off('submit', '#viewEditBillModalForm').on('submit', '#viewEditBillModalForm', function(e) {
      e.preventDefault();

      if(!confirm('Are you sure you want to Set as Unbill?')) return
      
      function activateButton(status){
        switch(status){
          case true:
            $('#viewEditBillModalUpdate').prop('disabled', true)
            $('#viewEditBillModalUpdate .spinner-border').removeClass('visually-hidden')
            break;
          default:
            $('#viewEditBillModalUpdate').prop('disabled', false)
            $('#viewEditBillModalUpdate .spinner-border').addClass('visually-hidden')
            break;
        } 
      } activateButton(true)

      setTimeout(() => {
        const bill = {
          bill_id: parseInt(id),
          bill_code: $('#viewEditBillModalBillCode').val(),
          status: 'Unbilled',
          bill_type: $('#viewEditBillModalBillType').val(),
          room_name: $('#viewEditBillModalRoom').val(),
          start_period: $('#viewEditBillModalStartPeriod').val(),
          end_period: $('#viewEditBillModalEndPeriod').val(),
          due_date: $('#viewEditBillModalDueDate').val(),
          amount: $('#viewEditBillModalAmount').val(),
          remaining: $('#viewEditBillModalAmount').val(),
          late_fees: $('#viewEditBillModal').val(),
          notes: $('#viewEditBillModalNotes').val().trim(),
          last_modified: dateTimeDatabase(),          
          date_created: dateCreated
        }

        openDatabase().then(db => {
          const tx = db.transaction('bills', 'readwrite')
          const store = tx.objectStore('bills')
          store.put(bill)

          tx.oncomplete = () => {
             
            // update all payment bill status connected to this bill
            const txPaymentBill = db.transaction('payment_bills', 'readwrite')
            const storePaymentBill = txPaymentBill.objectStore('payment_bills')
            const index = storePaymentBill.index('bill_id')
            const range = IDBKeyRange.only(Number(bill.bill_id))
            index.openCursor(range).onsuccess = (e) => {
              const cursor = e.target.result;
              if(cursor) {
                const record = cursor.value
                record.status = bill.status
                record.last_modified = dateTimeDatabase()
                cursor.update(record).onsuccess = () => {
                  cursor.continue()
                }
              }
            }

            $('#viewEditBillModalButtonClose')[0].click()
            toast('success', 'Successfully set as unbilled.')
            activateButton(false)
            $(`#viewEditBillModal${id}`).html(`
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
              <td class='bg-primary-subtle'>${bill.start_period}</td>
              <td class='bg-primary-subtle'>${bill.end_period}</td>
              <td class='bg-primary-subtle'>${bill.due_date}</td>
              <td class='bg-primary-subtle'>${bill.amount}</td>
              <td class='bg-primary-subtle'>${bill.remaining}</td>
              <td class='bg-primary-subtle'>${bill.late_fees}</td>
              <td class='bg-primary-subtle'>${bill.notes}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(bill.last_modified)}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(bill.date_created)}</td>
            `)
          }
        })

      }, TIMEOUT_MS)
    })
  } submitForm()
}
