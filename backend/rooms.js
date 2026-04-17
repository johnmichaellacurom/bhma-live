import {navbarSupportedContentHidden, pleaseWaitModalIsDisplay} from './index.js'
import {viewEditRoomModal, viewEditRoomModalViewRents, viewEditRoomModalViewBills} from './extensions/rooms/editRoom.js'
import {roomNameOnBlur, totalLowerBedsCount, totalUpperBedsCount, notesOnBlur, submitForm} from './extensions/rooms/addRoom.js'
import {loadRooms} from './extensions/rooms/loadRooms.js'
import {applyFilters} from './extensions/rooms/filters.js'

$(document).ready(function(){
  function roomsActiveNavLink(){
    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#roomsNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#roomsNavLink').addClass('active')

    navbarSupportedContentHidden()
  }

  function mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, search){
    sessionStorage.setItem('rooms-offset', `${offset}`)
    sessionStorage.setItem('rooms-current-page', `${currentPage}`)
    sessionStorage.setItem('rooms-show-from', `${showFrom}`)
    sessionStorage.setItem('rooms-show-to', `${showTo}`)
    sessionStorage.setItem('rooms-status', `${status}`)
    sessionStorage.setItem('rooms-sort', `${sort}`)
    sessionStorage.setItem('rooms-search', `${search}`)

    $('#mainContent').load("pages/rooms.html", function(){
      pleaseWaitModalIsDisplay(true)
      const limit = Number(localStorage.getItem('settings-rooms-entries-per-page')) || 10
      loadRooms(limit, offset, currentPage, showFrom, showTo, status, sort, search)
    })
  }
  
  setTimeout(() => {
    const getHash = location.hash
    if(getHash === "#rooms"){
      const showTo = Number(localStorage.getItem('settings-rooms-entries-per-page')) || 10

      roomsActiveNavLink()
      mainContentLoad(0, 1, 1, showTo, '', 'Ascending', '')
    }
  }, TIMEOUT_MS);

  function roomsMainContent() {
    pleaseWaitModalIsDisplay()
    roomsActiveNavLink()
    $('#mainContent').load('pages/please_wait.html')
  
    setTimeout(() => {
      const showTo = Number(localStorage.getItem('settings-rooms-entries-per-page')) || 10
      mainContentLoad(0, 1, 1, showTo, '', 'Ascending', '')
    }, TIMEOUT_MS);
  }

  // Nav Link Rooms Clicked 
  $('#roomsNavLink').off('click').on('click', () => {
    roomsMainContent()
  })

  $(document).off('click', '#roomsContentRefresh').on('click', '#roomsContentRefresh', () => {
    roomsMainContent()
  })

  $(document).off('click', '#prevPageRooms').on('click', '#prevPageRooms', function() {

    function activateButton(status){
      switch(status){
        case true:
          $('#prevPageRooms').prop('disabled', true)
          $('#prevPageRooms .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#prevPageRooms').prop('disabled', false)
          $('#prevPageRooms .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)

    setTimeout(() => {
      const entriesPerPage = Number(localStorage.getItem('settings-rooms-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('rooms-current-page') || 1) - 1
      const offset = Number(sessionStorage.getItem('rooms-offset')) - entriesPerPage
      const showFrom = Number(sessionStorage.getItem('rooms-show-from')) - entriesPerPage
      const showTo = Number(sessionStorage.getItem('rooms-show-to')) - entriesPerPage
      const status = sessionStorage.getItem('rooms-status') || ''
      const sort = sessionStorage.getItem('rooms-sort') || 'Ascending'
      const search = sessionStorage.getItem('rooms-search') || ''
   
      activateButton(false)
      mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, search)
    }, TIMEOUT_MS)

  })

  $(document).off('click', '#nextPageRooms').on('click', '#nextPageRooms', () => {
    function activateButton(status){
      switch(status){
        case true:
          $('#nextPageRooms').prop('disabled', true)
          $('#nextPageRooms .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#nextPageRooms').prop('disabled', false)
          $('#nextPageRooms .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)

    setTimeout(() => {
      const entriesPerPage = Number(localStorage.getItem('settings-rooms-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('rooms-current-page') || 1) + 1
      const offset = Number(sessionStorage.getItem('rooms-offset')) + entriesPerPage
      const showFrom = Number(sessionStorage.getItem('rooms-show-from')) + entriesPerPage
      const showTo = Number(sessionStorage.getItem('rooms-show-to')) + entriesPerPage
      const status = sessionStorage.getItem('rooms-status') || ''
      const sort = sessionStorage.getItem('rooms-sort') || 'Ascending'
      const search = sessionStorage.getItem('rooms-search') || ''

      activateButton(false)
      mainContentLoad(offset, currentPage, showFrom, showTo, status, sort, search)
    }, TIMEOUT_MS)
  })

  // Add room
  roomNameOnBlur()
  totalLowerBedsCount()
  totalUpperBedsCount()
  notesOnBlur()
  submitForm()
  
  // view/edit room
  viewEditRoomModal()
  viewEditRoomModalViewRents()
  viewEditRoomModalViewBills()  

  // filters
  applyFilters()
})