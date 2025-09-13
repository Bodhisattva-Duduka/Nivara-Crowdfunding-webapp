// server/routes/donations.js
const express = require('express');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();


// @desc    Make a donation to a campaign
// @route   POST /api/donations/:campaignId
// @access  Private (Donors only)
router.post('/:campaignId', protect, restrictTo('Donor'), async (req, res) => {
  const { amount, paymentId } = req.body;

  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    if (campaign.status !== 'Active') {
      return res.status(400).json({ message: 'Cannot donate to this campaign' });
    }

    // Create a donation record
    const donation = new Donation({
      donor: req.user._id,
      campaign: campaign._id,
      amount,
      paymentId: paymentId || `TXN-${Date.now()}`, // Mock transaction ID
    });

    await donation.save();

    // Update campaign progress
    campaign.raisedAmount += amount;
    campaign.donors.push({ donor: req.user._id, amount });
    if (campaign.raisedAmount >= campaign.goalAmount) {
      campaign.status = 'Completed';
    }

    await campaign.save();

    res.status(201).json({ message: 'Donation successful', donation, campaign });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// @desc    Get all donations by logged-in donor
// @route   GET /api/donations/my
// @access  Private (Donor only)
router.get('/my', protect, restrictTo('Donor'), async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('campaign', 'title category goalAmount raisedAmount status');

    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// @desc    Get all donations for a campaign
// @route   GET /api/donations/campaign/:campaignId
// @access  Private (Creator only)
router.get('/campaign/:campaignId', protect, restrictTo('Creator'), async (req, res) => {
  try {
    const donations = await Donation.find({ campaign: req.params.campaignId })
      .populate('donor', 'name email');

    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
