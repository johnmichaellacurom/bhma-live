import {navbarSupportedContentHidden, pleaseWaitModalIsDisplay} from './index.js'
import {addBillModal} from './extensions/bills/addBill.js'
import {viewEditBillModal, viewEditBillModalViewPayments} from './extensions/bills/editBill.js'
import {loadBills} from './extensions/bills/loadBills.js'
import {applyFilters} from './extensions/bills/filters.js'
import {autoUpdateOverdueBills} from './extensions/bills/overdue.js'

$(document).ready(function(){

  function billsActiveNavLink(){
    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#billsNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#billsNavLink').addClass('active')

    navbarSupportedContentHidden()
  }

  function mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, billType, search){
      sessionStorage.setItem('bills-offset', `${offset}`)
      sessionStorage.setItem('bills-current-page', `${currentPage}`)
      sessionStorage.setItem('bills-show-from', `${showFrom}`)
      sessionStorage.setItem('bills-show-to', `${showTo}`)
  
      sessionStorage.setItem('bills-status', `${status}`)
      sessionStorage.setItem('bills-sort', `${sort}`)
      sessionStorage.setItem('bills-bill-type', `${billType}`)
      sessionStorage.setItem('bills-search', `${search}`)
  
      $('#mainContent').load("pages/bills.html", function(){
        pleaseWaitModalIsDisplay(true)
        const limit = Number(localStorage.getItem('settings-bills-entries-per-page')) || 10
        loadBills(limit, offset, currentPage, showFrom, showTo, status, sort, billType, search, false)
      })
  }
  
  setTimeout(() => {
    const getHash = location.hash
    if(getHash === "#bills"){
      const showTo = Number(localStorage.getItem('settings-bills-entries-per-page')) || 10

      billsActiveNavLink()
      mainContentLoad(0, 1, 1, showTo, '', 'Ascending', '', '')
    }
  }, TIMEOUT_MS);

  function billsMainContent() {
    pleaseWaitModalIsDisplay(false)
    billsActiveNavLink()
    $('#mainContent').load('pages/please_wait.html')

    setTimeout(() => {
      const showTo = Number(localStorage.getItem('settings-bills-entries-per-page')) || 10
      mainContentLoad(0, 1, 1, showTo, '', 'Ascending', '', '')
    }, TIMEOUT_MS);
  }

  // Nav Link bills Clicked 
  $('#billsNavLink').off('click').on('click', () => {
    autoUpdateOverdueBills()
    billsMainContent()
  })

  $(document).off('click', '#billsContentRefresh').on('click', '#billsContentRefresh', () => {
    billsMainContent()
  })

  $(document).off('click', '#prevPageBills').on('click', '#prevPageBills', function() {

    function activateButton(status){
      switch(status){
        case true:
          $('#prevPageBills').prop('disabled', true)
          $('#prevPageBills .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#prevPageBills').prop('disabled', false)
          $('#prevPageBills .spinner-border').addClass('visually-hidden')
          break;
      } 
    } activateButton(true)

    setTimeout(() => {
      const entriesPerPage = Number(localStorage.getItem('settings-bills-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('bills-current-page') || 1) - 1
      const offset = Number(sessionStorage.getItem('bills-offset')) - entriesPerPage
      const showFrom = Number(sessionStorage.getItem('bills-show-from')) - entriesPerPage
      const showTo = Number(sessionStorage.getItem('bills-show-to')) - entriesPerPage
      const status = sessionStorage.getItem('bills-status') || ''
      const sort = sessionStorage.getItem('bills-sort') || 'Ascending'
      const billType = sessionStorage.getItem('bills-bill-type') || ''
      const search = sessionStorage.getItem('bills-search') || ''
   
      activateButton(false)
      mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, billType, search)
    }, TIMEOUT_MS)

  })

  $(document).off('click', '#nextPageBills').on('click', '#nextPageBills', () => {
    function activateButton(status){
      switch(status){
        case true:
          $('#nextPageBills').prop('disabled', true)
          $('#nextPageBills .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#nextPageBills').prop('disabled', false)
          $('#nextPageBills .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)

    setTimeout(() => {
      const entriesPerPage = Number(localStorage.getItem('settings-bills-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('bills-current-page') || 1) + 1
      const offset = Number(sessionStorage.getItem('bills-offset')) + entriesPerPage
      const showFrom = Number(sessionStorage.getItem('bills-show-from')) + entriesPerPage
      const showTo = Number(sessionStorage.getItem('bills-show-to')) + entriesPerPage
      const status = sessionStorage.getItem('bills-status') || ''
      const sort = sessionStorage.getItem('bills-sort') || 'Ascending'
      const billType = sessionStorage.getItem('bills-bill-type') || ''
      const search = sessionStorage.getItem('bills-search') || ''

      activateButton(false)
      mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, billType, search)
    }, TIMEOUT_MS)
  })

  // add modal
  addBillModal()

  // view/edit modal
  viewEditBillModal()
  viewEditBillModalViewPayments()

  // filters
  applyFilters()

})