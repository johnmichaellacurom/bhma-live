document.documentElement.setAttribute('data-bs-theme', localStorage.getItem('theme') || 'light')
document.documentElement.style.fontSize = `${localStorage.getItem('text-size') || '16'}px`