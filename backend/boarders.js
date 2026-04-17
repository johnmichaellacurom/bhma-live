import {navbarSupportedContentHidden, pleaseWaitModalIsDisplay} from './index.js'
import {firstNameOnBlur, middleNameOnBlur, lastNameOnBlur, suffixOnBlur, nickNameOnBlur, addressOnBlur, mobileNoOnBlur, facebookAccOnBlur, notesOnBlur, submitForm} from './extensions/boarders/addBoarder.js'
import {viewEditBoarderModalViewRents, viewEditBoarderModalViewPayments, viewEditBoarderModal} from './extensions/boarders/editBoarder.js'
import {loadBoarders} from './extensions/boarders/loadBoarders.js'
import {applyFilters} from './extensions/boarders/filters.js'

$(document).ready(function(){

  function boardersActiveNavLink(){
    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#boardersNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#boardersNavLink').addClass('active')

    navbarSupportedContentHidden()
  }

  function mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, sex, search){
    sessionStorage.setItem('boarders-offset', `${offset}`)
    sessionStorage.setItem('boarders-current-page', `${currentPage}`)
    sessionStorage.setItem('boarders-show-from', `${showFrom}`)
    sessionStorage.setItem('boarders-show-to', `${showTo}`)
    sessionStorage.setItem('boarders-status', `${status}`)
    sessionStorage.setItem('boarders-sort', `${sort}`)
    sessionStorage.setItem('boarders-sex', `${sex}`)
    sessionStorage.setItem('boarders-search', `${search}`)

    $('#mainContent').load("pages/boarders.html", function(){
      pleaseWaitModalIsDisplay(true)
      const limit = Number(localStorage.getItem('settings-boarders-entries-per-page')) || 10
      loadBoarders(limit, offset, currentPage, showFrom, showTo, status, sort, sex, search, false)
    })
  }
  
  setTimeout(() => {
    const getHash = location.hash
    if(getHash === "#boarders"){
      const showTo = Number(localStorage.getItem('settings-boarders-entries-per-page')) || 10

      boardersActiveNavLink()
      mainContentLoad(0, 1, 1, showTo, '', 'Ascending', '', '')
    }
  }, TIMEOUT_MS);

  function boardersMainContent() {
    pleaseWaitModalIsDisplay(false)
    boardersActiveNavLink()
    $('#mainContent').load('pages/please_wait.html')
  
    setTimeout(() => {
      const showTo = Number(localStorage.getItem('settings-boarders-entries-per-page')) || 10
      mainContentLoad(0, 1, 1, showTo, '', 'Ascending', '', '')
    }, TIMEOUT_MS);
  }

  // Nav Link Boarders Clicked 
  $('#boardersNavLink').off('click').on('click', () => {
    boardersMainContent()
  })

  $(document).off('click', '#boardersContentRefresh').on('click', '#boardersContentRefresh', () => {
    boardersMainContent()
  })

  $(document).off('click', '#prevPageBoarders').on('click', '#prevPageBoarders', () => {
    function activateButton(status){
      switch(status){
        case true:
          $('#prevPageBoarders').prop('disabled', true)
          $('#prevPageBoarders .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#prevPageBoarders').prop('disabled', false)
          $('#prevPageBoarders .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)

    setTimeout(() => {
      const entriesPerPage = Number(localStorage.getItem('settings-boarders-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('boarders-current-page') || 1) - 1
      const offset = Number(sessionStorage.getItem('boarders-offset')) - entriesPerPage
      const showFrom = Number(sessionStorage.getItem('boarders-show-from')) - entriesPerPage
      const showTo = Number(sessionStorage.getItem('boarders-show-to')) - entriesPerPage
      const status = sessionStorage.getItem('boarders-status') || ''
      const sort = sessionStorage.getItem('boarders-sort') || 'Ascending'
      const sex = sessionStorage.getItem('boarders-sex') || ''
      const search = sessionStorage.getItem('boarders-search') || ''
  
      activateButton(false)
      mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, sex, search)
    }, TIMEOUT_MS)
  })

  $(document).off('click', '#nextPageBoarders').on('click', '#nextPageBoarders', () => {
    function activateButton(status){
      switch(status){
        case true:
          $('#nextPageBoarders').prop('disabled', true)
          $('#nextPageBoarders .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#nextPageBoarders').prop('disabled', false)
          $('#nextPageBoarders .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)

    setTimeout(() => {
      const entriesPerPage = Number(localStorage.getItem('settings-boarders-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('boarders-current-page') || 1) + 1
      const offset = Number(sessionStorage.getItem('boarders-offset')) + entriesPerPage
      const showFrom = Number(sessionStorage.getItem('boarders-show-from')) + entriesPerPage
      const showTo = Number(sessionStorage.getItem('boarders-show-to')) + entriesPerPage
      const status = sessionStorage.getItem('boarders-status') || ''
      const sort = sessionStorage.getItem('boarders-sort') || 'Ascending'
      const sex = sessionStorage.getItem('boarders-sex') || ''
      const search = sessionStorage.getItem('boarders-search') || ''

      activateButton(false)
      mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, sex, search)
    }, TIMEOUT_MS)
  })

  // add boarder
  firstNameOnBlur()
  middleNameOnBlur()
  lastNameOnBlur()
  suffixOnBlur()
  nickNameOnBlur()
  addressOnBlur()
  mobileNoOnBlur()
  facebookAccOnBlur()
  notesOnBlur()
  submitForm()

  // view/edit boarder
  viewEditBoarderModalViewRents()
  viewEditBoarderModalViewPayments()
  viewEditBoarderModal()

  // filters
  applyFilters()
})