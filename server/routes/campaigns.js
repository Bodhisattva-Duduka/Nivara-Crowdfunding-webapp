const express = require("express");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const { protect } = require("../middlewares/auth");

const router = express.Router();

// ✅ Create new campaign
router.post("/create", protect, async (req, res) => {
  try {
    if (req.user.role !== "Creator") {
      return res.status(403).json({ success: false, message: "Only creators can create campaigns" });
    }

    const { title, description, category, goalAmount, documents } = req.body;

    const campaign = new Campaign({
      title,
      description,
      category,
      goalAmount,
      documents,
      creator: req.user.id
    });

    await campaign.save();
    res.status(201).json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ✅ Get all campaigns (with optional filters/sorting)
router.get("/all", async (req, res) => {
  try {
    const { category, sort } = req.query;
    let query = { status: "Active" };
    if (category) query.category = category;

    let campaigns = Campaign.find(query).populate("creator", "name email");

    if (sort === "new") {
      campaigns = campaigns.sort({ createdAt: -1 });
    } else if (sort === "urgent") {
      campaigns = campaigns.sort({ goalAmount: 1 });
    }

    campaigns = await campaigns;
    res.json({ success: true, campaigns });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ✅ Get single campaign by ID
router.get("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate("creator", "name email")
      .populate("donors.donor", "name email");

    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ✅ Donate to a campaign
router.post("/:id/donate", protect, async (req, res) => {
  try {
    if (req.user.role !== "Donor") {
      return res.status(403).json({ success: false, message: "Only donors can donate" });
    }

    const { amount } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

    // Create donation record
    const donation = new Donation({
      donor: req.user.id,
      campaign: campaign._id,
      amount,
      paymentStatus: "Completed"
    });
    await donation.save();

    // Update campaign progress
    campaign.raisedAmount += amount;
    campaign.donors.push({ donor: req.user.id, amount });
    await campaign.save();

    res.json({ success: true, campaign, donation });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ✅ Update campaign status (Creator only)
router.put("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "Creator") {
      return res.status(403).json({ success: false, message: "Only creators can update status" });
    }

    const { status } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
