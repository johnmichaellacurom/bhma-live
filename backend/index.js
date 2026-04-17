// export const TIMEOUT_MS = 1000 // when used this make sure the it set the script to type=module
window.INTERVAL_MS = 1000
window.DURATION_DEFAULT = 15;
window.TIMEOUT_MS = 2000;

import {dashboardRooms} from './extensions/dashboard/rooms.js'
import {dashboardBoarders} from './extensions/dashboard/boarders.js'
import {dashboardBelongings} from './extensions/dashboard/belongings.js'
import {dashboardRevenue} from './extensions/dashboard/revenue.js'
import {dashboardRents} from './extensions/dashboard/rents.js'
import {dashboardBills} from './extensions/dashboard/bills.js'
import {dashboardPayments} from './extensions/dashboard/payments.js'
import {dashboardContentDisplay} from './dashboard.js'
import {formattedActivationCode} from '../indexdb/database.js'
import {autoUpdateOverdueBills} from './extensions/bills/overdue.js'
import {autoUpdateOverduePaymentBills} from './extensions/payments/bill/overdue.js'
import {autoUpdateOverduePaymentRents} from './extensions/payments/rent/overdue.js'
import {dashboardRemindersReadCount} from './dashboard.js'

// set default action
if(!localStorage.getItem('activation_code')) {
  formattedActivationCode(null, null)  
}

export function openURL(){
  $('.open-url').each(function() {
    const openURL = $(this)
    openURL.off('click').on('click', function() {
      openURL.prop('disabled', true)
      openURL.text('Developer Contact Information...')
      setTimeout(function(){
        window.open("https://johnmichaellacurom.github.io/bhma-plan/?v=" + Date.now(), '_parent')
        openURL.prop('disabled', false)
        openURL.text('Developer Contact Information')
      }, 2000)
    })
  })
}

export function setActivationCodeIfNotSetYet() {
  // checking if the activation code is not set yet
  // then set a new activation code
  if(localStorage.getItem('activation_code') === null || localStorage.getItem('activation_code').trim() === ""){
    const now = new Date();  // current local date/time
    const durationDays = DURATION_DEFAULT;  // your duration in days

    // Get local datetime (PH time)
    // const year = now.getFullYear();
    const year = '1700';
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    localStorage.setItem('activation_code', `${year}-${month}-${day}T${hours}:${minutes}_${durationDays}`)
  }
}

export function setAppIdIfNotSetYet(){
  if(localStorage.getItem('app_id') === null || localStorage.getItem('app_id').trim() === ""){
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    localStorage.setItem('app_id', code.toUpperCase())
  }
}

function displayModalIfExpired(){
  setTimeout(() => { 
    $('#expiredModalBody').load("pages/extensions/settings/activation.html", () => {
      $('#settingActivationCheck').off('click').on('click', function() {
        if($(this)[0].checked){
          $('#settingsActivationPlans').removeClass('d-none')
          openURL()
        } else{
          $('#settingsActivationPlans').addClass('d-none')
        }
      })

      if(localStorage.getItem('activation_code') === null || localStorage.getItem('activation_code').trim() === ""){
        $('#mainContent').html('')
        $('#expiredModalButtonOpen')[0].click()
        $('#expiredModalLabel').text('Select your plan')
        $('#settingsActivationExpires').addClass('d-none')
        $('#settingsActivationStatus').addClass('d-none')

        if(localStorage.getItem('app_id') !== null && localStorage.getItem('app_id') !== ""){
          $('#settingsActivationAppID').html(`<span class='text-primary'>App ID: </span>${localStorage.getItem('app_id')}`);
        }
      } else{
        // 2025-11-06T20:45_15
        const ACTIVATION_CODE = localStorage.getItem('activation_code')
        const [ACTIVATED_DATE, DURATION_DAYS] = ACTIVATION_CODE.split('_')

        let durationDays
        if(parseInt(DURATION_DAYS) === NaN){
          durationDays = DURATION_DEFAULT
        } else {
          durationDays = Number(DURATION_DAYS)
        }

        // if lifetime no need to show modal expired
        if(durationDays > 360)  return // 360 is equal 1 year or premium

        const expireDate = new Date(ACTIVATED_DATE);
        expireDate.setDate(expireDate.getDate() + durationDays)
        const now = new Date().getTime();
        const distance = expireDate - now;

        if (distance <= 0) {
          $('#mainContent').html('')
          $('#expiredModalButtonOpen')[0].click()
          $('#settingsActivationExpires').html(`<span class='text-danger'>Expired</span>`);
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
        }
      }
    })
  }, TIMEOUT_MS)
}

