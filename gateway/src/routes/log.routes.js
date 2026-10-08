const express = require('express');
const router = express.Router();
const RequestLog = require('../models/RequestLog');

// Get paginated logs with optional filters
router.get('/', async (req, res) => {
  try {
    const { projectId, method, statusCode, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (projectId) query.projectId = projectId;
    if (method) query.method = method;
    if (statusCode) query.statusCode = parseInt(statusCode);
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const logs = await RequestLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await RequestLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        logs,
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
