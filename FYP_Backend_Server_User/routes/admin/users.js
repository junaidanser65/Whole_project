const express = require("express");
const router = express.Router();
const { pool } = require("../../config/database");
const { verifyAdmin } = require("../../middleware/adminAuth");

// GET all users (admin only)
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        *
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
