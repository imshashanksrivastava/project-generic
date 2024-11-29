document.addEventListener("DOMContentLoaded", () => {
  // Show/hide "Others" input box based on checkbox selection
  const expertiseOptions = document.querySelectorAll('input[name="expertise"]');
  if (expertiseOptions) {
    expertiseOptions.forEach((option) => {
      option.addEventListener("change", (event) => {
        const selectedOptions = Array.from(expertiseOptions)
          .filter((option) => option.checked)
          .map((option) => option.value);

        const otherExpertiseContainer = document.getElementById(
          "other-expertise-container"
        );

        // Show/hide the 'Others' input field based on the selection
        if (selectedOptions.includes("Others")) {
          otherExpertiseContainer.style.display = "block";
        } else {
          otherExpertiseContainer.style.display = "none";
          document.getElementById("other-expertise").value = ""; // Clear "Others" input when not selected
        }
      });
    });
  } else {
    console.error("No expertise checkboxes found");
  }

  // Handle profile form submission
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Collect form data
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value; // Get email value
      const bio = document.getElementById("bio").value;

      // Collect selected expertise from checkboxes
      const selectedExpertise = Array.from(expertiseOptions)
        .filter((option) => option.checked)
        .map((option) => option.value);

      const otherExpertise = document.getElementById("other-expertise").value;

      // Combine selected expertise with "Others" input if applicable
      const expertise =
        selectedExpertise.includes("Others") && otherExpertise.trim()
          ? [
              ...selectedExpertise.filter((exp) => exp !== "Others"),
              otherExpertise.trim(),
            ]
          : selectedExpertise;

      const resume = document.getElementById("resume").value;

      try {
        // Make API request to submit profile data
        const response = await fetch("http://localhost:5000/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, bio, expertise, resume }),
        });

        const result = await response.json();

        if (response.ok) {
          alert("Profile created successfully!");
          window.location.href = "index.html"; // Redirect to index page
        } else {
          alert(`Error: ${result.message || "Failed to create profile."}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    });
  }

  // Handle contact form submission
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Collect contact form data
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;

      const feedbackData = { name, email, message };

      try {
        // Send feedback data via API
        const response = await fetch("http://localhost:5000/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(feedbackData),
        });

        const result = await response.json();
        if (response.ok) {
          alert(result.message);
          contactForm.reset(); // Reset the form after successful submission
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
