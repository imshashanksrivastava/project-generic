// Get modal elements
const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");

// Get buttons that open modals
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");

// Get close buttons
const closeLogin = document.getElementById("close-login");
const closeRegister = document.getElementById("close-register");

// Open modals
loginBtn.addEventListener("click", () => (loginModal.style.display = "flex"));
registerBtn.addEventListener(
  "click",
  () => (registerModal.style.display = "flex")
);

// Close modals
closeLogin.addEventListener("click", () => (loginModal.style.display = "none"));
closeRegister.addEventListener(
  "click",
  () => (registerModal.style.display = "none")
);

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === loginModal) loginModal.style.display = "none";
  if (event.target === registerModal) registerModal.style.display = "none";
});

// Header scroll functionality
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.style.backgroundColor = "white";
    header.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    header.classList.add("scrolled");
  } else {
    header.style.backgroundColor = "#0d084d";
    header.style.boxShadow = "none";
    header.classList.remove("scrolled");
  }
});

// Handle registration form submission
const registerForm = document.getElementById("register-form");
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent the form from refreshing the page

  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const visitor = document.getElementById("register-visitor").checked;

  const userData = { name, email, password, visitor };

  try {
    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    alert(result.message);
    if (response.status === 201) {
      registerModal.style.display = "none"; // Close modal if registration is successful
    }
  } catch (error) {
    console.error("Error registering:", error);
  }
});

// Handle login form submission
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const loginData = { email, password };

  try {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    });

    const result = await response.json();

    alert(result.message);
    if (response.status === 200) {
      // Store the email and visitor status in localStorage
      localStorage.setItem("email", email); // Store email
      localStorage.setItem("isVisitor", result.isVisitor || "false"); // Store visitor status
      loginModal.style.display = "none"; // Close modal if login is successful
      window.location.href = "index.html"; // Redirect to index.html after successful login
    }
  } catch (error) {
    console.error("Error logging in:", error);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;

      const feedbackData = { name, email, message };

      try {
        const response = await fetch("http://localhost:5000/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(feedbackData),
        });

        const result = await response.json();
        if (response.ok) {
          alert(result.message);
          contactForm.reset();
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        console.error("Error sending feedback:", error);
        alert(
          "An error occurred while sending your message. Please try again."
        );
      }
    });
  } else {
    console.error("Contact form not found.");
  }
});
