import {loadRents} from './loadRents.js'

export function applyFilters() {
  function filtersSearchOnBlur(){
    $(document).off('blur', '#filtersRentModalSearch').on('blur', '#filtersRentModalSearch', function() {
      $('#filtersRentModalSearch').val($(this).val().trim())
    })
  } filtersSearchOnBlur()

  $(document).off('submit', '#filtersRentModalForm').on('submit', '#filtersRentModalForm', function(e) {
    e.preventDefault();

    function activateButton(status){
      switch(status){
        case true:
          $('#filtersRentModalApply').prop('disabled', true)
          $('#filtersRentModalApply .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#filtersRentModalApply').prop('disabled', false)
          $('#filtersRentModalApply .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)    
    
    setTimeout(() => {
      let status
      if($('#filtersRentModalStatusOngoing')[0].checked){
        status = 'Ongoing'
      } else if($('#filtersRentModalStatusOnBreak')[0].checked){
        status = 'On Break'
      } else if($('#filtersRentModalStatusUnpaid')[0].checked){
        status = 'Unpaid'
      } else if($('#filtersRentModalStatusCompleted')[0].checked){
        status = 'Completed'
      } else {
        status = ''
      }
  
      let sort
      if($('#filtersRentModalSortAscending')[0].checked){
        sort = 'Ascending'
      } else {
        sort = 'Descending'
      }

      let bedLevel
      if($('#filtersRentModalBedLevelLower')[0].checked){
        bedLevel = 'Lower'
      } else if($('#filtersRentModalBedLevelUpper')[0].checked) {
        bedLevel = 'Upper'
      } else{
        bedLevel = ''
      }

      let rentType
      if($('#filtersRentModalRentTypeRegular')[0].checked){
        rentType = 'Regular'
      } else if ($('#filtersRentModalRentTypeTransient')[0].checked) {
        rentType = 'Transient'
      } else {
        rentType = ''
      }
  
      let search = $('#filtersRentModalSearch').val().trim()
  
      const limit = Number(localStorage.getItem('settings-rents-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('rents-current-page'))
      const offset = Number(sessionStorage.getItem('rents-offset'))
      const showFrom = Number(sessionStorage.getItem('rents-show-from'))
      const showTo = Number(sessionStorage.getItem('rents-show-to'))
  
      sessionStorage.setItem('rents-status', `${status}`)
      sessionStorage.setItem('rents-sort', `${sort}`)
      sessionStorage.setItem('rents-bed-level', `${bedLevel}`)
      sessionStorage.setItem('rents-rent-type', `${rentType}`)
      sessionStorage.setItem('rents-search', `${search}`)

      $('#filtersRentModalButtonClose')[0].click()
      $('#mainContent').load("pages/rents.html", function(){
        activateButton(false)
        loadRents(limit, offset, currentPage, showFrom, showTo, status, sort, bedLevel, rentType, search, false, false)
      })
    }, TIMEOUT_MS)
  })
}