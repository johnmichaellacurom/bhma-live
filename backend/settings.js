import {navbarSupportedContentHidden, pleaseWaitModalIsDisplay, toast, openURL} from './index.js'
import {formatMoney, formatMoneyReverse, formattedActivationCode} from '../indexdb/database.js'

function settingsActiveNavLink(){
  $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
  $('#settingsNavItem').addClass('bg-primary-subtle')

  $('#navbarSupportedContent .nav-link').removeClass('active')
  $('#settingsNavLink').addClass('active')

  navbarSupportedContentHidden()
}

let realTimeUpdateExpires
function settingsActivation(){
  setTimeout(() => { 
    clearInterval(realTimeUpdateExpires)
    $('#settingsActivation').load("pages/extensions/settings/activation.html", () => {

      $('#settingActivationCheck').off('click').on('click', function() {        
        if($(this)[0].checked){
          $('#settingsActivationPlans').removeClass('d-none')
          openURL()
        } else{
          $('#settingsActivationPlans').addClass('d-none')
        }
      })

      // 2025-11-06T20:45_15
      const ACTIVATION_CODE = localStorage.getItem('activation_code')
      const [ACTIVATED_DATE, DURATION_DAYS] = ACTIVATION_CODE.split('_')

      const expireDate = new Date(ACTIVATED_DATE);
      expireDate.setDate(expireDate.getDate() + (parseInt(DURATION_DAYS) === NaN ? DURATION_DEFAULT : parseInt(DURATION_DAYS)));

      // Get local date
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateNow = `${year}-${month}-${day}`;

      if(dateNow === ACTIVATED_DATE.split("T")[0]) {
        $('#settingsActivationForm').remove()
      }
      
      let durationDays
      if(parseInt(DURATION_DAYS) === NaN){
        durationDays = DURATION_DEFAULT
      } else {
        durationDays = Number(DURATION_DAYS)
      }

      if(localStorage.getItem('app_id') !== null && localStorage.getItem('app_id') !== ""){
        $('#settingsActivationAppID').html(`<span class='text-primary'>App ID: </span>${localStorage.getItem('app_id')}`);
      }

      if(localStorage.getItem('activation_code') !== null && localStorage.getItem('activation_code') !== ""){
        $('.plan-duration').removeClass('border-primary')
        if(DURATION_DAYS == 15){ // 15 days
          $('#planDurationTrial').addClass('border-danger')
          $('#settingsActivationStatus').addClass('bg-danger').removeClass('bg-warning bg-info bg-primary bg-success').text('Trial')
        } else if(DURATION_DAYS == 30) { // 1 month
          $('#planDurationBasic').addClass('border-warning')
          $('#settingsActivationStatus').addClass('bg-warning').removeClass('bg-danger bg-info bg-primary bg-success').text('Basic')
        } else if(DURATION_DAYS == 150) { // 5 months
          $('#planDurationStandard').addClass('border-info')
          $('#settingsActivationStatus').addClass('bg-info').removeClass('bg-warning bg-danger bg-primary bg-success').text('Standard')
        } else if(DURATION_DAYS == 360) { // 1 year
          $('#planDurationPremium').addClass('border-primary')
          $('#settingsActivationStatus').addClass('bg-primary').removeClass('bg-warning bg-info bg-danger bg-success').text('Premium')
        } else { // Lifetime
          $('#planDurationLifetime').addClass('border-success')
          $('#settingsActivationStatus').addClass('bg-success').removeClass('bg-warning bg-info bg-primary bg-danger').text('Lifetime')
        }

        // if lifetime no need to show expires
        if(durationDays > 360) {
          $('#settingsActivationExpires').remove()
          return // 360 is equal 1 year or premium
        }

        realTimeUpdateExpires =  setInterval(() => {
          const now = new Date().getTime();
          const distance = expireDate - now;

          if (distance <= 0) {
            $('#settingsActivationExpires').html(`<span class='text-danger'>Expired</span>`);
            return;
          }

          const d = Math.floor(distance / (1000 * 60 * 60 * 24));
          const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((distance % (1000 * 60)) / 1000);
          $('#settingsActivationExpires').html(`<span class='text-danger'>Expires:</span> ${d}d-${h}h-${m}m-${s}s left`);
        }, INTERVAL_MS)
      }
    })
  }, TIMEOUT_MS)
}

