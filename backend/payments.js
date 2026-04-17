import {navbarSupportedContentHidden, pleaseWaitModalIsDisplay, bhName} from './index.js'
import {loadPaymentRents} from './extensions/payments/rent/loadPaymentRents.js'
import {applyFilterRents} from './extensions/payments/rent/filterRents.js'
import {viewEditPaymentRentModalRentCode, viewEditPaymentRentModalBoarderName, viewEditPaymentRentModal} from './extensions/payments/rent/editRents.js'
import {loadPaymentBills} from './extensions/payments/bill/loadPaymentBills.js'
import {applyFilterBills} from './extensions/payments/bill/filterBills.js'
import {viewEditPaymentBillModalBillCode, viewEditPaymentBillModalRentCode,  viewEditPaymentBillModalBoarderName, viewEditPaymentBillModal} from './extensions/payments/bill/editBills.js'
import {autoUpdateOverduePaymentBills} from './extensions/payments/bill/overdue.js'
import {autoUpdateOverduePaymentRents} from './extensions/payments/rent/overdue.js'

$(document).ready(function(){

  function paymentsActiveNavLink(){
    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#paymentsNavItem').addClass('bg-primary-subtle')
    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#paymentsNavLink').addClass('active')
    navbarSupportedContentHidden()
  }

  function paymentRentsPagePagination(){
    $(document).off('click', '#prevPagePaymentRents').on('click', '#prevPagePaymentRents', function() {
      const entriesPerPage = Number(localStorage.getItem('settings-payments-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('payment-rents-current-page') || 1) - 1
      const offset = Number(sessionStorage.getItem('payment-rents-offset')) - entriesPerPage
      const showFrom = Number(sessionStorage.getItem('payment-rents-show-from')) - entriesPerPage
      const showTo = Number(sessionStorage.getItem('payment-rents-show-to')) - entriesPerPage
      const status = sessionStorage.getItem('payment-rents-status') || ''
      const sort = sessionStorage.getItem('payment-rents-sort') || 'Ascending'
      const paymentMethod = sessionStorage.getItem('payment-rents-payment-method') || ''
      const search = sessionStorage.getItem('payment-rents-search') || ''

      function activateButton(status){
        switch(status){
          case true:
            $('#prevPagePaymentRents').prop('disabled', true)
            $('#prevPagePaymentRents .spinner-border').removeClass('visually-hidden')
            break;
          default:
            $('#prevPagePaymentRents').prop('disabled', false)
            $('#prevPagePaymentRents .spinner-border').addClass('visually-hidden')
            break;
        } 
      } activateButton(true)
      setTimeout(() => { 
        activateButton(false)
        paymentRentsContentLoad(offset, currentPage, showFrom, showTo, status, sort, paymentMethod, search)  
        sessionStorage.setItem('payment-rents-offset', offset)
        sessionStorage.setItem('payment-rents-current-page', currentPage)
        sessionStorage.setItem('payment-rents-show-from', showFrom)      
        sessionStorage.setItem('payment-rents-show-to', showTo)
        sessionStorage.setItem('payment-rents-status', status)
        sessionStorage.setItem('payment-rents-sort', sort)
        sessionStorage.setItem('payment-rents-payment-method', paymentMethod)
        sessionStorage.setItem('payment-rents-search', search)
      }, TIMEOUT_MS)
    })
    $(document).off('click', '#nextPagePaymentRents').on('click', '#nextPagePaymentRents', () => {
      const entriesPerPage = Number(localStorage.getItem('settings-payments-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('payment-rents-current-page') || 1) + 1
      const offset = Number(sessionStorage.getItem('payment-rents-offset')) + entriesPerPage
      const showFrom = Number(sessionStorage.getItem('payment-rents-show-from')) + entriesPerPage
      const showTo = Number(sessionStorage.getItem('payment-rents-show-to')) + entriesPerPage
      const status = sessionStorage.getItem('payment-rents-status') || ''
      const sort = sessionStorage.getItem('payment-rents-sort') || 'Ascending'
      const paymentMethod = sessionStorage.getItem('payment-rents-payment-method') || ''
      const search = sessionStorage.getItem('payment-rents-search') || ''

      function activateButton(status){
        switch(status){
          case true:
            $('#nextPagePaymentRents').prop('disabled', true)
            $('#nextPagePaymentRents .spinner-border').removeClass('visually-hidden')
            break;
          default:
            $('#nextPagePaymentRents').prop('disabled', false)
            $('#nextPagePaymentRents .spinner-border').addClass('visually-hidden')
            break;
        } 
      } activateButton(true)
      setTimeout(() => {              
        activateButton(false)
        paymentRentsContentLoad(offset, currentPage, showFrom, showTo, status, sort, paymentMethod, search)  
        sessionStorage.setItem('payment-rents-offset', offset)
        sessionStorage.setItem('payment-rents-current-page', currentPage)
        sessionStorage.setItem('payment-rents-show-from', showFrom)      
        sessionStorage.setItem('payment-rents-show-to', showTo)
        sessionStorage.setItem('payment-rents-status', status)
        sessionStorage.setItem('payment-rents-sort', sort)
        sessionStorage.setItem('payment-rents-payment-method', paymentMethod)
        sessionStorage.setItem('payment-rents-search', search)
      }, TIMEOUT_MS)
    })   
  }

  function paymentBillsPagePagination(){
    $(document).off('click', '#prevPagePaymentBills').on('click', '#prevPagePaymentBills', function() {
      const entriesPerPage = Number(localStorage.getItem('settings-payments-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('payment-bills-current-page') || 1) - 1
      const offset = Number(sessionStorage.getItem('payment-bills-offset')) - entriesPerPage
      const showFrom = Number(sessionStorage.getItem('payment-bills-show-from')) - entriesPerPage
      const showTo = Number(sessionStorage.getItem('payment-bills-show-to')) - entriesPerPage
      const status = sessionStorage.getItem('payment-bills-status') || ''
      const sort = sessionStorage.getItem('payment-bills-sort') || 'Ascending'
      const paymentMethod = sessionStorage.getItem('payment-bills-payment-method') || ''
      const search = sessionStorage.getItem('payment-bills-search') || ''

      function activateButton(status){
        switch(status){
          case true:
            $('#prevPagePaymentBills').prop('disabled', true)
            $('#prevPagePaymentBills .spinner-border').removeClass('visually-hidden')
            break;
          default:
            $('#prevPagePaymentBills').prop('disabled', false)
            $('#prevPagePaymentBills .spinner-border').addClass('visually-hidden')
            break;
        } 
      } activateButton(true)
      setTimeout(() => {          
        activateButton(false)
        paymentBillsContentLoad(offset, currentPage, showFrom, showTo, status, sort, paymentMethod, search)
        sessionStorage.setItem('payment-bills-offset', offset)
        sessionStorage.setItem('payment-bills-current-page', currentPage)
        sessionStorage.setItem('payment-bills-show-from', showFrom)      
        sessionStorage.setItem('payment-bills-show-to', showTo)
        sessionStorage.setItem('payment-bills-status', status)
        sessionStorage.setItem('payment-bills-sort', sort)
        sessionStorage.setItem('payment-bills-payment-method', paymentMethod)
        sessionStorage.setItem('payment-bills-search', search)
      }, TIMEOUT_MS)
    })
    $(document).off('click', '#nextPagePaymentBills').on('click', '#nextPagePaymentBills', () => {
      const entriesPerPage = Number(localStorage.getItem('settings-payments-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('payment-bills-current-page') || 1) + 1
      const offset = Number(sessionStorage.getItem('payment-bills-offset')) + entriesPerPage
      const showFrom = Number(sessionStorage.getItem('payment-bills-show-from')) + entriesPerPage
      const showTo = Number(sessionStorage.getItem('payment-bills-show-to')) + entriesPerPage
      const status = sessionStorage.getItem('payment-bills-status') || ''
      const sort = sessionStorage.getItem('payment-bills-sort') || 'Ascending'
      const paymentMethod = sessionStorage.getItem('payment-bills-payment-method') || ''
      const search = sessionStorage.getItem('payment-bills-search') || ''

      function activateButton(status){
        switch(status){
          case true:
            $('#nextPagePaymentBills').prop('disabled', true)
            $('#nextPagePaymentBills .spinner-border').removeClass('visually-hidden')
            break;
          default:
            $('#nextPagePaymentBills').prop('disabled', false)
            $('#nextPagePaymentBills .spinner-border').addClass('visually-hidden')
            break;
        } 
      } activateButton(true)
      setTimeout(() => {
        activateButton(false)
        paymentBillsContentLoad(offset, currentPage, showFrom, showTo, status, sort, paymentMethod, search)
        sessionStorage.setItem('payment-bills-offset', offset)
        sessionStorage.setItem('payment-bills-current-page', currentPage)
        sessionStorage.setItem('payment-bills-show-from', showFrom)      
        sessionStorage.setItem('payment-bills-show-to', showTo)
        sessionStorage.setItem('payment-bills-status', status)
        sessionStorage.setItem('payment-bills-sort', sort)
        sessionStorage.setItem('payment-bills-payment-method', paymentMethod)
        sessionStorage.setItem('payment-bills-search', search)
      }, TIMEOUT_MS)
    })  
  }

  function paymentRentsContentLoad(offset, currentPage, showFrom, showTo, status, sort, paymentMethod, search){
    pleaseWaitModalIsDisplay(true)
    const limit = Number(localStorage.getItem('settings-payments-entries-per-page')) || 10
    loadPaymentRents(limit, offset, currentPage, showFrom, showTo, status, sort, paymentMethod, search, false)
    paymentRentsPagePagination()
    paymentTabs()
  }

  function paymentBillsContentLoad(offset, currentPage, showFrom, showTo, status, sort, paymentMethod, search){
    pleaseWaitModalIsDisplay(true)
    const limit = Number(localStorage.getItem('settings-payments-entries-per-page')) || 10
    loadPaymentBills(limit, offset, currentPage, showFrom, showTo, status, sort, paymentMethod, search, false)
    paymentBillsPagePagination()
    paymentTabs()
  }

  function paymentTabs() {  
    $(document).off('click', '#viewEditPaymentModalNavLinkRent').on('click', '#viewEditPaymentModalNavLinkRent', function() {
      sessionStorage.setItem('payment-rents-offset', '0')
      sessionStorage.setItem('payment-rents-current-page', `1`)
      sessionStorage.setItem('payment-rents-show-from', `1`)      
      sessionStorage.setItem('payment-rents-show-to', Number(localStorage.getItem('settings-payments-entries-per-page')) || 10)
      sessionStorage.setItem('payment-rents-status', ``)
      sessionStorage.setItem('payment-rents-sort', `Ascending`)
      sessionStorage.setItem('payment-rents-payment-method', ``)
      sessionStorage.setItem('payment-rents-search', ``)
      
      $(this).addClass('active')
      $(this).attr('aria-current', 'page')
      // $(this).prop('disabled', true)

      $('#viewEditPaymentModalNavLinkBill').removeClass('active')
      $('#viewEditPaymentModalNavLinkBill').removeAttr('aria-current')
      $('#viewEditPaymentModalNavLinkBill').prop('disabled', false)

      pleaseWaitModalIsDisplay(false)
      $('#paymentsContentDisplay').load('pages/please_wait.html')
      setTimeout(() => {
        $('#paymentsContentDisplay').load('pages/extensions/payments/rent/contentDisplay.html', function() {       
          const currentPage = Number(sessionStorage.getItem('payment-rents-current-page') || 1)
          const offset = Number(sessionStorage.getItem('payment-rents-offset'))
          const showFrom = Number(sessionStorage.getItem('payment-rents-show-from'))
          const showTo = Number(sessionStorage.getItem('payment-rents-show-to'))
          const status = sessionStorage.getItem('payment-rents-status') || ''
          const sort = sessionStorage.getItem('payment-rents-sort') || 'Ascending'
          const paymentMethod = sessionStorage.getItem('payment-rents-payment-method') || ''
          const search = sessionStorage.getItem('payment-rents-search') || ''
          paymentRentsContentLoad(offset, currentPage, showFrom, showTo, status, sort, paymentMethod, search)             
        })
      }, TIMEOUT_MS)
    })

    $(document).off('click', '#viewEditPaymentModalNavLinkBill').on('click', '#viewEditPaymentModalNavLinkBill', function() {
      sessionStorage.setItem('payment-bills-offset', '0')
      sessionStorage.setItem('payment-bills-current-page', `1`)
      sessionStorage.setItem('payment-bills-show-from', `1`)
      sessionStorage.setItem('payment-bills-show-to', Number(localStorage.getItem('settings-payments-entries-per-page')) || 10)
      sessionStorage.setItem('payment-bills-status', ``)
      sessionStorage.setItem('payment-bills-sort', `Ascending`)
      sessionStorage.setItem('payment-bills-payment-method', ``)
      sessionStorage.setItem('payment-bills-search', ``)

      $(this).addClass('active')
      $(this).attr('aria-current', 'page')
      // $(this).prop('disabled', true)

      $('#viewEditPaymentModalNavLinkRent').removeClass('active')
      $('#viewEditPaymentModalNavLinkRent').removeAttr('aria-current')
      $('#viewEditPaymentModalNavLinkRent').prop('disabled', false)

      pleaseWaitModalIsDisplay(false)
      $('#paymentsContentDisplay').load('pages/please_wait.html')
      setTimeout(() => {
        $('#paymentsContentDisplay').load('pages/extensions/payments/bill/contentDisplay.html', function() {          
          const currentPage = Number(sessionStorage.getItem('payment-bills-current-page') || 1)
          const offset = Number(sessionStorage.getItem('payment-bills-offset')) 
          const showFrom = Number(sessionStorage.getItem('payment-bills-show-from'))
          const showTo = Number(sessionStorage.getItem('payment-bills-show-to'))
          const status = sessionStorage.getItem('payment-bills-status') || ''
          const sort = sessionStorage.getItem('payment-bills-sort') || 'Ascending'
          const paymentMethod = sessionStorage.getItem('payment-bills-payment-method') || ''
          const search = sessionStorage.getItem('payment-bills-search') || ''
          paymentBillsContentLoad(offset, currentPage, showFrom, showTo, status, sort, paymentMethod, search)    
        })
      }, TIMEOUT_MS)
    })
  }

  function mainContentLoad(){ 
    const offset = 0
    const currentPage = 1
    const showFrom = 1
    const showTo = Number(localStorage.getItem('settings-payments-entries-per-page')) || 10
    const status = ''
    const sort = 'Ascending'
    const paymentMethod = ''
    const search = ''

    sessionStorage.setItem('payment-rents-offset', `${offset}`)
    sessionStorage.setItem('payment-rents-current-page', `${currentPage}`)
    sessionStorage.setItem('payment-rents-show-from', `${showFrom}`)
    sessionStorage.setItem('payment-rents-show-to', `${showTo}`)
    sessionStorage.setItem('payment-rents-status', `${status}`)
    sessionStorage.setItem('payment-rents-sort', `${sort}`)
    sessionStorage.setItem('payment-rents-payment-method', `${paymentMethod}`)
    sessionStorage.setItem('payment-rents-search', `${search}`)

    $('#mainContent').load("pages/payments.html", () => {
      $('#paymentsContentDisplay').load("pages/extensions/payments/rent/contentDisplay.html", () => { 
        paymentRentsContentLoad(offset, currentPage, showFrom, showTo, status, sort, paymentMethod, search)
      }) 
    })
  }

  setTimeout(() => {
    const getHash = location.hash
    if(getHash === "#payments"){
      paymentsActiveNavLink()
      mainContentLoad()
    }
  }, TIMEOUT_MS);

  function paymentsMainContent(){
    pleaseWaitModalIsDisplay(false)
    paymentsActiveNavLink()
    $('#mainContent').load('pages/please_wait.html')

    setTimeout(() => {
      mainContentLoad()
    }, TIMEOUT_MS);
  }

  // Nav Link Payments Clicked 
  $('#paymentsNavLink').off('click').on('click', () => {
    autoUpdateOverduePaymentBills()
    autoUpdateOverduePaymentRents()
    paymentsMainContent()
  })

  $(document).off('click', '#paymentsContentRefresh').on('click', '#paymentsContentRefresh', () => {
    paymentsMainContent()
  })

  // view/edit modal
  viewEditPaymentRentModalRentCode()
  viewEditPaymentRentModalBoarderName()
  viewEditPaymentRentModal()

  viewEditPaymentBillModalBillCode()
  viewEditPaymentBillModalRentCode()
  viewEditPaymentBillModalBoarderName()
  viewEditPaymentBillModal()

  // filters
  applyFilterRents()
  applyFilterBills()  
})