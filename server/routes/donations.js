const express = require("express");
const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");
const { protect } = require("../middlewares/auth");

const router = express.Router();

// ✅ Get all donations by logged-in donor
router.get("/my", protect, async (req, res) => {
  try {
    if (req.user.role !== "Donor") {
      return res.status(403).json({ success: false, message: "Only donors can view their donations" });
    }

    const donations = await Donation.find({ donor: req.user.id })
      .populate("campaign", "title category goalAmount raisedAmount status")
      .sort({ donatedAt: -1 });

    res.json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ✅ Get all donations received by campaigns of logged-in creator
router.get("/received", protect, async (req, res) => {
  try {
    if (req.user.role !== "Creator") {
      return res.status(403).json({ success: false, message: "Only creators can view received donations" });
    }

    // Find campaigns created by this user
    const campaigns = await Campaign.find({ creator: req.user.id }).select("_id title");

    const donations = await Donation.find({ campaign: { $in: campaigns.map(c => c._id) } })
      .populate("donor", "name email")
      .populate("campaign", "title category")
      .sort({ donatedAt: -1 });

    res.json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ✅ Get donation details by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donor", "name email")
      .populate("campaign", "title category");

    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });

    // Donor can only view their own donation, Creator can only view if it belongs to their campaign
    if (req.user.role === "Donor" && donation.donor._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (req.user.role === "Creator" && donation.campaign.creator?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ✅ (Optional) Request refund (Donor only)
router.post("/:id/refund", protect, async (req, res) => {
  try {
    if (req.user.role !== "Donor") {
      return res.status(403).json({ success: false, message: "Only donors can request refunds" });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });

    if (donation.donor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not your donation" });
    }

    if (donation.paymentStatus !== "Completed") {
      return res.status(400).json({ success: false, message: "Refund not possible for this donation" });
    }

    // In real-world: integrate with payment gateway refund API
    donation.paymentStatus = "Refunded";
    await donation.save();

    // Update campaign raised amount
    const campaign = await Campaign.findById(donation.campaign);
    if (campaign) {
      campaign.raisedAmount -= donation.amount;
      campaign.donors = campaign.donors.filter(d => d.donor.toString() !== donation.donor.toString());
      await campaign.save();
    }

    res.json({ success: true, message: "Refund processed", donation });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
