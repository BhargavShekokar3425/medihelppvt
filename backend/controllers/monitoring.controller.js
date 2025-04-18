const healthcheckService = require('../services/healthcheck.service');

// Controller for system monitoring and health checks
const monitoringController = {
  // Get system health status
  getHealthStatus: async (req, res, next) => {
    try {
      // Simplified health check for public endpoint
      if (!req.user || req.user.role !== 'admin') {
        return res.status(200).json({
          status: 'ok',
          timestamp: new Date().toISOString()
        });
      }
      
      // Detailed health check for admins
      const health = await healthcheckService.runHealthCheck();
      
      res.status(200).json(health);
    } catch (error) {
      next(error);
    }
  },
  
  // Repair database issues (admin only)
  repairDatabase: async (req, res, next) => {
    try {
      // Only allow admins
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
      }
      
      const repairs = await healthcheckService.repairDatabase();
      
      res.status(200).json({
        success: true,
        message: 'Database repair completed',
        repairs
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get system metrics (admin only)
  getSystemMetrics: async (req, res, next) => {
    try {
      // Only allow admins
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
      }
      
      // In a real app, this would fetch actual metrics
      const metrics = {
        activeUsers: 123,
        requestsPerMinute: 45,
        cpuUsage: 25.5,
        memoryUsage: 40.2,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(metrics);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = monitoringController;
