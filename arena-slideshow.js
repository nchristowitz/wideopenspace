
// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Configuration - CHANGE THIS TO YOUR CHANNEL
  const channelSlug = 'just-me-and-the-lads-and-1-bajillion-in-funding';
  const changeInterval = 1000; // Time between image changes in milliseconds (1000ms = 1 second)
  
  // Get DOM elements
  const elements = {
    title: document.getElementById('arena-channel-title'),
    image: document.getElementById('arena-current-image'),
    caption: document.getElementById('arena-caption')
  };
  
  // Check if required elements exist
  if (!elements.image) {
    console.error('Arena Display: Required HTML elements not found');
    return;
  }
  
  // State variables
  let images = [];
  let currentIndex = 0;
  
  // Fetch images from Are.na API
  fetch(`https://api.are.na/v2/channels/${channelSlug}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Update channel title
      if (elements.title) {
        elements.title.textContent = data.title || 'Are.na Images';
      }
      
      // Filter only image blocks
      images = data.contents.filter(block => block.class === "Image");
      
      if (images.length === 0) {
        console.warn('No images found in this Are.na channel');
        return;
      }
      
      // Show the first image
      showImage(0);
      
      // Start the image rotation
      setInterval(nextImage, changeInterval);
    })
    .catch(error => {
      console.error('Error loading Are.na images:', error);
    });
  
  // Show image at the specified index
  function showImage(index) {
    const image = images[index];
    
    // Update the image source
    elements.image.src = image.image?.display?.url;
    elements.image.alt = image.title || 'Loading from Are.na';
    
    // Update the caption if present
    if (elements.caption) {
      elements.caption.textContent = image.title || '';
    }
  }
  
  // Show the next image
  function nextImage() {
    // Increment the index, looping back to 0 when we reach the end
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  }
});