function settingsTheme() {
  setTimeout(() => {
    $('#settingsTheme').load("pages/extensions/settings/theme.html", () => {
      if(localStorage.getItem('theme') === 'dark'){
        $('#settingsThemeDark').prop('checked', true)
        $('#settingsThemeLight').prop('checked', false)
      } else{
        $('#settingsThemeLight').prop('checked', true)
        $('#settingsThemeDark').prop('checked', false)
      }

      // text size
      if(localStorage.getItem('text-size') === '10'){ // 10px Extra Small
        $('#settingsThemeTextSizeExtraSmall').prop('checked', true)
        $('#settingsThemeTextSizeSmall').prop('checked', false)
        $('#settingsThemeTextSizeMedium').prop('checked', false)
        $('#settingsThemeTextSizeNormal').prop('checked', false)
        $('#settingsThemeTextSizeLarge').prop('checked', false)
        $('#settingsThemeTextSizeExtraLarge').prop('checked', false)
      } else if(localStorage.getItem('text-size') === '12'){ // 12px Small
        $('#settingsThemeTextSizeExtraSmall').prop('checked', false)
        $('#settingsThemeTextSizeSmall').prop('checked', true)
        $('#settingsThemeTextSizeMedium').prop('checked', false)
        $('#settingsThemeTextSizeNormal').prop('checked', false)
        $('#settingsThemeTextSizeLarge').prop('checked', false)
        $('#settingsThemeTextSizeExtraLarge').prop('checked', false)
      } else if(localStorage.getItem('text-size') === '14') { // 14px Medium
        $('#settingsThemeTextSizeExtraSmall').prop('checked', false)
        $('#settingsThemeTextSizeSmall').prop('checked', false)
        $('#settingsThemeTextSizeMedium').prop('checked', true)
        $('#settingsThemeTextSizeNormal').prop('checked', false)
        $('#settingsThemeTextSizeLarge').prop('checked', false)
        $('#settingsThemeTextSizeExtraLarge').prop('checked', false)
      } else if(localStorage.getItem('text-size') === '18') { // 18px Large
        $('#settingsThemeTextSizeExtraSmall').prop('checked', false)
        $('#settingsThemeTextSizeSmall').prop('checked', false)
        $('#settingsThemeTextSizeMedium').prop('checked', false)
        $('#settingsThemeTextSizeNormal').prop('checked', false)
        $('#settingsThemeTextSizeLarge').prop('checked', true)
        $('#settingsThemeTextSizeExtraLarge').prop('checked', false)
      } else if(localStorage.getItem('text-size') === '20') { // 20px Extra large
        $('#settingsThemeTextSizeExtraSmall').prop('checked', false)
        $('#settingsThemeTextSizeSmall').prop('checked', false)
        $('#settingsThemeTextSizeMedium').prop('checked', false)
        $('#settingsThemeTextSizeNormal').prop('checked', false)
        $('#settingsThemeTextSizeLarge').prop('checked', false)
        $('#settingsThemeTextSizeExtraLarge').prop('checked', true)
      } else { // 16px - normal
        $('#settingsThemeTextSizeExtraSmall').prop('checked', false)
        $('#settingsThemeTextSizeSmall').prop('checked', false)
        $('#settingsThemeTextSizeMedium').prop('checked', false)
        $('#settingsThemeTextSizeNormal').prop('checked', true)
        $('#settingsThemeTextSizeLarge').prop('checked', false)
        $('#settingsThemeTextSizeExtraLarge').prop('checked', false)
      }
    })
  }, TIMEOUT_MS)    
}

