import AuditLog from '../models/AuditLog.js';

export const logAudit = async (action, performedBy, targetId = null, targetModel = null, details = {}, ipAddress = null) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetId,
      targetModel,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};