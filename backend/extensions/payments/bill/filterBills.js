import {loadPaymentBills} from './loadPaymentBills.js'

export function applyFilterBills() {
  function filtersSearchOnBlur(){
    $(document).off('blur', '#filtersPaymentBillModalSearch').on('blur', '#filtersPaymentBillModalSearch', function() {
      $('#filtersPaymentBillModalSearch').val($(this).val().trim())
    })
  } filtersSearchOnBlur()

  $(document).off('submit', '#filtersPaymentBillModalForm').on('submit', '#filtersPaymentBillModalForm', function(e) {
    e.preventDefault();
    function activateButton(status){
      switch(status){
        case true:
          $('#filtersPaymentBillModalApply').prop('disabled', true)
          $('#filtersPaymentBillModalApply .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#filtersPaymentBillModalApply').prop('disabled', false)
          $('#filtersPaymentBillModalApply .spinner-border').addClass('visually-hidden')
          break;
      } 
    } activateButton(true)    
    
    setTimeout(() => {
      let status
      if($('#filtersPaymentBillModalStatusUnpaid')[0].checked){
        status = 'Unpaid'
      } else if($('#filtersPaymentBillModalStatusPaid')[0].checked){
        status = 'Paid'
      } else if($('#filtersPaymentBillModalStatusOverdue')[0].checked){
        status = 'Overdue'
      } else if($('#filtersPaymentBillModalStatusPartially')[0].checked){
        status = 'Partially'
      } else if($('#filtersPaymentBillModalStatusUnbilled')[0].checked){
        status = 'Unbilled'
      } else {
        status = ''
      }
  
      let sort
      if($('#filtersPaymentBillModalSortAscending')[0].checked){
        sort = 'Ascending'
      } else {
        sort = 'Descending'
      }

      let paymentMethod
       if($('#filtersPaymentBillModalPaymentMethodCash')[0].checked){
        paymentMethod = 'Cash'
      } else if($('#filtersPaymentBillModalPaymentMethodEWallet')[0].checked){
        paymentMethod = 'E-Wallet'
      } else if($('#filtersPaymentBillModalPaymentMethodOthers')[0].checked){
        paymentMethod = 'Other'
      } else {
        paymentMethod = ''
      }
  
      let search = $('#filtersPaymentBillModalSearch').val().trim()  
      const limit = Number(localStorage.getItem('settings-payments-entries-per-page')) || 10
      const currentPage = Number(sessionStorage.getItem('payment-bills-current-page'))
      const offset = Number(sessionStorage.getItem('payment-bills-offset'))
      const showFrom = Number(sessionStorage.getItem('payment-bills-show-from'))
      const showTo = Number(sessionStorage.getItem('payment-bills-show-to'))
  
      sessionStorage.setItem('payment-bills-status', `${status}`)
      sessionStorage.setItem('payment-bills-sort', `${sort}`)
      sessionStorage.setItem('payment-bills-payment-method', `${paymentMethod}`)
      sessionStorage.setItem('payment-bills-search', `${search}`)

      $('#filtersPaymentBillModalButtonClose')[0].click()
      $('#paymentsContentDisplay').load('pages/extensions/payments/bill/contentDisplay.html', function() { 
        activateButton(false)      
        loadPaymentBills(limit, offset, currentPage, showFrom, showTo, status, sort, paymentMethod, search, false)         
      })
    }, TIMEOUT_MS)
  })
}