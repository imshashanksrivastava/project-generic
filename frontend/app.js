let allProfiles = []; // Store all profiles for filtering and searching

// Fetch and display profiles
function fetchProfiles() {
  fetch("http://localhost:5000/api/profiles")
    .then((response) => response.json())
    .then((profiles) => {
      allProfiles = profiles; // Store fetched profiles for filtering
      displayProfiles(allProfiles); // Display all profiles initially
    })
    .catch((error) => console.error("Error fetching profiles:", error));
}

// Function to dynamically display profiles
function displayProfiles(profiles) {
  const profileContainer = document.getElementById("profiles");
  profileContainer.innerHTML = ""; // Clear previous content
  profiles.forEach((profile) => {
    const profileDiv = document.createElement("div");
    profileDiv.className = "profile-item";
    profileDiv.innerHTML = `
    
      <h3>${profile.name}</h3>
      <p>${profile.bio}</p>
      <p><strong>Expertise:</strong> ${profile.expertise.join(", ")}</p>
      <a href="${profile.resume}" target="_blank">View Resume</a>
      <button 
  class="view-portfolio-btn" 
  onclick="navigateToPortfolio('${profile.email}')">
  View Portfolio
</button>

    `;
    profileContainer.appendChild(profileDiv);
  });
}

// Filter profiles based on search and dropdown
function filterProfiles() {
  const searchQuery = document.getElementById("search-bar").value.toLowerCase();
  const selectedExpertise = document.getElementById("filter-expertise").value;

  // List of predefined expertise options
  const predefinedExpertise = [
    "Web Development",
    "Data Science",
    "Design",
    "Marketing",
  ];

  const filteredProfiles = allProfiles.filter((profile) => {
    const name = profile.name ? profile.name.toLowerCase() : ""; // Handle undefined name
    const bio = profile.bio ? profile.bio.toLowerCase() : ""; // Handle undefined bio
    const matchesSearch =
      name.includes(searchQuery) || bio.includes(searchQuery);

    // Check for expertise match
    const isOthers =
      selectedExpertise === "Others" &&
      profile.expertise.some((exp) => !predefinedExpertise.includes(exp));
    const matchesExpertise =
      selectedExpertise === "" ||
      profile.expertise.includes(selectedExpertise) ||
      isOthers;

    return matchesSearch && matchesExpertise;
  });

  displayProfiles(filteredProfiles); // Display filtered profiles
}

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

// Add event listeners for search and filter
document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("email");
  const emailElement = document.getElementById("user-email");

  // Display email if available
  if (email && emailElement) {
    emailElement.textContent = `Logged in as: ${email}`;
  }

  // Fetch visitor status
  if (email) {
    fetch(
      `http://localhost:5000/api/visitor?email=${encodeURIComponent(email)}`
    )
      .then((response) => response.json())
      .then((data) => {
        const createPortfolioLink = document.getElementById(
          "create-portfolio-link"
        );
        const createProfileLink = document.getElementById(
          "create-profile-link"
        );

        if (data.visitor) {
          createPortfolioLink.style.display = "none";
          createProfileLink.style.display = "none";
        }
      })
      .catch((error) => console.error("Error fetching visitor status:", error));
  }

  // Fetch and display profiles
  fetchProfiles();

  // Add event listeners for search and filter
  document
    .getElementById("search-bar")
    .addEventListener("input", filterProfiles);
  document
    .getElementById("filter-expertise")
    .addEventListener("change", filterProfiles);
});

function navigateToPortfolio(profileEmail) {
  const userEmail = localStorage.getItem("email");
  if (userEmail) {
    window.location.href = `portfolio.html?email=${encodeURIComponent(
      profileEmail
    )}&userEmail=${encodeURIComponent(userEmail)}`;
  } else {
    alert("You need to be logged in to view the portfolio.");
  }
}

// Logout functionality
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("isVisitor");
  localStorage.removeItem("email");
  window.location.href = "home.html"; // Redirect to home.html (login page)
});
