import {toast} from '../../../../backend/index.js'
import {openDatabase, formatMoney, formatMoneyReverse, dateTimeDatabase, dateTimeFriendly, dateFriendly} from '../../../../indexdb/database.js'
import {bhName} from '../../../index.js'
import {loadBills} from '../../bills/loadBills.js'
import {loadRents} from '../../rents/loadRents.js'
import {loadBoarders} from '../../boarders/loadBoarders.js'

function detailsAndBilling(db, paymentBill, id, dateCreated){

  bhName()

  // bill code
  const txBill = db.transaction('bills', 'readonly')
  const storeBill = txBill.objectStore('bills')
  const getRequestBill = storeBill.get(parseInt(paymentBill.bill_id))
  getRequestBill.onsuccess = () => {
    const bill = getRequestBill.result
    const billCode = bill.bill_code
    const billType = bill.bill_type
    $('#viewEditPaymentBillModalBillCode').text(billCode)
    $('#viewEditPaymentBillModalBillCode').attr('data-bill-id', bill.bill_id)
    $('#viewEditPaymentBillModalBillType').val(billType)
    $('#viewEditPaymentBillModalBillingBillCode').text(billCode)
    $('#viewEditPaymentBillModalBillingType').text(billType)

    if(billType === 'Electric'){
      $('#viewEditPaymentBillModalBelongingsDiv').removeClass('d-none')
      $('#viewEditPaymentBillModalBillingBelongingsDiv').removeClass('d-none')
    } else {
      $('#viewEditPaymentBillModalBelongingsDiv').addClass('d-none')
      $('#viewEditPaymentBillModalBillingBelongingsDiv').addClass('d-none')
    }

    // rent code
    const txRent = db.transaction('rents', 'readonly')
    const storeRent = txRent.objectStore('rents')
    const getRequestRent = storeRent.get(parseInt(paymentBill.rent_id))
    getRequestRent.onsuccess = () => {
      const rent = getRequestRent.result
      const rentCode = rent.rent_code
      $('#viewEditPaymentBillModalRentCode').text(rentCode)
      $('#viewEditPaymentBillModalRentCode').attr('data-rent-id', rent.rent_id)
      $('#viewEditPaymentBillModalBillingRentCode').text(rentCode)
    
      // boarder
      const txBoarder = db.transaction('boarders', 'readonly')
      const storeBoarder = txBoarder.objectStore('boarders')
      const getRequestBoarder = storeBoarder.get(parseInt(paymentBill.boarder_id))
      getRequestBoarder.onsuccess = () => {
        const boarder = getRequestBoarder.result
        const fullName = (
            `${boarder.first_name} ${boarder.middle_name} ${boarder.last_name} ${boarder.suffix}`
          ).replace(/\s+/g, ' ')
          .trim();
        const boarderName = `${boarder.nickname} - ${fullName}`

        $('#viewEditPaymentBillModalBoarderName').text(`${boarderName}`)
        $('#viewEditPaymentBillModalBoarderName').attr('data-boarder-id', `${boarder.boarder_id}`)
        $('#viewEditPaymentBillModalBillingBoarderName').text(`${boarderName}`)
      
        $('#viewEditPaymentBillModalPaymentCode').val(paymentBill.payment_code)
        $('#viewEditPaymentBillModalStatus').val(paymentBill.status)
        $('#viewEditPaymentBillModalStartPeriod').val(dateFriendly(paymentBill.start_period))
        $('#viewEditPaymentBillModalEndPeriod').val(dateFriendly(paymentBill.end_period))
        $('#viewEditPaymentBillModalDueDate').val(dateFriendly(paymentBill.due_date))
        $('#viewEditPaymentBillModalAmountDue').val(formatMoney(paymentBill.amount_due))
        $('#viewEditPaymentBillModalBelongings').val(formatMoney(paymentBill.belongings))
        $('#viewEditPaymentBillModalLateFee').val(formatMoney(paymentBill.late_fee))
        $('#viewEditPaymentBillModalTotalAmountDue').val(formatMoney(paymentBill.total_amount_due))
        if(paymentBill.status === "Paid" || paymentBill.status === "Unbilled"){
          $('#viewEditPaymentBillModalPaymentDateTime').attr('type', 'text')
          $('#viewEditPaymentBillModalPaymentDateTime').val(dateTimeFriendly(paymentBill.payment_datetime))
          $('#viewEditPaymentBillModalPaymentDateTime').prop('disabled', true)
          $('#viewEditPaymentBillModalPaymentMethod').val(paymentBill.payment_method)  
          $('#viewEditPaymentBillModalPaymentMethod').prop('disabled', true)
          $('#viewEditPaymentBillModalNotes').prop('disabled', true)
        }
        $('#viewEditPaymentBillModalNotes').val(paymentBill.notes)
        $('#viewEditPaymentBillModalLastModified').val(dateTimeFriendly(paymentBill.last_modified))
        $('#viewEditPaymentBillModalDateCreated').val(dateTimeFriendly(paymentBill.date_created))  
      
        $('#viewEditPaymentBillModalBillingAsOf').text(dateTimeFriendly(dateTimeDatabase()))
        $('#viewEditPaymentBillModalBillingPaymentCode').text(paymentBill.payment_code)
        $('#viewEditPaymentBillModalBillingStatus').text(paymentBill.status)
        $('#viewEditPaymentBillModalBillingStatus').addClass(
          paymentBill.status === 'Unpaid' ? 'text-bg-warning' : (
            paymentBill.status === 'Partially' ? 'text-bg-info' : (
              paymentBill.status === 'Paid' ? 'text-bg-success' : (
                paymentBill.status === 'Overdue' ? 'text-bg-danger' : 'text-bg-primary'
              )
            )
          )
        )
        $('#viewEditPaymentBillModalBillingStartPeriod').text(dateFriendly(paymentBill.start_period))
        $('#viewEditPaymentBillModalBillingEndPeriod').text(dateFriendly(paymentBill.end_period))
        $('#viewEditPaymentBillModalBillingDueDate').text(dateFriendly(paymentBill.due_date))
        $('#viewEditPaymentBillModalBillingAmountDue').text(formatMoney(paymentBill.amount_due))
        $('#viewEditPaymentBillModalBillingBelongings').text(formatMoney(paymentBill.belongings))
        $('#viewEditPaymentBillModalBillingLateFee').text(formatMoney(paymentBill.late_fee))
        $('#viewEditPaymentBillModalBillingTotalAmountDue').text(formatMoney(paymentBill.total_amount_due))
        $('#viewEditPaymentBillModalBillingTotalAmountDue').addClass(
          paymentBill.status === 'Unpaid' ? 'border-warning' : (
            paymentBill.status === 'Partially' ? 'border-info' : (
              paymentBill.status === 'Paid' ? 'border-success' : (
                paymentBill.status === 'Overdue' ? 'border-danger' : 'border-primary'
              )
            )
          )
        )
        if(paymentBill.payment_datetime && paymentBill.payment_method){
          $('#viewEditPaymentBillModalBillingPaymentDateTimeDiv').removeClass('d-none')
          $('#viewEditPaymentBillModalBillingPaymentMethodDiv').removeClass('d-none')
          $('#viewEditPaymentBillModalBillingPaymentDateTime').text(dateTimeFriendly(paymentBill.payment_datetime))
          $('#viewEditPaymentBillModalBillingPaymentMethod').text(paymentBill.payment_method)
        }
        $('#viewEditPaymentBillModalBillingBoardingHouseOwner').text(localStorage.getItem('settings-boarding-house-owner-full-name') || 'JOHN DOE')
      
        if(paymentBill.status === "Unpaid"){
          $('#viewEditPaymentBillModalPartially').removeClass('d-none')
        }
        if(paymentBill.status === "Unpaid" || paymentBill.status === "Partially" || paymentBill.status === "Overdue"){
          $('#viewEditPaymentBillModalPaid').removeClass('d-none')
        }
      
        // download receipt
        $('#viewEditPaymentBillModalBillingDownload').off('click').on('click', function(){
          function activateButton(status){
            switch(status){
              case true:
                $('#viewEditPaymentBillModalBillingDownload').prop('disabled', true)
                $('#viewEditPaymentBillModalBillingDownload .spinner-border').removeClass('visually-hidden')
                break;
              default:
                $('#viewEditPaymentBillModalBillingDownload').prop('disabled', false)
                $('#viewEditPaymentBillModalBillingDownload .spinner-border').addClass('visually-hidden')
                break;
            } 
          } activateButton(true)
      
          html2canvas($(`#viewEditPaymentBillModalBilling`)[0]).then(function(canvas) {
            const dataURL = canvas.toDataURL('image/png')
            const link = $('<a></a>').attr('href', dataURL).attr('download', `${paymentBill.payment_code} ( RECEIPT ).png`).appendTo('body')      
            link[0].click()
            link.remove()
            setTimeout(() => {
              activateButton(false)
            }, 5000);
          })
        })
      
        // print receipt
        $('#viewEditPaymentBillModalBillingPrint').off('click').on('click', function(){
          function activateButton(status){
            switch(status){
              case true:
                $('#viewEditPaymentRentModalBillingPrint').prop('disabled', true)
                $('#viewEditPaymentRentModalBillingPrint .spinner-border').removeClass('visually-hidden')
                break;
              default:
                $('#viewEditPaymentRentModalBillingPrint').prop('disabled', false)
                $('#viewEditPaymentRentModalBillingPrint .spinner-border').addClass('visually-hidden')
                break;
            } 
          } activateButton(true)
      
          $('#sectionMainContent').addClass('d-none')
          $('#sectionPrintContent').removeClass('d-none').html($('#viewEditPaymentBillModalBilling').html())
          window.onafterprint = () => {
            $('#sectionPrintContent').addClass('d-none').empty()
            $('#sectionMainContent').removeClass('d-none')
            activateButton(false)
          }
          window.print()
        })
        
        function updateData(dataStatus, buttonStatus) {
          function activateButton(status){
            switch(status){
              case true:
                $(buttonStatus).prop('disabled', true)
                $(buttonStatus).children('.spinner-border').removeClass('visually-hidden')
                $('.view-edit-payment-bill-modal-status').each(function() {
                  if($(this).attr('data-status') !== dataStatus){
                    $(this).prop('disabled', true)
                  }
                })
                break;
              default:
                $(buttonStatus).prop('disabled', false)
                $(buttonStatus).children('.spinner-border').addClass('visually-hidden')
                $('.view-edit-payment-bill-modal-status').each(function() {
                  if($(this).attr('data-status') !== dataStatus){
                    $(this).prop('disabled', false)
                  }
                })
                break;
            } 
          } activateButton(true)
      
          setTimeout(() => {
            openDatabase().then(db => {
              const billStore = db.transaction('bills', 'readwrite').objectStore('bills')
              const billRequest = billStore.get(Number(paymentBill.bill_id))
              billRequest.onsuccess = () => {
                const billRecord = billRequest.result
                if(billRecord){
                  if(dataStatus === "Paid"){
                    const currentRemainingBalance = Number(billRecord.remaining)
                    const newRemainingBalance = currentRemainingBalance - Number(paymentBill.total_amount_due)
                    const newBillStatus = (newRemainingBalance <= 0) ? "Paid" : "Partially"
                    
                    billRecord.status = newBillStatus
                    billRecord.remaining = (newRemainingBalance <= 0) ? '0.00' : newRemainingBalance.toFixed(2)
                    billRecord.late_fees = (newRemainingBalance < 0) ? (Number(paymentBill.total_amount_due) - currentRemainingBalance).toFixed(2) : '0.00'
                    billRecord.last_modified = dateTimeDatabase()
                    billStore.put(billRecord)
                  }
                }
              }

              db.transaction('payment_bills', 'readwrite').objectStore('payment_bills').put({
                payment_bill_id: parseInt(id),
                boarder_id: paymentBill.boarder_id,
                payment_code: paymentBill.payment_code,
                status: dataStatus,
                rent_id: paymentBill.rent_id,
                bill_id: paymentBill.bill_id,
                start_period: paymentBill.start_period,
                end_period: paymentBill.end_period,
                amount_due: paymentBill.amount_due,
                belongings: paymentBill.belongings,
                due_date: paymentBill.due_date,
                late_fee: paymentBill.late_fee,
                total_amount_due: paymentBill.total_amount_due,
                payment_datetime: (dataStatus === "Paid") ? $('#viewEditPaymentBillModalPaymentDateTime').val() : '',
                payment_method: (dataStatus === "Paid") ? $('#viewEditPaymentBillModalPaymentMethod').val() : '',
                notes: $('#viewEditPaymentBillModalNotes').val().trim(),
                last_modified: dateTimeDatabase(),
                date_created: dateCreated
              })

              $('#viewEditPaymentBillModalButtonClose')[0].click()
              toast('success', `Successfully ${                
                dataStatus === 'Partially' ? 'set as Partially' : 'mark as Paid'              
              }.`)
              activateButton(false)

              $(`#viewEditPaymentBillModal${id}`).html(`
                <td class='bg-primary-subtle'>${billCode}</td>
                <td class='bg-primary-subtle'>${billType}</td>
                <td class='bg-primary-subtle'>${rentCode}</td>
                <td class='bg-primary-subtle'>${boarderName}</td>
                <td class='bg-primary-subtle'>${paymentBill.payment_code}</td>
                <td class='bg-primary-subtle'><span class="badge ${
                  dataStatus === 'Unpaid' ? 'text-bg-warning' : (
                    dataStatus === 'Partially' ? 'text-bg-info' : (
                      dataStatus === 'Paid' ? 'text-bg-success' : (
                        dataStatus === 'Overdue' ? 'text-bg-danger' : 'text-bg-primary'
                      )
                    )
                  )
                }">${dataStatus}</span></td>
                <td class='bg-primary-subtle'>${dateFriendly(paymentBill.start_period)}</td>
                <td class='bg-primary-subtle'>${dateFriendly(paymentBill.end_period)}</td>
                <td class='bg-primary-subtle'>${dateFriendly(paymentBill.due_date)}</td>
                <td class='bg-primary-subtle'>${formatMoney(paymentBill.amount_due)}</td>
                <td class='bg-primary-subtle d-none'>${(billType === 'Electric') ? formatMoney(paymentBill.belongings) : 'Not Applicable'}</td>
                <td class='bg-primary-subtle'>${formatMoney(paymentBill.late_fee)}</td>
                <td class='bg-primary-subtle'>${formatMoney(paymentBill.total_amount_due)}</td>
                <td class='bg-primary-subtle'>${dateTimeFriendly((dataStatus === "Paid") ? $('#viewEditPaymentBillModalPaymentDateTime').val() : '')}</td>
                <td class='bg-primary-subtle'>${(dataStatus === "Paid") ? $('#viewEditPaymentBillModalPaymentMethod').val() : ''}</td>
                <td class='bg-primary-subtle'>${$('#viewEditPaymentBillModalNotes').val().trim()}</td>
                <td class='bg-primary-subtle'>${dateTimeFriendly(paymentBill.last_modified)}</td>
                <td class='bg-primary-subtle'>${dateTimeFriendly(paymentBill.date_created)}</td>
              `)
            })
          }, TIMEOUT_MS)
        }
      
        function submitForm() {
          $('.view-edit-payment-bill-modal-status').each(function() {
            const buttonStatus = $(this)
            buttonStatus.off('click').on('click', function() {
              const dataStatus = buttonStatus.attr('data-status')
      
              if(!confirm(`Are you sure you want to ${
                (dataStatus === "Unbilled") ? 'Set as Unbill' : (
                  (dataStatus === "Partially") ? 'Set as Partially' : 'Mark as Paid'
                )
              }?`)) return
      
              if(dataStatus === "Paid") {
                if(!$('#viewEditPaymentBillModalPaymentDateTime').val().trim()){
                  return $('#viewEditPaymentBillModalPaymentDateTime').focus()
                }
                if(!$('#viewEditPaymentBillModalPaymentMethod').val().trim()){
                  return $('#viewEditPaymentBillModalPaymentMethod').focus()
                }
              }            
              updateData(dataStatus, buttonStatus)
            })
          })      
        } submitForm()
      }
    }
  }

}

