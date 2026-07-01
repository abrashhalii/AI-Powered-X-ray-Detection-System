const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Scan = require('../models/Scan');

// GET all patients
router.get('/', async (req, res) => {
  try {
    const { search, ageGroup, status } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (ageGroup) query.ageGroup = ageGroup;
    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET patient by ID with scans
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.id });
    const scans = await Scan.find({ patientId: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: { ...patient._doc, scans } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create patient
router.post('/', async (req, res) => {
  try {
    const patientId = `${200000 + Math.floor(Math.random() * 99999)}`;
    const patient = new Patient({ ...req.body, patientId });
    await patient.save();
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update patient
router.put('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { patientId: req.params.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE patient
router.delete('/:id', async (req, res) => {
  try {
    await Patient.findOneAndDelete({ patientId: req.params.id });
    res.json({ success: true, message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
