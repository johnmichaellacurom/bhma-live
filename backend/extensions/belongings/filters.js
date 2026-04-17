import {loadBelongings} from './loadBelongings.js'

export function applyFilters() {
  function filtersSearchOnBlur(){
    $(document).off('blur', '#filtersBelongingModalSearch').on('blur', '#filtersBelongingModalSearch', function() {
      $('#filtersBelongingModalSearch').val($(this).val().trim())
    })
  } filtersSearchOnBlur()

  $(document).off('submit', '#filtersBelongingModalForm').on('submit', '#filtersBelongingModalForm', function(e) {
    e.preventDefault();

    function activateButton(status){
      switch(status){
        case true:
          $('#filtersBelongingModalApply').prop('disabled', true)
          $('#filtersBelongingModalApply .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#filtersBelongingModalApply').prop('disabled', false)
          $('#filtersBelongingModalApply .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)
    
    setTimeout(() => {
      let status
      if($('#filtersBelongingModalStatusActive')[0].checked){
        status = 'Active'
      } else if($('#filtersBelongingModalStatusInactive')[0].checked){
        status = 'Inactive'
      } else {
        status = ''
      }

      let sort
      if($('#filtersBelongingModalSortAscending')[0].checked){
        sort = 'Ascending'
      } else {
        sort = 'Descending'
      }

      let type
      if($('#filtersBelongingModalBelongingTypeAppliance')[0].checked){
        type = 'Appliance'
      } else if($('#filtersBelongingModalBelongingTypeGadget')[0].checked){
        type = 'Gadget'
      } else {
        type = ''
      }

      let search = $('#filtersBelongingModalSearch').val().trim()

      const limit = Number(localStorage.getItem('settings-belongings-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('belongings-current-page'))
      const offset = Number(sessionStorage.getItem('belongings-offset'))
      const showFrom = Number(sessionStorage.getItem('belongings-show-from'))
      const showTo = Number(sessionStorage.getItem('belongings-show-to'))

      sessionStorage.setItem('belongings-status', `${status}`)
      sessionStorage.setItem('belongings-sort', `${sort}`)
      sessionStorage.setItem('belongings-type', `${type}`)
      sessionStorage.setItem('belongings-search', `${search}`)

      $('#filtersBelongingModalButtonClose')[0].click()
      $('#mainContent').load("pages/belongings.html", function(){
        activateButton(false)
        loadBelongings(limit, offset, currentPage, showFrom, showTo, status, sort, type, search)
      })
    }, TIMEOUT_MS)
  })
}