function settingsDashboard(){
  setTimeout(() => {
    $('#settingsDashboard').load("pages/extensions/settings/dashboard.html", () => {

      // show revenue
      if(localStorage.getItem('settings-dashboard-show-revenue') === 'off'){
        $('#settingsDashboardShowRevenueOff').prop('checked', true)
        $('#settingsDashboardShowRevenueOn').prop('checked', false)
      } else{
        $('#settingsDashboardShowRevenueOn').prop('checked', true)
        $('#settingsDashboardShowRevenueOff').prop('checked', false)
      }

      // show rents
      if(localStorage.getItem('settings-dashboard-show-rents') === 'off'){
        $('#settingsDashboardShowRentsOff').prop('checked', true)
        $('#settingsDashboardShowRentsOn').prop('checked', false)
      } else{
        $('#settingsDashboardShowRentsOn').prop('checked', true)
        $('#settingsDashboardShowRentsOff').prop('checked', false)
      }

      // show bills
      if(localStorage.getItem('settings-dashboard-show-bills') === 'off'){
        $('#settingsDashboardShowBillsOff').prop('checked', true)
        $('#settingsDashboardShowBillsOn').prop('checked', false)
      } else{
        $('#settingsDashboardShowBillsOn').prop('checked', true)
        $('#settingsDashboardShowBillsOff').prop('checked', false)
      }

      // show payments
      if(localStorage.getItem('settings-dashboard-show-payments') === 'off'){
        $('#settingsDashboardShowPaymentsOff').prop('checked', true)
        $('#settingsDashboardShowPaymentsOn').prop('checked', false)
      } else{
        $('#settingsDashboardShowPaymentsOn').prop('checked', true)
        $('#settingsDashboardShowPaymentsOff').prop('checked', false)
      }

      // show belongings
      if(localStorage.getItem('settings-dashboard-show-belongings') === 'off'){
        $('#settingsDashboardShowBelongingsOff').prop('checked', true)
        $('#settingsDashboardShowBelongingsOn').prop('checked', false)
      } else{
        $('#settingsDashboardShowBelongingsOn').prop('checked', true)
        $('#settingsDashboardShowBelongingsOff').prop('checked', false)
      }

      // show boarders
      if(localStorage.getItem('settings-dashboard-show-boarders') === 'off'){
        $('#settingsDashboardShowBoardersOff').prop('checked', true)
        $('#settingsDashboardShowBoardersOn').prop('checked', false)
      } else{
        $('#settingsDashboardShowBoardersOn').prop('checked', true)
        $('#settingsDashboardShowBoardersOff').prop('checked', false)
      }

      // show rooms
      if(localStorage.getItem('settings-dashboard-show-rooms') === 'off'){
        $('#settingsDashboardShowRoomsOff').prop('checked', true)
        $('#settingsDashboardShowRoomsOn').prop('checked', false)
      } else{
        $('#settingsDashboardShowRoomsOn').prop('checked', true)
        $('#settingsDashboardShowRoomsOff').prop('checked', false)
      }
    })
  }, TIMEOUT_MS)
}

function settingsReminders(){
  setTimeout(() => {
    $('#settingsReminders').load("pages/extensions/settings/reminders.html", () => {

      // display
      const settingsRemindersDisplay = localStorage.getItem('settings-reminders-display')
      $('#settingsRemindersDisplay').val(settingsRemindersDisplay === null ? 10 : settingsRemindersDisplay)

      // payment due
      const settingsRemindersPaymentDue = localStorage.getItem('settings-reminders-payment-due')
      $('#settingsRemindersPaymentDue').val(settingsRemindersPaymentDue === null ? 'off' : settingsRemindersPaymentDue)

      // payment due
      const settingsRemindersBirthday = localStorage.getItem('settings-reminders-birthday')
      $('#settingsRemindersBirthday').val(settingsRemindersBirthday === null ? 'off' : settingsRemindersBirthday)
    })
  }, TIMEOUT_MS)  
}

