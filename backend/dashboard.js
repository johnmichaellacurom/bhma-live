import {navbarSupportedContentHidden, dashboardDateTime, setActivationCodeIfNotSetYet, setAppIdIfNotSetYet, pleaseWaitModalIsDisplay} from './index.js'
import {dashboardRooms} from './extensions/dashboard/rooms.js'
import {dashboardBoarders} from './extensions/dashboard/boarders.js'
import {dashboardBelongings} from './extensions/dashboard/belongings.js'
import {dashboardRevenue} from './extensions/dashboard/revenue.js'
import {dashboardRents} from './extensions/dashboard/rents.js'
import {dashboardBills} from './extensions/dashboard/bills.js'
import {dashboardPayments} from './extensions/dashboard/payments.js'
import {dashboardReminders} from './extensions/dashboard/reminders.js'
import {openDatabase} from '../indexdb/database.js'
import {remindersMainContent} from './reminders.js'

export function dashboardRemindersReadCount(){
  openDatabase().then(db => {
    const index = db.transaction('reminders', 'readwrite').objectStore('reminders').index('read_at')
    const count = index.count('')
    count.onsuccess = () => {
      const unRead = count.result
      if(unRead <= 0) {
        $('.dashboard-reminders-unread-count').addClass('d-none')
      }
      $('#dashboardRemindersUnReadCount').text(unRead > 9 ? '9+' : unRead)
    }
  })

  // Nav Link reminders Clicked 
  $('#remindersNavLink').off('click').on('click', () => {
    remindersMainContent()
  })
  
}

export function dashboardContentDisplay(){
  
  // revenue
  if(localStorage.getItem("settings-dashboard-show-revenue") !== 'off'){
    $('#dashboardRevenueDiv').removeClass('d-none') 
  } else {
    $('#dashboardRevenueDiv').addClass('d-none') 
  }

  // rents
  if(localStorage.getItem("settings-dashboard-show-rents") !== 'off'){
    $('#dashboardRentsDiv').removeClass('d-none') 
  } else {
    $('#dashboardRentsDiv').addClass('d-none') 
  }

  // bills
  if(localStorage.getItem("settings-dashboard-show-bills") !== 'off'){
    $('#dashboardBillsDiv').removeClass('d-none') 
  } else {
    $('#dashboardBillsDiv').addClass('d-none') 
  }

  // payments
  if(localStorage.getItem("settings-dashboard-show-payments") !== 'off'){
    $('#dashboardPaymentsDiv').removeClass('d-none') 
  } else {
    $('#dashboardPaymentsDiv').addClass('d-none') 
  }

  // Belongings
  if(localStorage.getItem("settings-dashboard-show-belongings") !== 'off'){
    $('#dashboardBelongingssDiv').removeClass('d-none') 
  } else {
    $('#dashboardBelongingssDiv').addClass('d-none') 
  }

  // Boarders
  if(localStorage.getItem("settings-dashboard-show-boarders") !== 'off'){
    $('#dashboardBoardersDiv').removeClass('d-none') 
  } else {
    $('#dashboardBoardersDiv').addClass('d-none') 
  }

  // Rooms
  if(localStorage.getItem("settings-dashboard-show-rooms") !== 'off'){
    $('#dashboardRoomsDiv').removeClass('d-none') 
  } else {
    $('#dashboardRoomsDiv').addClass('d-none') 
  }
}

function dashboardActiveNavLink(){
  $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
  $('#dashboardNavItem').addClass('bg-primary-subtle')

  $('#navbarSupportedContent .nav-link').removeClass('active')
  $('#dashboardNavLink').addClass('active')

  navbarSupportedContentHidden()
}

function dashboardPage() {
  $('#mainContent').load("pages/dashboard.html", () => {
    dashboardContentDisplay()

    pleaseWaitModalIsDisplay(true)
    setActivationCodeIfNotSetYet()
    setAppIdIfNotSetYet()
    dashboardDateTime()
    dashboardRooms()
    dashboardBoarders()
    dashboardBelongings()
    dashboardRents()
    dashboardBills()
    dashboardPayments()
    dashboardRevenue()
    dashboardReminders()
    dashboardRemindersReadCount()
  })
}

function dashboardMainContent(){
  dashboardActiveNavLink()
  $('#mainContent').load('pages/please_wait.html')
  pleaseWaitModalIsDisplay(false)  
  setTimeout(() => {
    dashboardPage()
  }, TIMEOUT_MS);
}

$(document).ready(function(){
  pleaseWaitModalIsDisplay(false)
  setTimeout(() => {
    const getHash = location.hash
    if(getHash === "" || getHash === "#dashboard"){
      dashboardActiveNavLink()
      dashboardPage()
    }
  }, TIMEOUT_MS);  

  // Nav Link Dashboard Clicked 
  $('#dashboardNavLink').off('click').on('click', () => {
    dashboardMainContent()
  })

  $(document).off('click').on('click', '#remindersLink', () => {
    $('#mainContent').load('pages/please_wait.html')

    setTimeout(() => {
      $('#mainContent').load("pages/reminders.html")
    }, TIMEOUT_MS);
  })

  $(document).off('click', '#dashboardContentRefresh').on('click', '#dashboardContentRefresh', () => {
    dashboardMainContent()
  })
  

})
