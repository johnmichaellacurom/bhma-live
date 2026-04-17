import {loadBoarders} from './loadBoarders.js'

export function applyFilters() {
  function filtersSearchOnBlur(){
    $(document).off('blur', '#filtersBoarderModalSearch').on('blur', '#filtersBoarderModalSearch', function() {
      $('#filtersBoarderModalSearch').val($(this).val().trim())
    })
  } filtersSearchOnBlur()

  $(document).off('submit', '#filtersBoarderModalForm').on('submit', '#filtersBoarderModalForm', function(e) {
    e.preventDefault();

    function activateButton(status){
      switch(status){
        case true:
          $('#filtersBoarderModalApply').prop('disabled', true)
          $('#filtersBoarderModalApply .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#filtersBoarderModalApply').prop('disabled', false)
          $('#filtersBoarderModalApply .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)
    
    setTimeout(() => {
      let status
      if($('#filtersBoarderModalStatusActive')[0].checked){
        status = 'Active'
      } else if($('#filtersBoarderModalStatusInactive')[0].checked){
        status = 'Inactive'
      } else {
        status = ''
      }

      let sort
      if($('#filtersBoarderModalSortAscending')[0].checked){
        sort = 'Ascending'
      } else {
        sort = 'Descending'
      }

      let sex
      if($('#filtersBoarderModalSexMale')[0].checked){
        sex = 'Male'
      } else if($('#filtersBoarderModalSexFemale')[0].checked){
        sex = 'Female'
      } else {
        sex = ''
      }

      let search = $('#filtersBoarderModalSearch').val().trim()

      const limit = Number(localStorage.getItem('settings-boarders-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('boarders-current-page'))
      const offset = Number(sessionStorage.getItem('boarders-offset'))
      const showFrom = Number(sessionStorage.getItem('boarders-show-from'))
      const showTo = Number(sessionStorage.getItem('boarders-show-to'))

      sessionStorage.setItem('boarders-status', `${status}`)
      sessionStorage.setItem('boarders-sort', `${sort}`)
      sessionStorage.setItem('boarders-sex', `${sex}`)
      sessionStorage.setItem('boarders-search', `${search}`)

      $('#filtersBoarderModalButtonClose')[0].click()
      $('#mainContent').load("pages/boarders.html", function(){
        activateButton(false)
        loadBoarders(limit, offset, currentPage, showFrom, showTo, status, sort, sex, search, false)
      })
    }, TIMEOUT_MS)
  })
}