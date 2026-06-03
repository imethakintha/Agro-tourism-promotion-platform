import Promotion from '../models/Promotion.js';

export const createPromotion = async (req, res, next) => {
  try {
    const { code, type, value, validFrom, validTo, usageLimit, minPurchaseAmount } = req.body;

    const exists = await Promotion.findOne({ code: code.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Promotion code already exists' });

    const promotion = await Promotion.create({
      code: code.toUpperCase(),
      type,
      value,
      validFrom,
      validTo,
      usageLimit,
      minPurchaseAmount,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: promotion });
  } catch (error) {
    next(error);
  }
};

export const validatePromotion = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const now = new Date();

    const promo = await Promotion.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now }
    });

    if (!promo) {
      return res.status(400).json({ success: false, message: 'Invalid or expired promotion code' });
    }

    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ success: false, message: 'Promotion usage limit reached' });
    }

    if (amount && amount < promo.minPurchaseAmount) {
      return res.status(400).json({ success: false, message: `Minimum purchase of LKR ${promo.minPurchaseAmount} required` });
    }

    let discountAmount = 0;
    if (promo.type === 'Percentage') {
        discountAmount = (amount * promo.value) / 100;
    } else {
        discountAmount = promo.value;
    }

    // Ensure discount doesn't exceed total
    if (discountAmount > amount) discountAmount = amount;

    res.status(200).json({
      success: true,
      data: {
        code: promo.code,
        discountAmount,
        type: promo.type,
        value: promo.value,
        promotionId: promo._id
      }
    });

  } catch (error) {
    next(error);
  }
};