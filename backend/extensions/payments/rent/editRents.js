import {toast} from '../../../../backend/index.js'
import {openDatabase, formatMoney, formatMoneyReverse, dateTimeDatabase, dateTimeFriendly, dateFriendly, endPeriod} from '../../../../indexdb/database.js'
import {bhName} from '../../../index.js'
import {loadRents} from '../../rents/loadRents.js'
import {loadBoarders} from '../../boarders/loadBoarders.js'

function detailsAndBilling(db, paymentRent, id, dateCreated) {

  bhName()

  // rent code
  const txRent = db.transaction('rents', 'readonly')
  const storeRent = txRent.objectStore('rents')
  const getRequestRent = storeRent.get(parseInt(paymentRent.rent_id))
  getRequestRent.onsuccess = () => {
    const rent = getRequestRent.result
    const rentStatus = rent.status
    const rentCode = rent.rent_code
    $('#viewEditPaymentRentModalRentCode').text(rentCode)
    $('#viewEditPaymentRentModalRentCode').attr('data-rent-id', rent.rent_id)
    $('#viewEditPaymentRentModalBillingRentCode').text(rentCode)
    if(rent.rent_type === 'Regular'){
      $('#viewEditPaymentRentModalNextPaymentDue').text(dateFriendly(endPeriod(paymentRent.end_period, (localStorage.getItem('settings-boarders-billing-cycle-regular') || 30))))
    } else {
      $('#viewEditPaymentRentModalNextPaymentDue').text(dateFriendly(endPeriod(paymentRent.end_period, (localStorage.getItem('settings-boarders-billing-cycle-transient') || 1))))
    }

    // boarder
    const txBoarder = db.transaction('boarders', 'readonly')
    const storeBoarder = txBoarder.objectStore('boarders')
    const getRequestBoarder = storeBoarder.get(parseInt(paymentRent.boarder_id))
    getRequestBoarder.onsuccess = () => {
      const boarder = getRequestBoarder.result
      const fullName = (
          `${boarder.first_name} ${boarder.middle_name} ${boarder.last_name} ${boarder.suffix}`
        ).replace(/\s+/g, ' ')
        .trim();
      const boarderName = `${boarder.nickname} - ${fullName}`
      $('#viewEditPaymentRentModalBoarderName').text(boarderName)
      $('#viewEditPaymentRentModalBoarderName').attr('data-boarder-id', `${boarder.boarder_id}`)
      $('#viewEditPaymentRentModalBillingBoarderName').text(boarderName)

      $('#viewEditPaymentRentModalPaymentCode').val(paymentRent.payment_code)
      $('#viewEditPaymentRentModalStatus').val(paymentRent.status)
      $('#viewEditPaymentRentModalStartPeriod').val(dateFriendly(paymentRent.start_period))
      $('#viewEditPaymentRentModalEndPeriod').val(dateFriendly(paymentRent.end_period))
      $('#viewEditPaymentRentModalDueDate').val(dateFriendly(paymentRent.due_date))
      $('#viewEditPaymentRentModalAmountDue').val(formatMoney(paymentRent.amount_due))
      $('#viewEditPaymentRentModalDiscount').val(`-${formatMoney(paymentRent.discount_amount)}`)
      $('#viewEditPaymentRentModalLateFee').val(formatMoney(paymentRent.late_fee))
      $('#viewEditPaymentRentModalTotalAmountDue').val(formatMoney(paymentRent.total_amount_due))
      if(paymentRent.status === "Paid" || paymentRent.status === "Unbilled"){
        $('#viewEditPaymentRentModalPaymentDateTime').attr('type', 'text')
        $('#viewEditPaymentRentModalPaymentDateTime').val(dateTimeFriendly(paymentRent.payment_datetime))
        $('#viewEditPaymentRentModalPaymentDateTime').prop('disabled', true)
        $('#viewEditPaymentRentModalPaymentMethod').val(paymentRent.payment_method)  
        $('#viewEditPaymentRentModalPaymentMethod').prop('disabled', true)
        $('#viewEditPaymentRentModalNotes').prop('disabled', true)
      }
      $('#viewEditPaymentRentModalNotes').val(paymentRent.notes)
      $('#viewEditPaymentRentModalLastModified').val(dateTimeFriendly(paymentRent.last_modified))
      $('#viewEditPaymentRentModalDateCreated').val(dateTimeFriendly(paymentRent.date_created))  
    
      $('#viewEditPaymentRentModalBillingAsOf').text(dateTimeFriendly(dateTimeDatabase()))
      $('#viewEditPaymentRentModalBillingPaymentCode').text(paymentRent.payment_code)
      $('#viewEditPaymentRentModalBillingStatus').text(paymentRent.status)
      $('#viewEditPaymentRentModalBillingStatus').addClass(
        paymentRent.status === 'Unpaid' ? 'text-bg-warning' : (
          paymentRent.status === 'Partially' ? 'text-bg-info' : (
            paymentRent.status === 'Paid' ? 'text-bg-success' : (
              paymentRent.status === 'Overdue' ? 'text-bg-danger' : 'text-bg-primary'
            )
          )
        )
      )
      $('#viewEditPaymentRentModalBillingStartPeriod').text(dateFriendly(paymentRent.start_period))
      $('#viewEditPaymentRentModalBillingEndPeriod').text(dateFriendly(paymentRent.end_period))
      $('#viewEditPaymentRentModalBillingDueDate').text(dateFriendly(paymentRent.due_date))
      $('#viewEditPaymentRentModalBillingAmountDue').text(formatMoney(paymentRent.amount_due))
      $('#viewEditPaymentRentModalBillingDiscount').text(`-${formatMoney(paymentRent.discount_amount)}`)
      $('#viewEditPaymentRentModalBillingLateFee').text(formatMoney(paymentRent.late_fee))
      $('#viewEditPaymentRentModalBillingTotalAmountDue').text(formatMoney(paymentRent.total_amount_due))
      $('#viewEditPaymentRentModalBillingTotalAmountDue').addClass(
        paymentRent.status === 'Unpaid' ? 'border-warning' : (
          paymentRent.status === 'Partially' ? 'border-info' : (
            paymentRent.status === 'Paid' ? 'border-success' : (
              paymentRent.status === 'Overdue' ? 'border-danger' : 'border-primary'
            )
          )
        )
      )
      if(paymentRent.payment_datetime && paymentRent.payment_method){
        $('#viewEditPaymentRentModalBillingPaymentDateTimeDiv').removeClass('d-none')
        $('#viewEditPaymentRentModalBillingPaymentMethodDiv').removeClass('d-none')
        $('#viewEditPaymentRentModalBillingPaymentDateTime').text(dateTimeFriendly(paymentRent.payment_datetime))
        $('#viewEditPaymentRentModalBillingPaymentMethod').text(paymentRent.payment_method)
      }
      $('#viewEditPaymentRentModalBillingBoardingHouseOwner').text(localStorage.getItem('settings-boarding-house-owner-full-name') || 'JOHN DOE')

      if(paymentRent.status === "Unpaid" || paymentRent.status === "Overdue"){
        $('#viewEditPaymentRentModalUnbilled').removeClass('d-none')        
      }
      if(paymentRent.status === "Unpaid"){
        $('#viewEditPaymentRentModalPartially').removeClass('d-none')
      }
      if(paymentRent.status === "Unpaid" || paymentRent.status === "Partially" || paymentRent.status === "Overdue"){
        $('#viewEditPaymentRentModalPaid').removeClass('d-none')
      }
      if(paymentRent.status === "Paid" || paymentRent.status === "Unbilled"){
        $('#viewEditPaymentRentModalNextPaymentDueDiv').addClass('d-none')
      }
    
      // download receipt
      $('#viewEditPaymentRentModalBillingDownload').off('click').on('click', function(){
        function activateButton(status){
          switch(status){
            case true:
              $('#viewEditPaymentRentModalBillingDownload').prop('disabled', true)
              $('#viewEditPaymentRentModalBillingDownload .spinner-border').removeClass('visually-hidden')
              break;
            default:
              $('#viewEditPaymentRentModalBillingDownload').prop('disabled', false)
              $('#viewEditPaymentRentModalBillingDownload .spinner-border').addClass('visually-hidden')
              break;
          } 
        } activateButton(true)
    
        html2canvas($(`#viewEditPaymentRentModalBilling`)[0]).then(function(canvas) {
          const dataURL = canvas.toDataURL('image/png')
          const link = $('<a></a>').attr('href', dataURL).attr('download', `${paymentRent.payment_code} ( RECEIPT ).png`).appendTo('body')      
          link[0].click()
          link.remove()
          setTimeout(() => {
            activateButton(false)
          }, 5000);
        })
      })
    
      // print receipt
      $('#viewEditPaymentRentModalBillingPrint').off('click').on('click', function(){
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
        $('#sectionPrintContent').removeClass('d-none').html($('#viewEditPaymentRentModalBilling').html())
        window.onafterprint = () => {
          $('#sectionPrintContent').addClass('d-none').empty()
          $('#sectionMainContent').removeClass('d-none')
          activateButton(false)
        }
        window.print()
      })

      function updateData(dataStatus, buttonStatus){
        function activateButton(status){
          switch(status){
            case true:
              $(buttonStatus).prop('disabled', true)
              $(buttonStatus).children('.spinner-border').removeClass('visually-hidden')
              $('.view-edit-payment-rent-modal-status').each(function() {
                if($(this).attr('data-status') !== dataStatus){
                  $(this).prop('disabled', true)
                }
              })
              break;
            default:
              $(buttonStatus).prop('disabled', false)
              $(buttonStatus).children('.spinner-border').addClass('visually-hidden')
              $('.view-edit-payment-rent-modal-status').each(function() {
                if($(this).attr('data-status') !== dataStatus){
                  $(this).prop('disabled', false)
                }
              })
              break;
          } 
        } activateButton(true)
  
        setTimeout(() => {
          openDatabase().then(db => {
            const rentStore = db.transaction('rents', 'readwrite').objectStore('rents')
            const rentRequest = rentStore.get(Number(paymentRent.rent_id))
            rentRequest.onsuccess = () => {
              const rentRecord = rentRequest.result
              if(rentRecord){
                if(dataStatus === "Unbilled"){
                  if(rentRecord.status === 'Ongoing') {
                    rentRecord.status = 'On Break'
                    rentRecord.last_modified = dateTimeDatabase()
                    rentStore.put(rentRecord)
                  }
                } 
              }
            }

            db.transaction('payment_rents', 'readwrite').objectStore('payment_rents').put({
              payment_rent_id: parseInt(id),
              boarder_id: paymentRent.boarder_id,
              payment_code: paymentRent.payment_code,
              status: dataStatus,
              rent_id: paymentRent.rent_id,
              start_period: paymentRent.start_period,
              end_period: paymentRent.end_period,
              amount_due: paymentRent.amount_due,
              discount_amount: paymentRent.discount_amount,
              due_date: paymentRent.due_date,
              late_fee: paymentRent.late_fee,
              total_amount_due: paymentRent.total_amount_due,
              payment_datetime: (dataStatus === "Paid") ? $('#viewEditPaymentRentModalPaymentDateTime').val() : '',
              payment_method: (dataStatus === "Paid") ? $('#viewEditPaymentRentModalPaymentMethod').val() : '',
              notes: $('#viewEditPaymentRentModalNotes').val().trim(),
              last_modified: dateTimeDatabase(),
              date_created: dateCreated
            })
  
            // generate new payment
            if(dataStatus === "Paid" && rentStatus === "Ongoing"){
              const DATETIME_DATABASE = dateTimeDatabase().replace(/[-:]/g, '').split(' ')
              const paymentCode = `PR${DATETIME_DATABASE[0]}-${DATETIME_DATABASE[1]}`
              const startPeriodDate = paymentRent.end_period
              const endPeriodDate = endPeriod(startPeriodDate,
                (rent.rent_type === 'Regular') ? 
                  (localStorage.getItem('settings-boarders-billing-cycle-regular') || 30) :
                  (localStorage.getItem('settings-boarders-billing-cycle-transient') || 1)
              )
              const amountDue = Number((rent.rent_type === 'Regular') ? (formatMoneyReverse(localStorage.getItem('settings-boarders-billing-amount-per-cycle-regular') || '700.00')) : (formatMoneyReverse(localStorage.getItem('settings-boarders-billing-amount-per-cycle-transient') || '50.00'))).toFixed(2)
              const discountAmount = (amountDue * (Number(rent.discount_percent) / 100)).toFixed(2)
              const dueDate = endPeriodDate
              const totalAmountDue = (amountDue - discountAmount).toFixed(2)
              db.transaction('payment_rents', 'readwrite').objectStore('payment_rents').add({
                boarder_id: paymentRent.boarder_id,
                payment_code: paymentCode,
                status: 'Unpaid',
                rent_id: paymentRent.rent_id,
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
  
            $('#viewEditPaymentRentModalButtonClose')[0].click()
            toast('success', `Successfully ${
              (dataStatus === 'Unbilled') ? 'set as Unbilled' : (
                dataStatus === 'Partially' ? 'set as Partially' : 'mark as Paid'
              )
            }.`)
            activateButton(false)
            $(`#viewEditPaymentRentModal${id}`).html(`
              <td class='bg-primary-subtle'>${rentCode}</td>
              <td class='bg-primary-subtle'>${boarderName}</td>
              <td class='bg-primary-subtle'>${paymentRent.payment_code}</td>
              <td class='bg-primary-subtle'><span class="badge ${
                dataStatus === 'Unpaid' ? 'text-bg-warning' : (
                  dataStatus === 'Partially' ? 'text-bg-info' : (
                    dataStatus === 'Paid' ? 'text-bg-success' : (
                      dataStatus === 'Overdue' ? 'text-bg-danger' : 'text-bg-primary'
                    )
                  )
                )
              }">${dataStatus}</span></td>
              <td class='bg-primary-subtle'>${dateFriendly(paymentRent.start_period)}</td>
              <td class='bg-primary-subtle'>${dateFriendly(paymentRent.end_period)}</td>
              <td class='bg-primary-subtle'>${dateFriendly(paymentRent.due_date)}</td>
              <td class='bg-primary-subtle'>${formatMoney(paymentRent.amount_due)}</td>
              <td class='bg-primary-subtle'>-${formatMoney(paymentRent.discount_amount)}</td>
              <td class='bg-primary-subtle'>${formatMoney(paymentRent.late_fee)}</td>
              <td class='bg-primary-subtle'>${formatMoney(paymentRent.total_amount_due)}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly((dataStatus === "Paid") ? $('#viewEditPaymentRentModalPaymentDateTime').val() : '')}</td>
              <td class='bg-primary-subtle'>${(dataStatus === "Paid") ? $('#viewEditPaymentRentModalPaymentMethod').val() : ''}</td>
              <td class='bg-primary-subtle'>${$('#viewEditPaymentRentModalNotes').val().trim()}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(paymentRent.last_modified)}</td>
              <td class='bg-primary-subtle'>${dateTimeFriendly(paymentRent.date_created)}</td>
            `)              
          })
        }, TIMEOUT_MS)
      }
    
      function submitForm(){
        $('.view-edit-payment-rent-modal-status').each(function() {
          const buttonStatus = $(this)
          buttonStatus.off('click').on('click', function() {
            const dataStatus = buttonStatus.attr('data-status')

            if(!confirm(`Are you sure you want to ${
              (dataStatus === "Unbilled") ? 'Set as Unbill' : (
                (dataStatus === "Partially") ? 'Set as Partially' : 'Mark as Paid'
              )
            }?`)) return

            if(dataStatus === "Paid") {
              if(!$('#viewEditPaymentRentModalPaymentDateTime').val().trim()){
                return $('#viewEditPaymentRentModalPaymentDateTime').focus()
              }
              if(!$('#viewEditPaymentRentModalPaymentMethod').val().trim()){
                return $('#viewEditPaymentRentModalPaymentMethod').focus()
              }
            }            
            updateData(dataStatus, buttonStatus)
          })
        })      
      } submitForm()
    }
  }
}

export function viewEditPaymentRentModalRentCode(){
  $(document).off('click', '#viewEditPaymentRentModalRentCode').on('click', '#viewEditPaymentRentModalRentCode', () => {
    $('#viewEditPaymentRentModalButtonClose')[0].click()

    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#rentsNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#rentsNavLink').addClass('active')

    $('#mainContent').load('pages/please_wait.html')

    const rentId = Number($('#viewEditPaymentRentModalRentCode').attr('data-rent-id'))
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

export function viewEditPaymentRentModalBoarderName(){
  $(document).off('click', '#viewEditPaymentRentModalBoarderName').on('click', '#viewEditPaymentRentModalBoarderName', () => {
    $('#viewEditPaymentRentModalButtonClose')[0].click()

    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#boardersNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#boardersNavLink').addClass('active')

    $('#mainContent').load('pages/please_wait.html')

    const boarderId = Number($('#viewEditPaymentRentModalBoarderName').attr('data-boarder-id'))
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

export function viewEditPaymentRentModal(){
  let id, dateCreated

  $(document).off('click', '.view-edit-payment-rent-modal').on('click', '.view-edit-payment-rent-modal', function() {
    id = $(this).attr('data-payment-rent-id')
    dateCreated = $(this).attr('data-date-created')
    $('#viewEditPaymentRentModalBody').load('pages/please_wait.html')

    setTimeout(() => {
      $('#viewEditPaymentRentModalBody').load('pages/extensions/payments/rent/viewEditModalForm.html', () => {
        $('#viewEditPaymentRentModalSection').load('pages/extensions/payments/rent/viewEditModalFormDetails.html', function() {
          openDatabase().then(db => {
            const txPaymentRent = db.transaction('payment_rents', 'readonly')
            const storePaymentRent = txPaymentRent.objectStore('payment_rents')
            const getRequestPaymentRent = storePaymentRent.get(parseInt(id))
            getRequestPaymentRent.onsuccess = () => {
              const paymentRent = getRequestPaymentRent.result
              detailsAndBilling(db, paymentRent, id, dateCreated)              

              $(document).off('click', '#viewEditPaymentRentModalNavLinkDetails').on('click', '#viewEditPaymentRentModalNavLinkDetails', function() {
                $(this).addClass('active')
                $(this).attr('aria-current', 'page')
                $(this).prop('disabled', true)
      
                $('#viewEditPaymentRentModalNavLinkBilling').removeClass('active')
                $('#viewEditPaymentRentModalNavLinkBilling').removeAttr('aria-current')
                $('#viewEditPaymentRentModalNavLinkBilling').prop('disabled', false)
      
                $('#viewEditPaymentRentModalSection').load('pages/please_wait.html')
                setTimeout(() => {
                  $('#viewEditPaymentRentModalSection').load('pages/extensions/payments/rent/viewEditModalFormDetails.html', function() {
                    detailsAndBilling(db, paymentRent, id, dateCreated)
                  })
                }, TIMEOUT_MS)
              })
      
              $(document).off('click', '#viewEditPaymentRentModalNavLinkBilling').on('click', '#viewEditPaymentRentModalNavLinkBilling', function() {
                $(this).addClass('active')
                $(this).attr('aria-current', 'page')
                $(this).prop('disabled', true)
      
                $('#viewEditPaymentRentModalNavLinkDetails').removeClass('active')
                $('#viewEditPaymentRentModalNavLinkDetails').removeAttr('aria-current')
                $('#viewEditPaymentRentModalNavLinkDetails').prop('disabled', false)          
      
                $('#viewEditPaymentRentModalSection').load('pages/please_wait.html')
                setTimeout(() => {
                  $('#viewEditPaymentRentModalSection').load('pages/extensions/payments/rent/viewEditModalFormBilling.html', function() {
                   detailsAndBilling(db, paymentRent, id, dateCreated)
                  })
                }, TIMEOUT_MS)
              })
            }
          })
        })  
      })
    }, TIMEOUT_MS)

    function notesOnBlur(){
      $(document).off('blur', '#viewEditPaymentRentModalNotes').on('blur', '#viewEditPaymentRentModalNotes', function() {
        $('#viewEditPaymentRentModalNotes').val($(this).val().trim())
      })
    } notesOnBlur()   

  })
}
