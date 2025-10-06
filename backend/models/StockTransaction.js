const mongoose = require("mongoose");

const stockTransactionSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['add', 'remove', 'set', 'initial'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  previousStock: {
    type: Number,
    required: true,
    min: 0
  },
  newStock: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    default: ""
  },
  notes: {
    type: String,
    default: ""
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  materialSnapshot: {
    name: String,
    category: String,
    location: String,
    unit: String
  },
  transactionDate: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  // Add indexes for better query performance
  indexes: [
    { material: 1, transactionDate: -1 },
    { performedBy: 1, transactionDate: -1 },
    { transactionType: 1, transactionDate: -1 }
  ]
});

// Virtual for calculating the actual change amount
stockTransactionSchema.virtual('changeAmount').get(function() {
  if (this.transactionType === 'set') {
    return this.newStock - this.previousStock;
  } else if (this.transactionType === 'add') {
    return this.quantity;
  } else if (this.transactionType === 'remove') {
    return -this.quantity;
  }
  return 0;
});

// Static method to log a stock transaction
stockTransactionSchema.statics.logTransaction = async function(materialId, transactionType, quantity, previousStock, newStock, userId, reason = "", notes = "") {
  try {
    // Get material info for snapshot
    const Material = mongoose.model('Material');
    const material = await Material.findById(materialId).populate('category', 'name');
    
    if (!material) {
      throw new Error('Material not found');
    }

    const transaction = new this({
      material: materialId,
      transactionType,
      quantity,
      previousStock,
      newStock,
      reason,
      notes,
      performedBy: userId,
      materialSnapshot: {
        name: material.name,
        category: material.category?.name || 'Unknown',
        location: material.location,
        unit: material.unit
      }
    });

    await transaction.save();
    return transaction;
  } catch (error) {
    console.error('Error logging stock transaction:', error);
    throw error;
  }
};

// Static method to get transaction history for a material
stockTransactionSchema.statics.getMaterialHistory = async function(materialId, limit = 50, skip = 0) {
  return this.find({ material: materialId })
    .populate('performedBy', 'name email')
    .sort({ transactionDate: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get user activity
stockTransactionSchema.statics.getUserActivity = async function(userId, limit = 50, skip = 0) {
  return this.find({ performedBy: userId })
    .populate('material', 'name')
    .sort({ transactionDate: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get recent activity across all materials
stockTransactionSchema.statics.getRecentActivity = async function(limit = 100, skip = 0) {
  return this.find({})
    .populate('performedBy', 'name email')
    .populate('material', 'name')
    .sort({ transactionDate: -1 })
    .limit(limit)
    .skip(skip);
};

// Instance method to format transaction for display
stockTransactionSchema.methods.getDisplayInfo = function() {
  const changeAmount = this.changeAmount;
  const changeSymbol = changeAmount > 0 ? '+' : '';
  
  return {
    id: this._id,
    type: this.transactionType,
    material: this.materialSnapshot.name,
    change: `${changeSymbol}${changeAmount}`,
    quantity: this.quantity,
    previousStock: this.previousStock,
    newStock: this.newStock,
    unit: this.materialSnapshot.unit,
    performedBy: this.performedBy?.name || 'Unknown User',
    date: this.transactionDate,
    reason: this.reason,
    notes: this.notes
  };
};

module.exports = mongoose.model("StockTransaction", stockTransactionSchema);