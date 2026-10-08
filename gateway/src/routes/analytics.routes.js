const express = require('express');
const router = express.Router();
const RequestLog = require('../models/RequestLog');
const mongoose = require('mongoose');

// Overview aggregations
router.get('/overview', async (req, res) => {
  try {
    const { projectId } = req.query;
    const matchStage = projectId ? { projectId: new mongoose.Types.ObjectId(projectId) } : {};

    const stats = await RequestLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          successfulRequests: {
            $sum: { $cond: [{ $lt: ['$statusCode', 400] }, 1, 0] }
          },
          failedRequests: {
            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] }
          },
          totalLatency: { $sum: '$latency' },
          cacheHits: {
            $sum: { $cond: [{ $eq: ['$cacheStatus', 'HIT'] }, 1, 0] }
          },
          cacheMisses: {
            $sum: { $cond: [{ $eq: ['$cacheStatus', 'MISS'] }, 1, 0] }
          },
          rateLimitBlocks: {
            $sum: { $cond: [{ $eq: ['$rateLimitStatus', 'BLOCKED'] }, 1, 0] }
          },
          authenticationFailures: {
            $sum: { $cond: [{ $eq: ['$authenticationStatus', 'FAILED'] }, 1, 0] }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        success: true,
        data: {
          totalRequests: 0, successfulRequests: 0, failedRequests: 0,
          averageLatency: 0, cacheHits: 0, cacheMisses: 0, cacheHitRate: 0,
          rateLimitBlocks: 0, authenticationFailures: 0
        }
      });
    }

    const s = stats[0];
    const totalCacheable = s.cacheHits + s.cacheMisses;
    const cacheHitRate = totalCacheable > 0 ? ((s.cacheHits / totalCacheable) * 100).toFixed(1) : 0;
    const averageLatency = s.totalRequests > 0 ? Math.round(s.totalLatency / s.totalRequests) : 0;

    res.json({
      success: true,
      data: {
        totalRequests: s.totalRequests,
        successfulRequests: s.successfulRequests,
        failedRequests: s.failedRequests,
        averageLatency,
        cacheHits: s.cacheHits,
        cacheMisses: s.cacheMisses,
        cacheHitRate: parseFloat(cacheHitRate),
        rateLimitBlocks: s.rateLimitBlocks,
        authenticationFailures: s.authenticationFailures
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Traffic over time (e.g. past 24 hours grouped by hour)
router.get('/traffic', async (req, res) => {
  try {
    const { projectId, range = '24h' } = req.query;
    
    const now = new Date();
    let startDate = new Date();
    let groupFormat = '%Y-%m-%d-%H'; // Group by hour

    if (range === '1h') {
      startDate.setHours(now.getHours() - 1);
      groupFormat = '%Y-%m-%d-%H-%M'; // Group by minute
    } else if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
      groupFormat = '%Y-%m-%d'; // Group by day
    } else {
      startDate.setHours(now.getHours() - 24);
    }

    const matchStage = { createdAt: { $gte: startDate } };
    if (projectId) matchStage.projectId = new mongoose.Types.ObjectId(projectId);

    const traffic = await RequestLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          requests: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Format output
    const formatted = traffic.map(t => ({
      time: t._id,
      requests: t.requests
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
