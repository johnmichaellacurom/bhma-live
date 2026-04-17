import {navbarSupportedContentHidden, pleaseWaitModalIsDisplay} from './index.js'
import {addRentModal} from './extensions/rents/addRent.js'
import {viewEditRentModal, viewEditRentModalViewPayments, viewEditRentModalBoarderName} from './extensions/rents/editRent.js'
import {loadRents} from './extensions/rents/loadRents.js'
import {applyFilters} from './extensions/rents/filters.js'

$(document).ready(function(){
  function rentsActiveNavLink(){
    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#rentsNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#rentsNavLink').addClass('active')

    navbarSupportedContentHidden()
  }

  function mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, bedLevel, rentType, search){
    sessionStorage.setItem('rents-offset', `${offset}`)
    sessionStorage.setItem('rents-current-page', `${currentPage}`)
    sessionStorage.setItem('rents-show-from', `${showFrom}`)
    sessionStorage.setItem('rents-show-to', `${showTo}`)

    sessionStorage.setItem('rents-status', `${status}`)
    sessionStorage.setItem('rents-sort', `${sort}`)
    sessionStorage.setItem('rents-bed-level', `${bedLevel}`)
    sessionStorage.setItem('rents-rent-type', `${rentType}`)
    sessionStorage.setItem('rents-search', `${search}`)

    $('#mainContent').load("pages/rents.html", function(){
      pleaseWaitModalIsDisplay(true)
      const limit = Number(localStorage.getItem('settings-rents-entries-per-page')) || 10
      loadRents(limit, offset, currentPage, showFrom, showTo, status, sort, bedLevel, rentType, search, false, false)
    })
  }
  
  setTimeout(() => {
    const getHash = location.hash
    if(getHash === "#rents"){
      const showTo = Number(localStorage.getItem('settings-rents-entries-per-page')) || 10

      rentsActiveNavLink()
      mainContentLoad(0, 1, 1, showTo, '', 'Ascending', '', '', '')
    }
  }, TIMEOUT_MS);

  function rentsMainContent() {
    pleaseWaitModalIsDisplay(false)
    rentsActiveNavLink()
    $('#mainContent').load('pages/please_wait.html')

    setTimeout(() => {
      const showTo = Number(localStorage.getItem('settings-rents-entries-per-page')) || 10
      mainContentLoad(0, 1, 1, showTo, '', 'Ascending', '', '', '')
    }, TIMEOUT_MS);
  }

  // Nav Link Rent Clicked 
  $('#rentsNavLink').off('click').on('click', () => {
    rentsMainContent()
  })

  $(document).off('click', '#rentsContentRefresh').on('click', '#rentsContentRefresh', () => {
    rentsMainContent()
  })

  $(document).off('click', '#prevPageRents').on('click', '#prevPageRents', function() {

    function activateButton(status){
      switch(status){
        case true:
          $('#prevPageRents').prop('disabled', true)
          $('#prevPageRents .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#prevPageRents').prop('disabled', false)
          $('#prevPageRents .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)

    setTimeout(() => {
      const entriesPerPage = Number(localStorage.getItem('settings-rents-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('rents-current-page') || 1) - 1
      const offset = Number(sessionStorage.getItem('rents-offset')) - entriesPerPage
      const showFrom = Number(sessionStorage.getItem('rents-show-from')) - entriesPerPage
      const showTo = Number(sessionStorage.getItem('rents-show-to')) - entriesPerPage
      const status = sessionStorage.getItem('rents-status') || ''
      const sort = sessionStorage.getItem('rents-sort') || 'Ascending'
      const bedLevel = sessionStorage.getItem('rents-bed-level') || ''
      const rentType = sessionStorage.getItem('rents-rent-type') || ''
      const search = sessionStorage.getItem('rents-search') || ''
   
      activateButton(false)
      mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, bedLevel, rentType, search)
    }, TIMEOUT_MS)

  })

  $(document).off('click', '#nextPageRents').on('click', '#nextPageRents', () => {
    function activateButton(status){
      switch(status){
        case true:
          $('#nextPageRents').prop('disabled', true)
          $('#nextPageRents .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#nextPageRents').prop('disabled', false)
          $('#nextPageRents .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)

    setTimeout(() => {
      const entriesPerPage = Number(localStorage.getItem('settings-rents-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('rents-current-page') || 1) + 1
      const offset = Number(sessionStorage.getItem('rents-offset')) + entriesPerPage
      const showFrom = Number(sessionStorage.getItem('rents-show-from')) + entriesPerPage
      const showTo = Number(sessionStorage.getItem('rents-show-to')) + entriesPerPage
      const status = sessionStorage.getItem('rents-status') || ''
      const sort = sessionStorage.getItem('rents-sort') || 'Ascending'
      const bedLevel = sessionStorage.getItem('rents-bed-level') || ''
      const rentType = sessionStorage.getItem('rents-rent-type') || ''
      const search = sessionStorage.getItem('rents-search') || ''

      activateButton(false)
      mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, bedLevel, rentType, search)
    }, TIMEOUT_MS)
  })

  // add modal
  addRentModal()

  // view/edit modal
  viewEditRentModal()
  viewEditRentModalViewPayments()
  viewEditRentModalBoarderName()

  // filters
  applyFilters()

})