export function navbarSupportedContentHidden(){
  $('#navbarSupportedContent').removeClass('show')
  displayModalIfExpired()
}

export function dashboardDateTime() {
  setInterval(() => {
    const date = new Date();

    const formatted = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    $('#dashboardDate').text(formatted);
  }, INTERVAL_MS);
}

export function toast(status, message){
  let classBody = ''
  let classBodyRemove = ''
  let classDetails = ''
  let classDetailsRemove = ''
  if(status === 'success') {
    classBody = 'bg-success-subtle'
    classBodyRemove = 'bg-warning-subtle bg-danger-subtle'
    classDetails = 'text-success-emphasis'
    classDetailsRemove = 'text-warning-emphasis text-danger-emphasis'
  } else if (status === 'warning') {
    classBody = 'bg-warning-subtle'
    classBodyRemove = 'bg-success-subtle bg-danger-subtle'
    classDetails = 'text-warning-emphasis'
    classDetailsRemove = 'text-success-emphasis text-danger-emphasis'
  } else {
    classBody = 'bg-danger-subtle'
    classBodyRemove = 'bg-success-subtle bg-warning-subtle'
    classDetails = 'text-danger-emphasis'
    classDetailsRemove = 'text-success-emphasis text-warning-emphasis'
  }

  $('#toastBody').addClass(classBody).removeClass(classBodyRemove)
  $('#toastBodyDetails').addClass(classDetails).removeClass(classDetailsRemove).text(message)
  $('#liveToastBtn')[0].click()
}

function aboutThisApp(){
  $('#footer').html(`
    <aside>
      <div class="d-flex align-items-center justify-content-center gap-2 w-100 mt-3">
        <div class="w-100 border"></div>
        <p class="mb-0" style="white-space:nowrap">About this App</p>
        <div class="w-100 border"></div>
      </div>

      <p class="mb-0 fst italic opacity-75">This application is designed to help boarding  house owners efficiently manage their properties and daily operation. It provides a simple yet powerful system for organizing rooms, tracking boarders, monitoring payments, and maintaining accurate records.</p>
      <p class="mb-0 fst-italic opacity-75">BH Mobile App &copy; 2026. All Rights Reserved.</p>
      <p class="mb-0 fst-italic opacity-75">Version 1.0.0</p>
    </aside>
    <aside>
      <button type="button" class="btn btn-outline-primary btn-sm open-url mt-2">Developer Contact Information</button>
    </aside>  
  `)  
  openURL()
}

export function bhName(){
  $('.bh-name').each(function() {
    $(this).html('<span>BH</span> <span class="text-primary">Mobile App</span>')
  })
} bhName()

export function pleaseWaitModalIsDisplay(displayed) {
  if(displayed){
    $('#pleaseWaitModalClose')[0].click()
  } else {
    $('#pleaseWaitModalOpen')[0].click()
  }
}

$(document).ready(function(){
  setTimeout(() => {
    aboutThisApp()
    autoUpdateOverdueBills()
    autoUpdateOverduePaymentBills()
    autoUpdateOverduePaymentRents()
  }, TIMEOUT_MS)

  // Home and Title Clicked
  $('#logoTitleLink').off('click').on('click', () => {
    autoUpdateOverdueBills()
    autoUpdateOverduePaymentBills()
    autoUpdateOverduePaymentRents()

    navbarSupportedContentHidden()
    pleaseWaitModalIsDisplay(false)  
    
    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#dashboardNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#dashboardNavLink').addClass('active')

    $('#mainContent').load('pages/please_wait.html')

    setTimeout(() => {
      $('#mainContent').load("pages/dashboard.html", () => {
        dashboardContentDisplay()
        
        pleaseWaitModalIsDisplay(true)
        dashboardDateTime()
        setActivationCodeIfNotSetYet()
        setAppIdIfNotSetYet()
        dashboardRooms()
        dashboardBoarders()
        dashboardBelongings()
        dashboardRents()
        dashboardBills()
        dashboardPayments()
        dashboardRevenue()
        dashboardRemindersReadCount()
      })
    }, TIMEOUT_MS);
  })
  
})
