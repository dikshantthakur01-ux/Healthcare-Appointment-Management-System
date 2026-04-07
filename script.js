// Healthcare Appointment Management System - Shared JavaScript
// Uses localStorage for persistence

const APP_STORAGE = 'mediBookApp';
let currentUser = null;

// Utils
function getData(key) {
  return JSON.parse(localStorage.getItem(`${APP_STORAGE}_${key}`)) || [];
}

function setData(key, data) {
  localStorage.setItem(`${APP_STORAGE}_${key}`, JSON.stringify(data));
}

// Auth
function registerUser(name, email, password) {
  const users = getData('users');
  if (users.find(u => u.email === email)) {
    showAlert('User already exists!', 'danger');
    return false;
  }
  const user = { id: Date.now(), name, email, password, appointments: [] };
  users.push(user);
  setData('users', users);
  showAlert('Registration successful!', 'success');
  return true;
}

function loginUser(email, password) {
  const users = getData('users');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    showAlert('Invalid credentials!', 'danger');
    return false;
  }
  currentUser = user;
  localStorage.setItem(`${APP_STORAGE}_currentUserId`, user.id);
  showAlert('Login successful!', 'success');
  return true;
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem(`${APP_STORAGE}_currentUserId`);
  window.location.href = 'index.html';
}

function loadCurrentUser() {
  const userId = localStorage.getItem(`${APP_STORAGE}_currentUserId`);
  if (userId) {
    const users = getData('users');
    currentUser = users.find(u => u.id == userId);
  }
}

// Appointments
function bookAppointment(dept, doctor, date, time) {
  if (!currentUser) return false;
  const appts = getData('appointments');
  const appt = {
    id: Date.now(),
    userId: currentUser.id,
    dept,
    doctor,
    date,
    time,
    status: 'pending'
  };
  appts.push(appt);
  setData('appointments', appts);
  // Update user appts
  const users = getData('users');
  const userIdx = users.findIndex(u => u.id === currentUser.id);
  users[userIdx].appointments.push(appt.id);
  setData('users', users);
  
  // Send confirmation email via Outlook mailto
  const subject = `Appointment Confirmation - ${dept} with ${doctor}`;
  const body = `
Dear ${currentUser.name},

Your appointment has been successfully booked!

Details:
- Department: ${dept}
- Doctor: ${doctor}
- Date: ${date}
- Time: ${time}
- Status: Pending

Thank you for choosing MediBook!

Best regards,
MediBook Team
  `.trim().replace(/\n/g, '%0A');
  
  const clinicEmail = 'appointments@medibook.com'; // Update with real clinic email
  const mailtoUrl = `mailto:${clinicEmail}?subject=${encodeURIComponent(subject)}&body=${body}`;
  window.location.href = mailtoUrl;
  
  showAlert('Appointment booked! Check Outlook for confirmation.', 'success');
  return true;
}

function getUserAppointments() {
  if (!currentUser) return [];
  const allAppts = getData('appointments');
  return currentUser.appointments.map(id => allAppts.find(a => a.id === id)).filter(Boolean);
}

function deleteAppointment(apptId) {
  if (!currentUser) return;
  const allAppts = getData('appointments');
  const apptIdx = allAppts.findIndex(a => a.id === apptId);
  if (apptIdx > -1) {
    allAppts.splice(apptIdx, 1);
    setData('appointments', allAppts);
    // Update user
    const users = getData('users');
    const userIdx = users.findIndex(u => u.id === currentUser.id);
    users[userIdx].appointments = users[userIdx].appointments.filter(id => id !== apptId);
    setData('users', users);
    showAlert('Appointment cancelled!', 'warning');
  }
}

// UI Helpers
function showAlert(message, type) {
  const alertHtml = `
    <div class="alert alert-${type} alert-dismissible fade show position-fixed" style="top: 20px; right: 20px; z-index: 1060; min-width: 300px;" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', alertHtml);
}

// Navbar update (global)
function updateNavbar() {
  const navUser = document.getElementById('navUser');
  const navLogin = document.getElementById('navLogin');
  if (!navUser || !navLogin) return;
  
  if (currentUser) {
    navUser.style.display = 'block';
    navUser.innerHTML = `<i class="bi bi-person me-1"></i>${currentUser.name}`;
    navLogin.style.display = 'none';
  } else {
    navUser.style.display = 'none';
    navLogin.style.display = 'block';
  }
}

// Enhanced scroll reveal (global utility)
function initScrollReveals() {
  const reveals = document.querySelectorAll('.reveal');
  const revealOnScroll = () => {
    reveals.forEach((reveal, index) => {
      const windowHeight = window.innerHeight;
      const revealTop = reveal.getBoundingClientRect().top;
      const revealPoint = 150;
      if (revealTop < windowHeight - revealPoint) {
        reveal.classList.add('active');
        reveal.style.transitionDelay = `${index * 0.1}s`;
      }
    });
  };
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();
}

// Stats counters animation
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        counter.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString();
      }
    };
    updateCounter();
  });
}

// Confirm delete modal (for appointments)
function confirmDelete(apptId, callback) {
  if (confirm('Are you sure you want to cancel this appointment?')) {
    callback(apptId);
  }
}

// Init - Enhanced global
document.addEventListener('DOMContentLoaded', () => {
  loadCurrentUser();
  updateNavbar();
  initScrollReveals();
  
  // Auto-animate counters when in view
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  });
  
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) statsObserver.observe(statsSection);
});
