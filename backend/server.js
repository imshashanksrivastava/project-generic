const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON body

// Serve static files from the 'uploads' directory for photo access
app.use(express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/portfolioDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Rating schema and model
const ratingSchema = new mongoose.Schema({
  email: { type: String, required: true }, // Profile's email
  averageRating: { type: Number, default: 0 }, // The average rating
  totalRatings: { type: Number, default: 0 }, // The total number of ratings
  ratingCount: { type: Number, default: 0 }, // The number of testimonials submitted
});

const Rating = mongoose.model("Rating", ratingSchema);
// Update or create the rating for a profile
const updateRating = async (profileEmail, newRating) => {
  try {
    // Find the rating entry for the profile
    const rating = await Rating.findOne({ email: profileEmail });

    if (rating) {
      // Update the rating
      const newTotalRatings = rating.totalRatings + newRating;
      const newRatingCount = rating.ratingCount + 1;
      const averageRating = newTotalRatings / newRatingCount;

      rating.totalRatings = newTotalRatings;
      rating.ratingCount = newRatingCount;
      rating.averageRating = averageRating;

      await rating.save();
    } else {
      // Create new rating entry if it doesn't exist
      const newRatingEntry = new Rating({
        email: profileEmail,
        averageRating: newRating,
        totalRatings: newRating,
        ratingCount: 1,
      });
      await newRatingEntry.save();
    }
  } catch (err) {
    console.error("Error updating rating:", err);
  }
};

// Feedback schema and model
const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }, // Automatically set the submission date
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// Project schema and model
const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  technologies: [String],
  link: String,
  email: { type: String, required: true }, // Add email field
  advantages: String, // Add advantages field
});
const Project = mongoose.model("Project", projectSchema);

// Testimonials schema and model
const testimonialSchema = new mongoose.Schema({
  email: { type: String, required: true }, // Profile's email
  userEmail: { type: String, required: true }, // Reviewer's email
  content: { type: String, required: true }, // Testimonial text
  author: { type: String, required: true }, // Reviewer's name
  rating: { type: Number, required: true, min: 1, max: 5 }, // Star rating
  date: { type: Date, default: Date.now }, // Date of submission
});

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

// Profile schema and model
const profileSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true }, // Add email field
  bio: String,
  expertise: [String],
  resume: String,
  rating: { type: Number, default: 0 },
});

const Profile = mongoose.model("Profile", profileSchema);

// User authentication schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  visitor: { type: Boolean, default: false },
});

// Hash password before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// User model
const User = mongoose.model("User", userSchema);

// Routes for projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching projects" });
  }
});

// Routes for projects
app.post("/api/projects", async (req, res) => {
  const { title, description, technologies, link, email, advantages } =
    req.body;

  const project = new Project({
    title,
    description,
    technologies,
    link,
    email, // Include email
    advantages, // Include advantages
  });

  try {
    await project.save();
    res.status(201).json({ message: "Project created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating project" });
  }
});

// Routes for profiles
app.get("/api/profiles", async (req, res) => {
  const { email } = req.query; // Get email from query parameters

  try {
    const query = email ? { email } : {}; // If email is provided, filter by email
    const profiles = await Profile.find(query); // Find all profiles or those belonging to the email
    res.json(profiles);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching profiles", error: err.message });
  }
});

app.post("/api/profiles", async (req, res) => {
  const { name, bio, expertise, resume, skills, photo, email } = req.body; // Destructure email from request body

  const profile = new Profile({
    name,
    email, // Save the email
    bio,
    expertise,
    resume,
  });

  try {
    await profile.save();
    res.status(201).json({ message: "Profile created successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating profile", error: err.message });
  }
});

// User Registration Route
app.post("/api/register", async (req, res) => {
  const { name, email, password, visitor } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      name,
      email,
      password,
      visitor,
    });

    await user.save();
    console.log("Registered user:", user); // Log user details for debugging
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err); // More detailed error logging
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
});

// User Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// Check visitor status route
app.get("/api/visitor", async (req, res) => {
  const email = req.query.email; // Get email from query parameters

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with visitor status
    res.json({ visitor: user.visitor });
  } catch (err) {
    console.error("Error fetching visitor status:", err);
    res
      .status(500)
      .json({ message: "Error fetching visitor status", error: err.message });
  }
});

// Get user details by email
app.get("/api/user", async (req, res) => {
  const email = req.query.email; // Get email from query parameter

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email }); // Find user by email
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user details
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user data", error: err.message });
  }
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save to 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// Route to upload photo
app.post("/api/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const photoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ photoUrl });
});

