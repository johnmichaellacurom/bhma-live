import {navbarSupportedContentHidden, pleaseWaitModalIsDisplay} from './index.js'
import {belongingNameOnBlur, notesOnBlur, submitForm} from './extensions/belongings/addBelonging.js'
import {viewEditBelonginModalViewRents, viewEditBelonginModal} from './extensions/belongings/editBelonging.js'
import {loadBelongings} from './extensions/belongings/loadBelongings.js'
import {applyFilters} from './extensions/belongings/filters.js'

$(document).ready(function(){

  function belongingsActiveNavLink(){
    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#belongingsNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#belongingsNavLink').addClass('active')

    navbarSupportedContentHidden()
  }

  function mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, type, search){
    sessionStorage.setItem('belongings-offset', `${offset}`)
    sessionStorage.setItem('belongings-current-page', `${currentPage}`)
    sessionStorage.setItem('belongings-show-from', `${showFrom}`)
    sessionStorage.setItem('belongings-show-to', `${showTo}`)
    sessionStorage.setItem('belongings-status', `${status}`)
    sessionStorage.setItem('belongings-sort', `${sort}`)
    sessionStorage.setItem('belongings-type', `${type}`)
    sessionStorage.setItem('belongings-search', `${search}`)

    $('#mainContent').load("pages/belongings.html", function(){
      pleaseWaitModalIsDisplay(true)
      const limit = Number(localStorage.getItem('settings-belongings-entries-per-page')) || 10
      loadBelongings(limit, offset, currentPage, showFrom, showTo, status, sort, type, search)
    })
  }
  
  setTimeout(() => {
    const getHash = location.hash
    if(getHash === "#belongings"){
      const showTo = Number(localStorage.getItem('settings-belongings-entries-per-page')) || 10
      
      belongingsActiveNavLink()
      mainContentLoad(0, 1, 1, showTo, '', 'Ascending', '', '')
    }
  }, TIMEOUT_MS);

  function belongingsMainContent() {
    pleaseWaitModalIsDisplay(false)
    belongingsActiveNavLink()
    $('#mainContent').load('pages/please_wait.html')
  
    setTimeout(() => {
      const showTo = Number(localStorage.getItem('settings-belongings-entries-per-page')) || 10
      mainContentLoad(0, 1, 1, showTo, '', 'Ascending', '', '')
    }, TIMEOUT_MS);
  }

  // Nav Link Rent Clicked 
  $('#belongingsNavLink').off('click').on('click', () => {
    belongingsMainContent()
  })

  $(document).off('click', '#belongingsContentRefresh').on('click', '#belongingsContentRefresh', () => {
    belongingsMainContent()
  })

  $(document).off('click', '#prevPageBelongings').on('click', '#prevPageBelongings', () => {
    function activateButton(status){
      switch(status){
        case true:
          $('#prevPageBelongings').prop('disabled', true)
          $('#prevPageBelongings .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#prevPageBelongings').prop('disabled', false)
          $('#prevPageBelongings .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)

    setTimeout(() => {
      const entriesPerPage = Number(localStorage.getItem('settings-belongings-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('belongings-current-page') || 1) - 1
      const offset = Number(sessionStorage.getItem('belongings-offset')) - entriesPerPage
      const showFrom = Number(sessionStorage.getItem('belongings-show-from')) - entriesPerPage
      const showTo = Number(sessionStorage.getItem('belongings-show-to')) - entriesPerPage
      const status = sessionStorage.getItem('belongings-status') || ''
      const sort = sessionStorage.getItem('belongings-sort') || 'Ascending'
      const type = sessionStorage.getItem('belongings-type') || ''
      const search = sessionStorage.getItem('belongings-search') || ''
  
      activateButton(false)
      mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, type, search)
    }, TIMEOUT_MS)
  })

  $(document).off('click', '#nextPageBelongings').on('click', '#nextPageBelongings', () => {
    function activateButton(status){
      switch(status){
        case true:
          $('#nextPageBelongings').prop('disabled', true)
          $('#nextPageBelongings .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#nextPageBelongings').prop('disabled', false)
          $('#nextPageBelongings .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)

    setTimeout(() => {
      const entriesPerPage = Number(localStorage.getItem('settings-belongings-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('belongings-current-page') || 1) + 1
      const offset = Number(sessionStorage.getItem('belongings-offset')) + entriesPerPage
      const showFrom = Number(sessionStorage.getItem('belongings-show-from')) + entriesPerPage
      const showTo = Number(sessionStorage.getItem('belongings-show-to')) + entriesPerPage
      const status = sessionStorage.getItem('belongings-status') || ''
      const sort = sessionStorage.getItem('belongings-sort') || 'Ascending'
      const type = sessionStorage.getItem('belongings-type') || ''
      const search = sessionStorage.getItem('belongings-search') || ''

      activateButton(false)
      mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, type, search)
    }, TIMEOUT_MS)
  })

  // add belonging
  belongingNameOnBlur()
  notesOnBlur()
  submitForm()

  // view/edit belonging
  viewEditBelonginModalViewRents()
  viewEditBelonginModal()

  // apply filters
  applyFilters()
})