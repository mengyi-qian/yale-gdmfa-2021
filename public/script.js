function hide(element) {
  element.style.display = "none"
}
function show(element) {
  element.style.display = "block"
}

 
let aboutButton = document.querySelector('#about')
let aboutContainer = document.querySelector('#about-container')
hide(aboutContainer)
aboutButton.addEventListener('click', () => {
  show(aboutContainer)
  hide(aboutButton)
})
aboutContainer.addEventListener('click', () => {
  hide(aboutContainer)
  show(aboutButton)
})

// for mobile:
function windowResize() {
  // get the viewport height and we multiple it by 1% to get a value for a vh unit
  let vh = window.innerHeight * 0.01;
  // set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}
windowResize() 
window.onresize = windowResize