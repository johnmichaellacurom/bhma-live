import {navbarSupportedContentHidden, pleaseWaitModalIsDisplay, toast} from './index.js'

export function updateStorageBar(){
  setTimeout(() => {
    if('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        const used = estimate.usage || 0
        const quota = estimate.quota || 0
        const percent = Number(((used / quota) * 100).toFixed(2))

        $('#progressBar').attr('aria-valuenow', `${percent}`)
        $('#progressBar div').css('width', `${percent}%`)
        $('#progressBar div').text(`${percent}%`)
        $('#progressBarInfo').text(`Used: ${(used / (1024*1024)).toFixed(2)} MB / ${(quota / (1024*1024)).toFixed(2)} MB (${percent}%)`)
      })
    } else{
      toast('error', 'Storage not supported.')
    }
  }, TIMEOUT_MS)
}

$(document).ready(function(){

  function databaseActiveNavLink(){
    $('#navbarSupportedContent .nav-item').removeClass('bg-primary-subtle')
    $('#databaseNavItem').addClass('bg-primary-subtle')

    $('#navbarSupportedContent .nav-link').removeClass('active')
    $('#databaseNavLink').addClass('active')

    navbarSupportedContentHidden()
  }

  function mainContentLoad() {
    $('#mainContent').load("pages/database.html", () => {
      pleaseWaitModalIsDisplay(true)
    })
  }
  
  setTimeout(() => {
    const getHash = location.hash
    if(getHash === "#database"){
      databaseActiveNavLink()
      updateStorageBar()
      mainContentLoad()
    }
  }, TIMEOUT_MS);

  function databaseMainContent() {
    pleaseWaitModalIsDisplay(false)
    databaseActiveNavLink()
    $('#mainContent').load('pages/please_wait.html')
  
    setTimeout(() => {
      updateStorageBar()
      mainContentLoad()
    }, TIMEOUT_MS);
  }

  // Nav Link Database Clicked 
  $('#databaseNavLink').off('click').on('click', () => {
    databaseMainContent()
  })

  $(document).off('click', '#databaseContentRefresh').on('click', '#databaseContentRefresh', () => {
    databaseMainContent()
  })
  
})