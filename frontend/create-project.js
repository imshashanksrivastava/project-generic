// Handle form submission
document
  .getElementById("portfolio-form")
  .addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission

    // Collect form values
    const email = document.getElementById("email").value; // Capture email
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const technologies = document
      .getElementById("technologies")
      .value.split(",")
      .map((tech) => tech.trim());
    const advantages = document.getElementById("advantages").value; // Capture advantages
    const link = document.getElementById("link").value;

    // Prepare data to be sent to the server
    const projectData = {
      email, // Include email
      title,
      description,
      technologies,
      advantages, // Include advantages
      link,
    };

    // Send data to backend
    fetch("http://localhost:5000/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData), // Send the full data object
    })
      .then((response) => {
        if (response.ok) {
          alert("Project created successfully!");
          window.location.href = "index.html"; // Redirect to homepage
        } else {
          alert("Failed to create project.");
        }
      })
      .catch((error) => console.error("Error creating project:", error));
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
