import SupportTicket from '../models/SupportTicket.js';
import { v4 as uuidv4 } from 'uuid';

export const createTicket = async (req, res, next) => {
  try {
    const { subject, category, message, priority } = req.body;

    const ticket = await SupportTicket.create({
      userId: req.user.id,
      ticketNumber: `TKT-${Date.now().toString().slice(-6)}`,
      subject,
      category,
      priority,
      messages: [{
        senderId: req.user.id,
        senderRole: 'User',
        message,
        timestamp: new Date()
      }]
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};
export const getUserTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.id }).sort('-updatedAt');
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};


export const getTicketDetails = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId);
    
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    // Access check
    if (req.user.role !== 'Administrator' && ticket.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const replyToTicket = async (req, res, next) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Access check
    const isAdmin = req.user.role === 'Administrator';
    if (!isAdmin && ticket.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    ticket.messages.push({
        senderId: req.user.id,
        senderRole: isAdmin ? 'Administrator' : 'User',
        message,
        timestamp: new Date()
    });

    ticket.status = isAdmin ? 'Replied' : 'Open';
    ticket.lastReplyAt = new Date();
    
    await ticket.save();

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};


export const getAllTickets = async (req, res, next) => {
    try {
        const tickets = await SupportTicket.find({})
            .populate('userId', 'fullName email')
            .sort('-lastReplyAt');
        res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        next(error);
    }
};

export const updateTicketStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.ticketId, 
            { status },
            { new: true }
        );
        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};