export function viewEditPaymentBillModalBillCode(){
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
    const billType = ''
    const search = billId

    sessionStorage.setItem('bills-current-page', currentPage)
    sessionStorage.setItem('bills-offset', offset)
    sessionStorage.setItem('bills-show-from', showFrom)
    sessionStorage.setItem('bills-show-to', showTo)
    sessionStorage.setItem('bills-status', status)
    sessionStorage.setItem('bills-sort', sort)
    sessionStorage.setItem('bills-bill-type', billType)
    sessionStorage.setItem('bills-search', search)
    setTimeout(() => {
      $('#mainContent').load("pages/bills.html", () => {
        loadBills(entriesPerPage, offset, currentPage, showFrom, showTo, status, sort, billType, search, true)
      });
    }, TIMEOUT_MS);
  })
}

export function viewEditPaymentBillModalRentCode(){
  $(document).off('click', '#viewEditPaymentBillModalRentCode').on('click', '#viewEditPaymentBillModalRentCode', () => {
    $('#viewEditPaymentBillModalButtonClose')[0].click()

    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#rentsNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#rentsNavLink').addClass('active')

    $('#mainContent').load('pages/please_wait.html')

    const rentId = Number($('#viewEditPaymentBillModalRentCode').attr('data-rent-id'))
    const entriesPerPage = Number(localStorage.getItem('settings-rents-entries-per-page')) || 10
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

export function viewEditPaymentBillModal(){
  let id, dateCreated

  $(document).off('click', '.view-edit-payment-bill-modal').on('click', '.view-edit-payment-bill-modal', function() {
    id = $(this).attr('data-payment-bill-id')
    dateCreated = $(this).attr('data-date-created')
    $('#viewEditPaymentBillModalBody').load('pages/please_wait.html')

    setTimeout(() => {
      $('#viewEditPaymentBillModalBody').load('pages/extensions/payments/bill/viewEditModalForm.html', () => {
        $('#viewEditPaymentBillModalSection').load('pages/extensions/payments/bill/viewEditModalFormDetails.html', function () {
          openDatabase().then(db => {
            const txPaymentBill = db.transaction('payment_bills', 'readonly')
            const storePaymentBill = txPaymentBill.objectStore('payment_bills')
            const getRequestPaymentBill = storePaymentBill.get(parseInt(id))
            getRequestPaymentBill.onsuccess = () => {
              const paymentBill = getRequestPaymentBill.result
              detailsAndBilling(db, paymentBill, id, dateCreated)  

              $(document).off('click', '#viewEditPaymentBillModalNavLinkDetails').on('click', '#viewEditPaymentBillModalNavLinkDetails', function() {
                $(this).addClass('active')
                $(this).attr('aria-current', 'page')
                $(this).prop('disabled', true)

                $('#viewEditPaymentBillModalNavLinkBilling').removeClass('active')
                $('#viewEditPaymentBillModalNavLinkBilling').removeAttr('aria-current')
                $('#viewEditPaymentBillModalNavLinkBilling').prop('disabled', false)

                $('#viewEditPaymentBillModalSection').load('pages/please_wait.html')
                setTimeout(() => {
                  $('#viewEditPaymentBillModalSection').load('pages/extensions/payments/bill/viewEditModalFormDetails.html', function() {
                    detailsAndBilling(db, paymentBill, id, dateCreated)
                  })
                }, TIMEOUT_MS)
              })
              $(document).off('click', '#viewEditPaymentBillModalNavLinkBilling').on('click', '#viewEditPaymentBillModalNavLinkBilling', function() {
                $(this).addClass('active')
                $(this).attr('aria-current', 'page')
                $(this).prop('disabled', true)

                $('#viewEditPaymentBillModalNavLinkDetails').removeClass('active')
                $('#viewEditPaymentBillModalNavLinkDetails').removeAttr('aria-current')
                $('#viewEditPaymentBillModalNavLinkDetails').prop('disabled', false)          

                $('#viewEditPaymentBillModalSection').load('pages/please_wait.html')
                setTimeout(() => {
                  $('#viewEditPaymentBillModalSection').load('pages/extensions/payments/bill/viewEditModalFormBilling.html', function() {
                    detailsAndBilling(db, paymentBill, id, dateCreated)
                  })
                }, TIMEOUT_MS)
              })
            }
          })
        })       
      })
    }, TIMEOUT_MS)
  })
}