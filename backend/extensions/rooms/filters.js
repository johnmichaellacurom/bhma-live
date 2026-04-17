import {loadRooms} from './loadRooms.js'

export function applyFilters() {
  function filtersSearchOnBlur(){
    $(document).off('blur', '#filtersRoomModalSearch').on('blur', '#filtersRoomModalSearch', function() {
      $('#filtersRoomModalSearch').val($(this).val().trim())
    })
  } filtersSearchOnBlur()

  $(document).off('submit', '#filtersRoomModalForm').on('submit', '#filtersRoomModalForm', function(e) {
    e.preventDefault();

    function activateButton(status){
      switch(status){
        case true:
          $('#filtersRoomModalApply').prop('disabled', true)
          $('#filtersRoomModalApply .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#filtersRoomModalApply').prop('disabled', false)
          $('#filtersRoomModalApply .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)    
    
    setTimeout(() => {
      let status
      if($('#filtersRoomModalStatusActive')[0].checked){
        status = 'Active'
      } else if($('#filtersRoomModalStatusInactive')[0].checked){
        status = 'Inactive'
      } else {
        status = ''
      }
  
      let sort
      if($('#filtersRoomModalSortAscending')[0].checked){
        sort = 'Ascending'
      } else {
        sort = 'Descending'
      }
  
      let search = $('#filtersRoomModalSearch').val().trim()
  
      const limit = Number(localStorage.getItem('settings-rooms-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('rooms-current-page'))
      const offset = Number(sessionStorage.getItem('rooms-offset'))
      const showFrom = Number(sessionStorage.getItem('rooms-show-from'))
      const showTo = Number(sessionStorage.getItem('rooms-show-to'))
  
      sessionStorage.setItem('rooms-status', `${status}`)
      sessionStorage.setItem('rooms-sort', `${sort}`)
      sessionStorage.setItem('rooms-search', `${search}`)

      $('#filtersRoomModalButtonClose')[0].click()
      $('#mainContent').load("pages/rooms.html", function(){
        activateButton(false)
        loadRooms(limit, offset, currentPage, showFrom, showTo, status, sort, search)
      })
    }, TIMEOUT_MS)
  })
}