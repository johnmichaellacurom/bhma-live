import {loadPaymentRents} from './loadPaymentRents.js'

export function applyFilterRents() {
  function filtersSearchOnBlur(){
    $(document).off('blur', '#filtersPaymentRentModalSearch').on('blur', '#filtersPaymentRentModalSearch', function() {
      $('#filtersPaymentRentModalSearch').val($(this).val().trim())
    })
  } filtersSearchOnBlur()

  $(document).off('submit', '#filtersPaymentRentModalForm').on('submit', '#filtersPaymentRentModalForm', function(e) {
    e.preventDefault();
    function activateButton(status){
      switch(status){
        case true:
          $('#filtersPaymentRentModalApply').prop('disabled', true)
          $('#filtersPaymentRentModalApply .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#filtersPaymentRentModalApply').prop('disabled', false)
          $('#filtersPaymentRentModalApply .spinner-border').addClass('visually-hidden')
          break;
      } 
    } activateButton(true)    
    
    setTimeout(() => {
      let status
      if($('#filtersPaymentRentModalStatusUnpaid')[0].checked){
        status = 'Unpaid'
      } else if($('#filtersPaymentRentModalStatusPaid')[0].checked){
        status = 'Paid'
      } else if($('#filtersPaymentRentModalStatusOverdue')[0].checked){
        status = 'Overdue'
      } else if($('#filtersPaymentRentModalStatusPartially')[0].checked){
        status = 'Partially'
      } else if($('#filtersPaymentRentModalStatusUnbilled')[0].checked){
        status = 'Unbilled'
      } else {
        status = ''
      }
  
      let sort
      if($('#filtersPaymentRentModalSortAscending')[0].checked){
        sort = 'Ascending'
      } else {
        sort = 'Descending'
      }

      let paymentMethod
       if($('#filtersPaymentRentModalPaymentMethodCash')[0].checked){
        paymentMethod = 'Cash'
      } else if($('#filtersPaymentRentModalPaymentMethodEWallet')[0].checked){
        paymentMethod = 'E-Wallet'
      } else if($('#filtersPaymentRentModalPaymentMethodOthers')[0].checked){
        paymentMethod = 'Other'
      } else {
        paymentMethod = ''
      }
  
      let search = $('#filtersPaymentRentModalSearch').val().trim()  
      const limit = Number(localStorage.getItem('settings-payments-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('payment-rents-current-page'))
      const offset = Number(sessionStorage.getItem('payment-rents-offset'))
      const showFrom = Number(sessionStorage.getItem('payment-rents-show-from'))
      const showTo = Number(sessionStorage.getItem('payment-rents-show-to'))
  
      sessionStorage.setItem('payment-rents-status', `${status}`)
      sessionStorage.setItem('payment-rents-sort', `${sort}`)
      sessionStorage.setItem('payment-rents-payment-method', `${paymentMethod}`)
      sessionStorage.setItem('payment-rents-search', `${search}`)

      $('#filtersPaymentRentModalButtonClose')[0].click()
      $('#paymentsContentDisplay').load('pages/extensions/payments/rent/contentDisplay.html', function() { 
        activateButton(false)      
        loadPaymentRents(limit, offset, currentPage, showFrom, showTo, status, sort, paymentMethod, search, false)         
      })
    }, TIMEOUT_MS)
  })
}