function settingsRents(){
  setTimeout(() => {
    $('#settingsRents').load("pages/extensions/settings/rents.html", () => {

      // entries per page
      const settingsRentsEntriesPerPage = localStorage.getItem('settings-rents-entries-per-page')
      $('#settingsRentsEntriesPerPage').val(settingsRentsEntriesPerPage === null ? 10 : settingsRentsEntriesPerPage)
    })
  }, TIMEOUT_MS) 
}

function settingsBills(){
  setTimeout(() => {
    $('#settingsBills').load("pages/extensions/settings/bills.html", () => {

      // entries per page
      const settingsBillsEntriesPerPage = localStorage.getItem('settings-bills-entries-per-page')
      $('#settingsBillsEntriesPerPage').val(settingsBillsEntriesPerPage === null ? 10 : settingsBillsEntriesPerPage)

      // late fee per day electric
      const settingsBillsLateFeePerDayElectric = localStorage.getItem('settings-bills-late-fee-per-day-electric')
      $('#settingsBillsLateFeePerDayElectric').val(settingsBillsLateFeePerDayElectric === null ? 0 : settingsBillsLateFeePerDayElectric)

      // late fee per day water
      const settingsBillsLateFeePerDayWater = localStorage.getItem('settings-bills-late-fee-per-day-water')
      $('#settingsBillsLateFeePerDayWater').val(settingsBillsLateFeePerDayWater === null ? 0 : settingsBillsLateFeePerDayWater)
    })
  }, TIMEOUT_MS) 
}

function settingsPayments(){
  setTimeout(() => {
    $('#settingsPayments').load("pages/extensions/settings/payments.html", () => {

      // entries per page
      const settingsPaymentsEntriesPerPage = localStorage.getItem('settings-payments-entries-per-page')
      $('#settingsPaymentsEntriesPerPage').val(settingsPaymentsEntriesPerPage === null ? 10 : settingsPaymentsEntriesPerPage)
    })
  }, TIMEOUT_MS) 
}

function settingsBelongings(){
  setTimeout(() => {
    $('#settingsBelongings').load("pages/extensions/settings/belongings.html", () => {

      // entries per page
      const settingsBelongingsEntriesPerPage = localStorage.getItem('settings-belongings-entries-per-page')
      $('#settingsBelongingsEntriesPerPage').val(settingsBelongingsEntriesPerPage === null ? 10 : settingsBelongingsEntriesPerPage)
    })
  }, TIMEOUT_MS) 
}

function settingsBoardersBillingAmountPerCycleLabelPercentsTransient(roomPercent, electricPercent, waterPercent){
  $('#settingsBoardersBillingAmountPerCycleRoomLabelPercentTransient').text(roomPercent)
  $('#settingsBoardersBillingAmountPerCycleElectricLabelPercentTransient').text(electricPercent)
  $('#settingsBoardersBillingAmountPerCycleWaterLabelPercentTransient').text(waterPercent)
}

