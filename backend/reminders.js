import {navbarSupportedContentHidden, pleaseWaitModalIsDisplay, toast} from './index.js'
import {loadReminders} from './extensions/reminders/loadReminders.js'
import {markAllAsRead} from './extensions/reminders/markAllAsRead.js'
import {markAsRead} from './extensions/reminders/markAsRead.js'

function remindersActiveNavLink() {
  navbarSupportedContentHidden()
}

export function remindersMainContent() {
  pleaseWaitModalIsDisplay(false)
  remindersActiveNavLink()
  $('#mainContent').load('pages/please_wait.html')

  setTimeout(() => {
    mainContentLoad()
  }, TIMEOUT_MS)
}

function mainContentLoad() {
  $('#mainContent').load("pages/reminders.html", function() {
    pleaseWaitModalIsDisplay(false)
    const limit = Number(localStorage.getItem('settings-reminders-display')) || 10
    const offset = 0
    sessionStorage.setItem('reminders-offset', offset)
    loadReminders(limit, offset, false)

    $(document).off('click', '#remindersContentRefresh').on('click', '#remindersContentRefresh', () => {
      remindersMainContent()
    })

    // mark all as read
    $(document).off('click', '#remindersMarkAllAsRead').on('click', '#remindersMarkAllAsRead', () => {
      if(!confirm('Are you sure you want to mark all as read?')) return

      $('#remindersMarkAllAsRead').prop('disabled', true)
      $('#remindersMarkAllAsRead .spinner-border').removeClass('visually-hidden')

      markAllAsRead()
      toast('success', 'Successfully marked.')

      $('#remindersMarkAllAsRead').prop('disabled', false)
      $('#remindersMarkAllAsRead .spinner-border').addClass('visually-hidden')
    })

    // mark as read
    $(document).off('click', '.reminder-mark-as-read').on('click', '.reminder-mark-as-read', function() {
      if(!confirm('Are you sure you want to mark this as read?')) return

      $(this).prop('disabled', true)
      $(this).find('.spinner-border').removeClass('visually-hidden')

      markAsRead($(this).attr('data-id'))
      toast('success', 'Successfully marked.')

      $(this).prop('disabled', false)
      $(this).find('.spinner-border').addClass('visually-hidden')
    })

    // see more
    $(document).off('click', '#remindersSeeMoreButton').on('click', '#remindersSeeMoreButton', function() {
      $(this).prop('disabled', true)
      $(this).find('.spinner-border').removeClass('visually-hidden')

      const limit = Number(localStorage.getItem('settings-reminders-display')) || 10
      const offset = Number(sessionStorage.getItem('reminders-offset') || 0) + limit
      sessionStorage.setItem('reminders-offset', offset)
      loadReminders(limit, offset, true)

      $(this).prop('disabled', false)
      $(this).find('.spinner-border').addClass('visually-hidden')
    })
  })
}

$(document).ready(function(){

  setTimeout(() => {
    const getHash = location.hash
    if(getHash === "#reminders"){
      remindersActiveNavLink()
      mainContentLoad()
    }
  }, TIMEOUT_MS);  
})