const express = require('express');
const Campaign = require('../models/Campaign');
const { protect } = require('../middlewares/auth');
const upload = require('../config/upload');
const path = require('path');

const router = express.Router();

/**
 * @route   POST /api/campaigns
 * @desc    Create a new campaign
 * @access  Private (Creator only)
 */
router.post('/', protect, upload.array('documents', 3), async (req, res) => {
  try {
    if (req.user.role !== 'Creator') {
      return res.status(403).json({ message: 'Only campaign creators can create campaigns' });
    }

    const { title, description, category, goalAmount } = req.body;

    // ✅ Store relative URLs instead of system file paths
    const documents = req.files
      ? req.files.map(file => `/uploads/${path.basename(file.path)}`)
      : [];

    const campaign = new Campaign({
      title,
      description,
      category,
      goalAmount,
      creator: req.user.id,
      documents,
    });

    await campaign.save();
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ message: 'Error creating campaign', error: err.message });
  }
});

/**
 * @route   GET /api/campaigns
 * @desc    Get all campaigns
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { category, sort } = req.query;
    let query = {};

    if (category) query.category = category;

    let campaigns = Campaign.find(query).populate('creator', 'name email');

    if (sort === 'urgent') {
      campaigns = campaigns.sort({ createdAt: -1 });
    } else if (sort === 'new') {
      campaigns = campaigns.sort({ createdAt: -1 });
    }

    const result = await campaigns;
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching campaigns', error: err.message });
  }
});

/**
 * @route   GET /api/campaigns/:id
 * @desc    Get a single campaign by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('creator', 'name email');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching campaign', error: err.message });
  }
});

module.exports = router;
