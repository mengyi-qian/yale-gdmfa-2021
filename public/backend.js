let form = document.querySelector('#form')
let camSelect = document.querySelector('#cameras')
let colorSelect = document.querySelector('#colors')

colorSelect.options[0].disabled = false
colorSelect.options[1].disabled = true
colorSelect.options[2].disabled = false
colorSelect.options[3].disabled = true
colorSelect.options[4].disabled = true
colorSelect.options[5].disabled = true
colorSelect.options[6].disabled = false

camSelect.addEventListener('change', () => {
  if ( camSelect.options[0].selected ) {
    colorSelect.options[0].disabled = false
    colorSelect.options[1].disabled = true
    colorSelect.options[2].disabled = false
    colorSelect.options[3].disabled = true
    colorSelect.options[4].disabled = true
    colorSelect.options[5].disabled = true
    colorSelect.options[6].disabled = false
  } else if ( camSelect.options[1].selected ) {
    colorSelect.options[0].disabled = false
    colorSelect.options[1].disabled = true
    colorSelect.options[2].disabled = true
    colorSelect.options[3].disabled = false
    colorSelect.options[4].disabled = false
    colorSelect.options[5].disabled = true
    colorSelect.options[6].disabled = true
  } else if ( camSelect.options[2].selected ) {
    colorSelect.options[0].disabled = true
    colorSelect.options[1].disabled = false
    colorSelect.options[2].disabled = true
    colorSelect.options[3].disabled = false
    colorSelect.options[4].disabled = true
    colorSelect.options[5].disabled = false
    colorSelect.options[6].disabled = true
  } else if ( camSelect.options[3].selected ) {
    colorSelect.options[0].disabled = true
    colorSelect.options[1].disabled = true
    colorSelect.options[2].disabled = true
    colorSelect.options[3].disabled = true
    colorSelect.options[4].disabled = false
    colorSelect.options[5].disabled = false
    colorSelect.options[6].disabled = false
  } else if ( camSelect.options[4].selected ) {
    colorSelect.options[0].disabled = false
    colorSelect.options[1].disabled = true
    colorSelect.options[2].disabled = true
    colorSelect.options[3].disabled = false
    colorSelect.options[4].disabled = true
    colorSelect.options[5].disabled = true
    colorSelect.options[6].disabled = false
  } else if ( camSelect.options[5].selected ) {
    colorSelect.options[0].disabled = true
    colorSelect.options[1].disabled = true
    colorSelect.options[2].disabled = false
    colorSelect.options[3].disabled = true
    colorSelect.options[4].disabled = false
    colorSelect.options[5].disabled = false
    colorSelect.options[6].disabled = true
  }
})
