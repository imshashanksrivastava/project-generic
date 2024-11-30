// Get email and userEmail from URL parameters
const params = new URLSearchParams(window.location.search);
const email = params.get("email");
const userEmail = params.get("userEmail"); // Logged-in user's email

// Validate if both email and userEmail are provided
if (email && userEmail) {
  console.log(`Viewing profile for: ${email}`);
  console.log(`Logged in as: ${userEmail}`);

  // Fetch portfolio data
  fetch(
    `http://localhost:5000/api/portfolio?email=${encodeURIComponent(email)}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        // Display profile, projects, and testimonials if available
        if (data.profile) updateProfileSection(data.profile);
        if (data.projects && data.projects.length > 0)
          displayProjects(data.projects);
        if (data.testimonials && data.testimonials.length > 0)
          displayTestimonials(data.testimonials);
      } else {
        console.error("No data found for the provided email.");
      }
    })
    .catch((error) => console.error("Error fetching portfolio data:", error));
} else {
  console.error("Required email parameters are missing.");
}

// Update profile section with name, expertise, and bio
function updateProfileSection(profile) {
  document.getElementById("profile-name").textContent =
    profile.name || "Name not provided";

  const expertiseText = profile.expertise
    ? profile.expertise.join(", ")
    : "No expertise listed";
  document.getElementById("expertise-text").textContent = expertiseText;

  const bioText = profile.bio || "No bio available";
  document.getElementById("about-bio").textContent = bioText;

  document.getElementById("about-email").textContent =
    email || "Email not available";
}

// Display projects dynamically
function displayProjects(projects) {
  const projectsHTML = projects
    .map(
      (project) => `
      <div class="portfolio-item">
        <img src="https://via.placeholder.com/300" alt="${project.title}" />
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <a href="${project.link}" target="_blank" class="view-btn">View Project</a>
      </div>
    `
    )
    .join("");

  document.getElementById("portfolio-container").innerHTML += `
    <section id="portfolio">
      <div class="container">
        <h2>My Portfolio</h2>
        <div class="portfolio-grid">${projectsHTML}</div>
      </div>
    </section>
  `;
}

// Display testimonials with average rating
function displayTestimonials(testimonials) {
  const avgRating = testimonials.length
    ? (
        testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
      ).toFixed(1)
    : 0;

  document.getElementById(
    "avg-rating-hero"
  ).textContent = `Average Rating: ${avgRating} / 5`;

  const testimonialsHTML = testimonials
    .map(
      (testimonial) => `
      <div class="testimonial">
        <p>"${testimonial.content}"</p>
        <p><strong>- ${testimonial.author}</strong></p>
        <p>Rating: ${"★".repeat(testimonial.rating)}</p>
      </div>
    `
    )
    .join("");

  document.getElementById("portfolio-container").innerHTML += `
    <section id="testimonials">
      <div class="container">
        <h2>Testimonials</h2>
        <p>Average Rating: ${avgRating} / 5</p>
        <div class="testimonial-carousel">${testimonialsHTML}</div>
      </div>
    </section>
  `;
}

// Handle contact form submission
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const contactEmail = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  fetch("http://localhost:5000/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email: contactEmail, message }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert(data.message);
        document.getElementById("contactForm").reset();
      } else {
        alert("Error submitting feedback.");
      }
    })
    .catch((error) => {
      console.error("Error submitting feedback:", error);
      alert("An error occurred. Please try again.");
    });
});

// Dynamically set profile email in the testimonial form
document.getElementById("profileEmail").value = email;

// Handle testimonial form submission
document.getElementById("testimonialForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const profileEmail = document.getElementById("profileEmail").value;
  const author = document.getElementById("author").value;
  const rating = parseInt(document.getElementById("rating").value, 10);
  const content = document.getElementById("content").value;

  fetch("http://localhost:5000/api/testimonials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: profileEmail,
      userEmail,
      content,
      author,
      rating,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert(data.message);
        document.getElementById("testimonialForm").reset();
      } else {
        alert("Error submitting testimonial.");
      }
    })
    .catch((error) => console.error("Error submitting testimonial:", error));
});
