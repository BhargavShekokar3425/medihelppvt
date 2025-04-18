const emergencyService = require('../services/emergency.service');

// Controller for emergency operations
const emergencyController = {
  // Create a new emergency request
  createEmergencyRequest: async (req, res, next) => {
    try {
      // Add authenticated user's ID to request data
      const requestData = {
        ...req.body,
        userId: req.user.id
      };
      
      const emergency = await emergencyService.createEmergencyRequest(requestData);
      
      res.status(201).json({
        success: true,
        message: 'Emergency request created',
        data: emergency
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get an emergency request by ID
  getEmergencyRequest: async (req, res, next) => {
    try {
      const requestId = req.params.id;
      
      // Get the emergency request
      const emergency = await emergencyService.getEmergencyRequest(requestId);
      
      if (!emergency) {
        return res.status(404).json({
          success: false,
          message: 'Emergency request not found'
        });
      }
      
      // Only allow access to the user who created it or responders
      const isResponder = emergency.responders?.some(r => r.responder === req.user.id);
      const isCreator = emergency.userId === req.user.id;
      const isDoctor = req.user.role === 'doctor';
      
      if (!isCreator && !isResponder && !isDoctor) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this emergency request'
        });
      }
      
      res.status(200).json({
        success: true,
        data: emergency
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Update emergency request status
  updateEmergencyRequestStatus: async (req, res, next) => {
    try {
      const requestId = req.params.id;
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ['acknowledged', 'dispatched', 'resolved', 'cancelled'];
      
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
      
      // Update the status
      await emergencyService.updateEmergencyRequestStatus(requestId, status, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Emergency request status updated'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = emergencyController;
