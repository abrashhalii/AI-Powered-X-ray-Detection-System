require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/scans', require('./routes/scans'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'X-Ray Detection API Running' }));

// MongoDB connection + seed data
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/xray_detection';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedDatabase();
  })
  .catch(err => {
    console.log('⚠️  MongoDB not connected — running without database');
    console.log('   Install MongoDB or use MongoDB Atlas for full functionality');
  });

async function seedDatabase() {
  const Scan = require('./models/Scan');
  const Patient = require('./models/Patient');
  
  const count = await Scan.countDocuments();
  if (count > 0) return; // Already seeded

  const patients = [
    { patientId: '211001', name: 'Amir Ullah', contact: '(374) 373833', age: 35, gender: 'Male', ageGroup: '30-39' },
    { patientId: '211002', name: 'Sara Rahman', contact: '(374) 373562', age: 28, gender: 'Female', ageGroup: '30-39' },
    { patientId: '211003', name: 'Bilal Khan', contact: '(574) 375558', age: 42, gender: 'Male', ageGroup: '30-39' },
    { patientId: '211004', name: 'Bilal Khan', contact: '(574) 373582', age: 55, gender: 'Male', ageGroup: '50-60+' },
    { patientId: '211005', name: 'Fatima Noor', contact: '(574) 373853', age: 31, gender: 'Female', ageGroup: '30-39' },
    { patientId: '211006', name: 'Bilal Khan', contact: '(574) 373858', age: 47, gender: 'Male', ageGroup: '30-39' },
    { patientId: '211007', name: 'Bilal Khan', contact: '(574) 373852', age: 38, gender: 'Male', ageGroup: '30-39' },
    { patientId: '211008', name: 'Fatima Noor', contact: '(514) 373053', age: 62, gender: 'Female', ageGroup: '50-60+' },
  ];

  await Patient.insertMany(patients);

  const scans = [
    { scanId: 'Scan 101551', patientId: '211001', patientName: 'Amir Ullah', status: 'Analyzed', prediction: 'Pneumonia', aiConfidence: 94, scanDate: new Date('2023-09-17'), detectionResults: { pneumonia: 0.89, tuberculosis: 0.12, normal: 0.01 } },
    { scanId: 'Scan 100225', patientId: '211002', patientName: 'Sara Rahman', status: 'Normal', prediction: 'Normal', aiConfidence: 91, scanDate: new Date('2023-09-07'), detectionResults: { pneumonia: 0.05, tuberculosis: 0.02, normal: 0.93 } },
    { scanId: 'Scan 100332', patientId: '211003', patientName: 'Bilal Khan', status: 'Pending', prediction: 'Pending', aiConfidence: 99, scanDate: new Date('2023-09-07'), detectionResults: { pneumonia: 0.45, tuberculosis: 0.35, normal: 0.20 } },
    { scanId: 'Scan 100233', patientId: '211004', patientName: 'Bilal Khan', status: 'Normal', prediction: 'Normal', aiConfidence: 93, scanDate: new Date('2023-09-07'), detectionResults: { pneumonia: 0.03, tuberculosis: 0.02, normal: 0.95 } },
    { scanId: 'Scan 100937', patientId: '211005', patientName: 'Fatima Noor', status: 'Flagged', prediction: 'Tuberculosis', aiConfidence: 97, scanDate: new Date('2023-09-28'), detectionResults: { pneumonia: 0.15, tuberculosis: 0.78, normal: 0.07 } },
  ];

  await Scan.insertMany(scans);
  console.log('✅ Database seeded with sample data');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
