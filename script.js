// Select the outer container, inner container, and all lenticular images
const outerContainer = document.querySelector('.outer-container')
const innerContainer = document.querySelector('.inner-container')
const description = document.getElementById('description')
var images = document.querySelectorAll('.lenticular-image')

// Variables to track dragging state and mouse position
let isDragging = false
let startX
let currentMouseX

// Function to randomly select an image set
function getRandomImageSet () {
  const keys = Object.keys(imageSets)
  const randomKey = keys[Math.floor(Math.random() * keys.length)]
  console.log('returned imageSet:', imageSets[randomKey])
  return imageSets[randomKey]
}

// Function to set container dimensions based on image aspect ratio and window size
function setContainerDimensions () {
  // Assume the first image sets the aspect ratio
  const firstImage = document.querySelector('.lenticular-image')
  const img = new Image()
  img.src = firstImage.src

  img.onload = () => {
    const aspectRatio = img.width / img.height
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    if (aspectRatio > 1) {
      // Landscape image
      if (windowWidth > windowHeight) {
        // Landscape window
        outerContainer.style.height = `${windowHeight * 0.5}px`
        outerContainer.style.width = `${windowHeight * 0.5 * aspectRatio}px`
      } else {
        // Portrait window
        outerContainer.style.width = `${windowWidth * 0.65}px`
        outerContainer.style.height = `${(windowWidth * 0.65) / aspectRatio}px`
      }
    } else {
      // Portrait image
      outerContainer.style.height = `${windowHeight * 0.6}px`
      outerContainer.style.width = `${windowHeight * 0.6 * aspectRatio}px`
    }

    // Initialize image opacities and 3D effect after setting dimensions
    const rect = outerContainer.getBoundingClientRect()
    const mouseX = rect.width / 2
    updateImageOpacities(mouseX)
    update3DEffect(mouseX)
  }
}

// Calculates the opacity of each image based on the mouseX position within the outer container
function updateImageOpacities (mouseX) {
  const width = outerContainer.clientWidth
  images = document.querySelectorAll('.lenticular-image')
  const totalImages = images.length
  const segmentSize = width / (totalImages - 1)

  images.forEach((image, index) => {
    const segmentCenter = index * segmentSize
    const distanceToSegmentCenter = Math.abs(mouseX - segmentCenter)
    const opacity = Math.max(1 - distanceToSegmentCenter / segmentSize, 0)
    image.style.opacity = opacity
  })
}

// Calculate the rotation angle based on the mouseX position relative to the center of the outer container and applies a 3D rotation effect with a shadow effect to the inner container
function update3DEffect (mouseX) {
  const width = outerContainer.clientWidth
  const centerX = width / 2
  const rotationY = ((mouseX - centerX) / centerX) * 50 // Adjust the multiplier for rotation intensity
  innerContainer.style.transform = `rotateY(${rotationY}deg)`
  const shadowOffsetX = -rotationY * 1.5 // Adjust the shadow offset based on rotation
  innerContainer.style.boxShadow = `${shadowOffsetX}px 20px 30px rgba(0, 0, 0, 0.5)`
}

// Function to handle pointer down (mouse or touch start) event
function onPointerDown (event) {
  if (
    event.target === innerContainer ||
    innerContainer.contains(event.target)
  ) {
    isDragging = true
    startX = event.clientX || event.touches[0].clientX
    document.body.classList.add('dragging')
    event.preventDefault() // Prevent default behavior
  }
}

// Function to handle pointer move (mouse or touch move) event
function onPointerMove (event) {
  if (!isDragging) return

  currentMouseX = event.clientX || event.touches[0].clientX
  const rect = outerContainer.getBoundingClientRect()
  const mouseX = Math.max(0, Math.min(rect.width, currentMouseX - rect.left)) // Clamp the mouseX within the container width

  updateImageOpacities(mouseX)
  update3DEffect(mouseX)
}

// Function to handle pointer up (mouse or touch end) event
function onPointerUp () {
  if (isDragging) {
    isDragging = false
    document.body.classList.remove('dragging')
  }
}

// Function to add images to the inner container
function addImages (imageSet) {
  console.log('adding images')
  let imagesLoaded = 0
  const totalImages = imageSet.images.length

  imageSet.images.forEach(image => {
    const img = document.createElement('img')
    img.src = image.src
    img.className = 'lenticular-image'
    img.alt = `${image.title} (${image.date})`
    img.setAttribute('data-title', image.title)
    img.setAttribute('data-date', image.date)
    img.setAttribute('data-link', image.link)

    img.onload = () => {
      imagesLoaded++
      if (imagesLoaded === totalImages) {
        console.log('all images loaded')
        setContainerDimensions()
      }
    }

    innerContainer.appendChild(img)
  })
}

// Function to calculate date range for an image set
function getDateRange (imageSet) {
  let minDate = Infinity
  let maxDate = -Infinity
  imageSet.images.forEach(image => {
    const [start, end] = image.date
    if (start < minDate) minDate = start
    if (end > maxDate || (end === undefined && start > maxDate))
      maxDate = end || start
  })
  return `${minDate} - ${maxDate}`
}

// Function to add details of the image set
function addDetails (imageSet) {
  // Add the title and date range
  const dateRange = getDateRange(imageSet)
  document.getElementById('imageSetTitle').textContent = imageSet.title
  document.getElementById('imageSetDateRange').textContent = dateRange

  // Set up more details button
  const moreDetailsBtn = document.getElementById('moreDetailsBtn')
  moreDetailsBtn.onclick = () => openDetailsDialog(imageSet)
}

// Function to open the details dialog
function openDetailsDialog (imageSet) {
  const dialogContent = document.getElementById('dialogContent')
  dialogContent.innerHTML = '' // Clear previous content

  // Populate dialog with image details
  imageSet.images.forEach(image => {
    const imageTitle = document.createElement('a')
    imageTitle.href = image.link
    imageTitle.target = '_blank'
    imageTitle.textContent = image.title
    imageTitle.style.display = 'block'

    const imageDate = document.createElement('p')
    const [start, end] = image.date
    imageDate.textContent = end ? `${start} - ${end}` : start

    dialogContent.appendChild(imageTitle)
    dialogContent.appendChild(imageDate)
  })

  // Open the dialog
  document.getElementById('detailsDialog').showModal()
}

// Event listeners for pointer down, move, and up events
innerContainer.addEventListener('mousedown', onPointerDown)
innerContainer.addEventListener('touchstart', onPointerDown)
document.addEventListener('mousemove', onPointerMove)
document.addEventListener('touchmove', onPointerMove)
document.addEventListener('mouseup', onPointerUp)
document.addEventListener('touchend', onPointerUp)

// Ensure dragging is detected even if the mouse leaves the container, so the grabbing cursor is maintained
document.addEventListener('mouseleave', onPointerUp)
document.addEventListener('touchcancel', onPointerUp)

// Initial setup on window load and resize
window.addEventListener('load', () => {
  // Get the image set to display
  const selectedImageSet = getRandomImageSet()
  addImages(selectedImageSet)
  addDetails(selectedImageSet)
})

window.addEventListener('resize', () => {
  setContainerDimensions()
})