function settingsBoarders(){
  setTimeout(() => {
    $('#settingsBoarders').load("pages/extensions/settings/boarders.html", () => {

      // entries per page
      const settingsBoardersEntriesPerPage = localStorage.getItem('settings-boarders-entries-per-page')
      $('#settingsBoardersEntriesPerPage').val(settingsBoardersEntriesPerPage === null ? 10 : settingsBoardersEntriesPerPage)

      // billing cycle regular
      const settingsBoardersBillingCycleRegular = localStorage.getItem('settings-boarders-billing-cycle-regular')
      $('#settingsBoardersBillingCycleRegular').val(settingsBoardersBillingCycleRegular === null ? 30 : settingsBoardersBillingCycleRegular)

      // billing amount per cycle regular
      const settingsBoardersBillingAmountPerCycleRegular = localStorage.getItem('settings-boarders-billing-amount-per-cycle-regular')
      $('#settingsBoardersBillingAmountPerCycleRegular').val(settingsBoardersBillingAmountPerCycleRegular === null ? 700.00 : settingsBoardersBillingAmountPerCycleRegular)

      // late fee per day regular
      const settingsBoardersLateFeePerDayRegular = localStorage.getItem('settings-boarders-late-fee-per-day-regular')
      $('#settingsBoardersLateFeePerDayRegular').val(settingsBoardersLateFeePerDayRegular === null ? 0.00 : settingsBoardersLateFeePerDayRegular)

      // billing cycle transient
      const settingsBoardersBillingCycleTransient = localStorage.getItem('settings-boarders-billing-cycle-transient')
      $('#settingsBoardersBillingCycleTransient').val(settingsBoardersBillingCycleTransient === null ? 1 : settingsBoardersBillingCycleTransient)

      // billing amount per cycle transient
      const settingsBoardersBillingAmountPerCycleTransient = localStorage.getItem('settings-boarders-billing-amount-per-cycle-transient')
      $('#settingsBoardersBillingAmountPerCycleTransient').val(settingsBoardersBillingAmountPerCycleTransient === null ? 50.00 : settingsBoardersBillingAmountPerCycleTransient)

      // electric percent transient
      const settingsBoardersBillingAmountPerCycleElectricPercentTransient = localStorage.getItem('settings-boarders-billing-amount-per-cycle-electric-percent-transient')
      const electricPercent = settingsBoardersBillingAmountPerCycleElectricPercentTransient === null ? 20 : settingsBoardersBillingAmountPerCycleElectricPercentTransient
      $('#settingsBoardersBillingAmountPerCycleElectricPercentTransient').val(electricPercent)

      // water percent transient
      const settingsBoardersBillingAmountPerCycleWaterPercentTransient = localStorage.getItem('settings-boarders-billing-amount-per-cycle-water-percent-transient')
      const waterPercent = settingsBoardersBillingAmountPerCycleWaterPercentTransient === null ? 0 : settingsBoardersBillingAmountPerCycleWaterPercentTransient
      $('#settingsBoardersBillingAmountPerCycleWaterPercentTransient').val(waterPercent)

      const roomPercent = 100 - (Number(electricPercent) + Number(waterPercent))
      settingsBoardersBillingAmountPerCycleLabelPercentsTransient(roomPercent, electricPercent, waterPercent)

      // late fee per day transient
      const settingsBoardersLateFeePerDayTransient = localStorage.getItem('settings-boarders-late-fee-per-day-transient')
      $('#settingsBoardersLateFeePerDayTransient').val(settingsBoardersLateFeePerDayTransient === null ? 0.00 : settingsBoardersLateFeePerDayTransient)
    })
  }, TIMEOUT_MS) 
}

function settingsRooms(){
  setTimeout(() => {
    $('#settingsRooms').load("pages/extensions/settings/rooms.html", () => {

      // entries per page
      const settingsRoomsEntriesPerPage = localStorage.getItem('settings-rooms-entries-per-page')
      $('#settingsRoomsEntriesPerPage').val(settingsRoomsEntriesPerPage === null ? 10 : settingsRoomsEntriesPerPage)
    })
  }, TIMEOUT_MS) 
}

function settingsBoardingHouseOwner(){
  setTimeout(() => {
    $('#settingsBoardingHouseOwner').load("pages/extensions/settings/boardingHouseOwner.html", () => {

      // boarding house owner full name
      const settingsBoardingHouseOwnerFullName = localStorage.getItem('settings-boarding-house-owner-full-name')
      $('#settingsBoardingHouseOwnerFullName').val(settingsBoardingHouseOwnerFullName === null ? 'JOHN DOE' : settingsBoardingHouseOwnerFullName)
    })
  }, TIMEOUT_MS) 
}

function settingsPage() {
  $('#mainContent').load("pages/settings.html")
    pleaseWaitModalIsDisplay(true)
    settingsActivation()
    settingsTheme()
    settingsDashboard()
    settingsReminders()
    settingsRents()
    settingsBills()
    settingsPayments()
    settingsBelongings()
    settingsBoarders()
    settingsRooms()
    settingsBoardingHouseOwner()
}