// Route to get a single profile by ID
app.get("/api/profile/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res
      .status(500)
      .json({ message: "Error fetching profile", error: err.message });
  }
});

// Route to get projects related to a specific profile (optional)
app.get("/api/projects/:profileId", async (req, res) => {
  const { profileId } = req.params; // Get profile ID from the URL parameters

  try {
    const projects = await Project.find({ profileId }); // Find projects related to the profile (assuming you have a profileId field in Project)
    res.json(projects); // Return the projects
  } catch (err) {
    console.error("Error fetching projects:", err);
    res
      .status(500)
      .json({ message: "Error fetching projects", error: err.message });
  }
});

// Fetch portfolio data (projects, profile, and testimonials) by email
// Fetch portfolio data (projects, profile, and testimonials) by email
app.get("/api/portfolio", async (req, res) => {
  const { email } = req.query; // Get email from query parameters

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Fetch projects, profile, and testimonials
    const projects = await Project.find({ email });
    const profile = await Profile.findOne({ email });
    const testimonials = await Testimonial.find({ email });

    // Return the data in one response
    res.json({ projects, profile, testimonials });
  } catch (err) {
    console.error("Error fetching portfolio data:", err);
    res
      .status(500)
      .json({ message: "Error fetching portfolio data", error: err.message });
  }
});

// Route to handle contact form submission
app.post("/api/feedback", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const feedback = new Feedback({
    name,
    email,
    message,
  });

  try {
    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Error saving feedback:", err);
    res
      .status(500)
      .json({ message: "Error saving feedback", error: err.message });
  }
});

app.post("/api/testimonials", async (req, res) => {
  const { email, userEmail, content, author, rating } = req.body;

  if (!email || !userEmail || !content || !author || !rating) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const testimonial = new Testimonial({
    email, // Profile's email
    userEmail, // Reviewer's email
    content,
    author,
    rating,
  });

  try {
    await testimonial.save();
    res.status(201).json({ message: "Testimonial submitted successfully" });
  } catch (err) {
    console.error("Error saving testimonial:", err);
    res
      .status(500)
      .json({ message: "Error saving testimonial", error: err.message });
  }
});

// Route for adding testimonials
app.post("/api/testimonials", async (req, res) => {
  const { email, userEmail, content, author, rating } = req.body;

  const testimonial = new Testimonial({
    email, // Profile's email
    userEmail, // Reviewer's email
    content,
    author,
    rating, // Rating given by the reviewer
  });

  try {
    // Save the testimonial
    await testimonial.save();

    // Update the profile's rating
    await updateRating(email, rating);

    res.status(201).json({ message: "Testimonial added successfully" });
  } catch (err) {
    console.error("Error adding testimonial:", err);
    res.status(500).json({ message: "Error adding testimonial" });
  }
});
// Fetch portfolio data (projects, profile, testimonials, and ratings) by email
app.get("/api/portfolio", async (req, res) => {
  const { email } = req.query; // Get email from query parameters

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Fetch profile, projects, testimonials, and rating
    const projects = await Project.find({ email });
    const profile = await Profile.findOne({ email });
    const testimonials = await Testimonial.find({ email });
    const rating = await Rating.findOne({ email });

    // Return the portfolio data with the rating included
    res.json({
      projects,
      profile,
      testimonials,
      rating: rating ? rating.averageRating : null, // Include the average rating if it exists
    });
  } catch (err) {
    console.error("Error fetching portfolio data:", err);
    res.status(500).json({ message: "Error fetching portfolio data" });
  }
});
// Route to submit a testimonial
// Route for adding testimonials and updating profile rating
app.post("/api/testimonials", async (req, res) => {
  const { email, userEmail, content, author, rating, avgRating } = req.body;

  if (
    !email ||
    !userEmail ||
    !content ||
    !author ||
    !rating ||
    avgRating === undefined
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Save the testimonial first
  const testimonial = new Testimonial({
    email, // Profile's email
    userEmail, // Reviewer's email
    content,
    author,
    rating,
  });

  try {
    // Save the testimonial
    await testimonial.save();

    // Update the profile rating
    const profile = await Profile.findOne({ email });

    if (profile) {
      profile.rating = avgRating; // Set the profile rating to the new avgRating
      await profile.save();
      res
        .status(201)
        .json({
          message:
            "Testimonial submitted and profile rating updated successfully",
        });
    } else {
      res.status(404).json({ message: "Profile not found" });
    }
  } catch (err) {
    console.error("Error saving testimonial or updating profile:", err);
    res
      .status(500)
      .json({
        message: "Error saving testimonial or updating profile",
        error: err.message,
      });
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
