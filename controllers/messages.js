let messageModel = require('../schemas/messages');
const mongoose = require('mongoose');

module.exports = {
  getMessagesBetweenUsers: async function(currentUserId, targetUserId) {
    return await messageModel.find({
      $or: [
        { from: currentUserId, to: targetUserId },
        { from: targetUserId, to: currentUserId }
      ]
    }).sort({ createdAt: 1 }).populate('from', 'username email').populate('to', 'username email');
  },
  
  createMessage: async function(fromId, toId, type, text) {
    let newMessage = new messageModel({
      from: fromId,
      to: toId,
      messageContent: { type, text }
    });
    return await newMessage.save();
  },
  
  getLatestMessagesForCurrentUser: async function(currentUserId) {
    const objectIdUser = new mongoose.Types.ObjectId(currentUserId);
    const result = await messageModel.aggregate([
      {
        $match: {
          $or: [{ from: objectIdUser }, { to: objectIdUser }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$from", objectIdUser] },
              "$to",
              "$from"
            ]
          },
          latestMessage: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$latestMessage" }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
    
    return await messageModel.populate(result, [
        { path: 'from', select: 'username email' },
        { path: 'to', select: 'username email' }
    ]);
  }
};