function settingsMainContent() {
  settingsActiveNavLink()
  $('#mainContent').load('pages/please_wait.html')
  pleaseWaitModalIsDisplay(false)

  setTimeout(() => {
    settingsPage()
  }, TIMEOUT_MS);
}

$(document).ready(function(){
  pleaseWaitModalIsDisplay(false)
  setTimeout(() => {
    const getHash = location.hash
    if(getHash === "#settings"){
      settingsActiveNavLink()
      $('#mainContent').load("pages/settings.html", () => {
        settingsPage()
      })      
    }

  }, TIMEOUT_MS);

  // Nav Link settings Clicked 
  $('#settingsNavLink').off('click').on('click', () => {
    settingsMainContent()
  })

  $(document).off('click', '#settingsContentRefresh').on('click', '#settingsContentRefresh', () => {
    settingsMainContent()
  })

  // Theme Light and Dark Mode
  $(document).off('click', '.settings-theme').on('click', '.settings-theme', function() {
    const theme = $(this).val().toLowerCase()
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-bs-theme', theme)
  })

  // theme text size
  $(document).off('click', '.settings-theme-text-size').on('click', '.settings-theme-text-size', function(){
    const textSize = $(this).val()
    localStorage.setItem('text-size', textSize)
    document.documentElement.style.fontSize = `${textSize}px`
  })

  // show revenue
  $(document).off('click', '.settings-dashboard-show-revenue').on('click', '.settings-dashboard-show-revenue', function() {
    localStorage.setItem('settings-dashboard-show-revenue', $(this).val().toLowerCase())
  })

  // show rents
  $(document).off('click', '.settings-dashboard-show-rents').on('click', '.settings-dashboard-show-rents', function() {
    localStorage.setItem('settings-dashboard-show-rents', $(this).val().toLowerCase())
  })

  // show bills
  $(document).off('click', '.settings-dashboard-show-bills').on('click', '.settings-dashboard-show-bills', function() {
    localStorage.setItem('settings-dashboard-show-bills', $(this).val().toLowerCase())
  })

  // show payments
  $(document).off('click', '.settings-dashboard-show-payments').on('click', '.settings-dashboard-show-payments', function() {
    localStorage.setItem('settings-dashboard-show-payments', $(this).val().toLowerCase())
  })

  // show belongings
  $(document).off('click', '.settings-dashboard-show-belongings').on('click', '.settings-dashboard-show-belongings', function() {
    localStorage.setItem('settings-dashboard-show-belongings', $(this).val().toLowerCase())
  })

  // show boarders
  $(document).off('click', '.settings-dashboard-show-boarders').on('click', '.settings-dashboard-show-boarders', function() {
    localStorage.setItem('settings-dashboard-show-boarders', $(this).val().toLowerCase())
  })

  // show rooms
  $(document).off('click', '.settings-dashboard-show-rooms').on('click', '.settings-dashboard-show-rooms', function() {
    localStorage.setItem('settings-dashboard-show-rooms', $(this).val().toLowerCase())
  })

  // settings reminders display
  $(document).off('change', '#settingsRemindersDisplay').on('change', '#settingsRemindersDisplay', function() {
    localStorage.setItem('settings-reminders-display', $(this).val())
  })

  // settings reminders payment due
  $(document).off('change', '#settingsRemindersPaymentDue').on('change', '#settingsRemindersPaymentDue', function() {
    localStorage.setItem('settings-reminders-payment-due', $(this).val().toLowerCase())
  })

  // settings reminders birthday
  $(document).off('change', '#settingsRemindersBirthday').on('change', '#settingsRemindersBirthday', function() {
    localStorage.setItem('settings-reminders-birthday', $(this).val().toLowerCase())
  })

  // settings rents entries per page
  $(document).off('change', '#settingsRentsEntriesPerPage').on('change', '#settingsRentsEntriesPerPage', function() {
    localStorage.setItem('settings-rents-entries-per-page', $(this).val())
  })

  // settings bills entries per page
  $(document).off('change', '#settingsBillsEntriesPerPage').on('change', '#settingsBillsEntriesPerPage', function() {
    localStorage.setItem('settings-bills-entries-per-page', $(this).val())
  })

  // settings bills late fee per day electric
  $(document).off('change', '#settingsBillsLateFeePerDayElectric').on('change', '#settingsBillsLateFeePerDayElectric', function() {
    localStorage.setItem('settings-bills-late-fee-per-day-electric', $(this).val())
  })

  // settings bills late fee per day water
  $(document).off('change', '#settingsBillsLateFeePerDayWater').on('change', '#settingsBillsLateFeePerDayWater', function() {
    localStorage.setItem('settings-bills-late-fee-per-day-water', $(this).val())
  })

  // settings payments entries per page
  $(document).off('change', '#settingsPaymentsEntriesPerPage').on('change', '#settingsPaymentsEntriesPerPage', function() {
    localStorage.setItem('settings-payments-entries-per-page', $(this).val())
  })

  // settings belongings entries per page
  $(document).off('change', '#settingsBelongingsEntriesPerPage').on('change', '#settingsBelongingsEntriesPerPage', function() {
    localStorage.setItem('settings-belongings-entries-per-page', $(this).val())
  })

  // settings boarders entries per page
  $(document).off('change', '#settingsBoardersEntriesPerPage').on('change', '#settingsBoardersEntriesPerPage', function() {
    localStorage.setItem('settings-boarders-entries-per-page', $(this).val())
  })

  // settings boarders billing cycle regular
  $(document).off('change', '#settingsBoardersBillingCycleRegular').on('change', '#settingsBoardersBillingCycleRegular', function() {
    localStorage.setItem('settings-boarders-billing-cycle-regular', $(this).val())
  })

  // settings boarders billing amount per cycle regular
  $(document).off('focus', '#settingsBoardersBillingAmountPerCycleRegular').on('focus', '#settingsBoardersBillingAmountPerCycleRegular', function() {
    $(this).attr('type', 'number')
    $(this).val(formatMoneyReverse(localStorage.getItem('settings-boarders-billing-amount-per-cycle-regular')))
  })
  $(document).off('blur', '#settingsBoardersBillingAmountPerCycleRegular').on('blur', '#settingsBoardersBillingAmountPerCycleRegular', function() {
    $(this).attr('type', 'text')
    $(this).val(formatMoney($(this).val()))
    localStorage.setItem('settings-boarders-billing-amount-per-cycle-regular', $(this).val())
  })

  // settings boarders late fee per day regular
  $(document).off('change', '#settingsBoardersLateFeePerDayRegular').on('change', '#settingsBoardersLateFeePerDayRegular', function() {
    localStorage.setItem('settings-boarders-late-fee-per-day-regular', $(this).val())
  })

  // settings boarders billing cycle transient
  $(document).off('change', '#settingsBoardersBillingCycleTransient').on('change', '#settingsBoardersBillingCycleTransient', function() {
    localStorage.setItem('settings-boarders-billing-cycle-transient', $(this).val())
  })

  // settings boarders billing amount per cycle transient
  $(document).off('focus', '#settingsBoardersBillingAmountPerCycleTransient').on('focus', '#settingsBoardersBillingAmountPerCycleTransient', function() {
    $(this).attr('type', 'number')
    $(this).val(formatMoneyReverse(localStorage.getItem('settings-boarders-billing-amount-per-cycle-transient')))
  })
  $(document).off('blur', '#settingsBoardersBillingAmountPerCycleTransient').on('blur', '#settingsBoardersBillingAmountPerCycleTransient', function() {
    $(this).attr('type', 'text')
    $(this).val(formatMoney($(this).val()))
    localStorage.setItem('settings-boarders-billing-amount-per-cycle-transient', $(this).val())
  })

  // settings boarders billing amount per cycle electric percent transient
  $(document).off('change', '#settingsBoardersBillingAmountPerCycleElectricPercentTransient').on('change', '#settingsBoardersBillingAmountPerCycleElectricPercentTransient', function() {
    localStorage.setItem('settings-boarders-billing-amount-per-cycle-electric-percent-transient', $(this).val())

    const electricPercent = Number($(this).val())
    const waterPercent = Number($('#settingsBoardersBillingAmountPerCycleWaterLabelPercentTransient').text())
    const roomPercent = 100 - (electricPercent + waterPercent)

    settingsBoardersBillingAmountPerCycleLabelPercentsTransient(roomPercent, electricPercent, waterPercent)
  })

  // settings boarders billing amount per cycle water percent transient
  $(document).off('change', '#settingsBoardersBillingAmountPerCycleWaterPercentTransient').on('change', '#settingsBoardersBillingAmountPerCycleWaterPercentTransient', function() {
    localStorage.setItem('settings-boarders-billing-amount-per-cycle-water-percent-transient', $(this).val())

    const waterPercent = Number($(this).val())
    const electricPercent = Number($('#settingsBoardersBillingAmountPerCycleElectricLabelPercentTransient').text())
    const roomPercent = 100 - (electricPercent + waterPercent)

    settingsBoardersBillingAmountPerCycleLabelPercentsTransient(roomPercent, electricPercent, waterPercent)
  })

  // settings boarders late fee per day transient
  $(document).off('change', '#settingsBoardersLateFeePerDayTransient').on('change', '#settingsBoardersLateFeePerDayTransient', function() {
    localStorage.setItem('settings-boarders-late-fee-per-day-transient', $(this).val())
  })

  // settings rooms entries per page
  $(document).off('change', '#settingsRoomsEntriesPerPage').on('change', '#settingsRoomsEntriesPerPage', function() {
    localStorage.setItem('settings-rooms-entries-per-page', $(this).val())
  })

  // settings boarding house owner full name
  function ownerFullName(){
    $(document).off('blur', '#settingsBoardingHouseOwnerFullName').on('blur', '#settingsBoardingHouseOwnerFullName', function() {
      $('#settingsBoardingHouseOwnerFullName').val($(this).val().trim())
    })
  } ownerFullName()
  $(document).off('input', '#settingsBoardingHouseOwnerFullName').on('input', '#settingsBoardingHouseOwnerFullName', function() {
    localStorage.setItem('settings-boarding-house-owner-full-name', $(this).val().trim())
  })

  // submit activation code
  $(document).off('submit', '#settingsActivationForm').on('submit', '#settingsActivationForm', function(e) {
    e.preventDefault();

    function activateButton(status){
      switch(status){
        case true:
          $('#settingsActivationActivateButton').prop('disabled', true)
          $('#settingsActivationActivateButton .spinner-border').removeClass('visually-hidden')
          break;
        default:
          $('#settingsActivationActivateButton').prop('disabled', false)
          $('#settingsActivationActivateButton .spinner-border').addClass('visually-hidden')
          break;
      } 
    }

    try {
      activateButton(true)

      setTimeout(() => {      
        const secretKey = localStorage.getItem('app_id') || 'NoAppId';
        const activationCode = $('#settingsActivationCode').val().trim()
        if (!activationCode) {
          $('#mainContent').html('')
          toast('danger', 'Please try again.')
          activateButton(false)
          return 
        }

        const activated = formattedActivationCode(activationCode, secretKey)
        if(!activated) {
          toast('danger', 'Activation code is invalid!')
          activateButton(false)
          return 
        }
        
        toast('success', 'Activation code is valid.')
        activateButton(false)
        $('#settingsActivationForm').remove()
        settingsMainContent()

        $('#expiredModalButtonClose')[0].click()
      }, TIMEOUT_MS)
    } catch (err) {
      toast('danger', 'System error!')
      activateButton(false)
    }
  })
})