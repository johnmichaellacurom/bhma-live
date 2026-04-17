import {loadBills} from './loadBills.js'

export function applyFilters() {
  function filtersSearchOnBlur(){
    $(document).off('blur', '#filtersBillModalSearch').on('blur', '#filtersBillModalSearch', function() {
      $('#filtersBillModalSearch').val($(this).val().trim())
    })
  } filtersSearchOnBlur()

  $(document).off('submit', '#filtersBillModalForm').on('submit', '#filtersBillModalForm', function(e) {
    e.preventDefault();
    
    function activateButton(status){
      switch(status){
        case true:
          $('#filtersBillModalApply').prop('disabled', true)
          $('#filtersBillModalApply .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#filtersBillModalApply').prop('disabled', false)
          $('#filtersBillModalApply .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    activateButton(true)    
    
    setTimeout(() => {
      let status
      if($('#filtersBillModalStatusUnpaid')[0].checked){
        status = 'Unpaid'
      } else if($('#filtersBillModalStatusPaid')[0].checked){
        status = 'Paid'
      } else if($('#filtersBillModalStatusOverdue')[0].checked){
        status = 'Overdue'
      } else if($('#filtersBillModalStatusPartially')[0].checked){
        status = 'Partially'
      } else if($('#filtersBillModalStatusUnbilled')[0].checked){
        status = 'Unbilled'
      } else {
        status = ''
      }
  
      let sort
      if($('#filtersBillModalSortAscending')[0].checked){
        sort = 'Ascending'
      } else {
        sort = 'Descending'
      }

      let billType
      if($('#filtersBillModalBillTypeElectric')[0].checked){
        billType = 'Electric'
      } else if ($('#filtersBillModalBillTypeWater')[0].checked) {
        billType = 'Water'
      } else {
        billType = ''
      }
  
      let search = $('#filtersBillModalSearch').val().trim()
  
      const limit = Number(localStorage.getItem('settings-bills-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('bills-current-page'))
      const offset = Number(sessionStorage.getItem('bills-offset'))
      const showFrom = Number(sessionStorage.getItem('bills-show-from'))
      const showTo = Number(sessionStorage.getItem('bills-show-to'))
  
      sessionStorage.setItem('bills-status', `${status}`)
      sessionStorage.setItem('bills-sort', `${sort}`)
      sessionStorage.setItem('bills-bill-type', `${billType}`)
      sessionStorage.setItem('bills-search', `${search}`)

      $('#filtersBillModalButtonClose')[0].click()
      $('#mainContent').load("pages/bills.html", function(){
        activateButton(false)
        loadBills(limit, offset, currentPage, showFrom, showTo, status, sort, billType, search, false)
      })
    }, TIMEOUT_MS)
  })
}