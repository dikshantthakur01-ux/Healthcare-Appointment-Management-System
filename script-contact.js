// Contact form handler
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Simple client-side handling - store in localStorage or show alert
      showAlert('Thank you for your message! We\'ll get back to you soon.', 'success');
      contactForm.reset();
    });
  }
});
