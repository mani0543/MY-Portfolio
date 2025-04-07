require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://192.168.43.205:27017/job-listing-app';
const API_URL = 'https://jsonfakery.com/jobs/simple-paginate'; // New API for random English jobs

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Job Schema
const jobSchema = new mongoose.Schema({
  id: String, // Using String to match the API's UUID
  title: String,
  company: String,
  location: String,
  description: String,
  requirements: String,
  apply_url: String,
}, { timestamps: true });
const Job = mongoose.model('Job', jobSchema);

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

// Sync Jobs from JSONFakery API
async function syncJobs() {
  try {
    console.log('Syncing jobs from JSONFakery API...');
    const response = await axios.get(API_URL);
    const rawJobs = Array.isArray(response.data) ? response.data : [];
    if (!rawJobs.length) throw new Error('No valid job data received');

    // Map JSONFakery data to our schema
    const jobs = rawJobs.map(job => ({
      id: job.id.toString(), // Convert to string
      title: job.job_title,
      company: job.company_name,
      location: job.location.city + ', ' + job.location.country, // Combine city and country
      description: job.description,
      requirements: job.requirements || 'No specific requirements listed', // Fallback if missing
      apply_url: job.apply_url || `https://example.com/apply/${job.id}`, // Fallback if missing
    }));

    await Job.deleteMany({});
    await Job.insertMany(jobs);
    console.log('Jobs synced successfully');
  } catch (error) {
    console.error('Error syncing jobs:', error.message);
    if (error.response && error.response.status === 404) {
      console.error('API endpoint not found (404). Falling back to local data.');
    }
    await fallbackToLocalData();
  }
}

// Fallback to db.json
async function fallbackToLocalData() {
  if (!fs.existsSync('db.json')) {
    console.log('Fallback file db.json not found.');
    return;
  }
  try {
    console.log('Using db.json as fallback...');
    const data = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    await Job.deleteMany({});
    await Job.insertMany(data.jobs);
    await User.deleteMany({});
    await User.insertMany(data.users);
    console.log('Fallback data inserted successfully');
  } catch (error) {
    console.error('Error reading db.json:', error.message);
  }
}

// API Endpoints
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    if (!jobs.length) {
      return res.status(404).json({ error: 'No jobs found in database' });
    }
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
  }
});

app.post('/api/signup', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const user = new User({ username, password, email });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Signup failed', details: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Login successful', user: { username, email: user.email, phone: user.phone } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

app.put('/api/profile', async (req, res) => {
  const { username, newUsername, email, phone } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Current username is required' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update fields if provided
    if (newUsername) user.username = newUsername;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { username: user.username, email: user.email, phone: user.phone } });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Profile update failed', details: error.message });
  }
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  syncJobs();
});