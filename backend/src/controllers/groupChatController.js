import GroupChat from '../models/GroupChat.js';
import Job from '../models/Job.js';

export const createGroup = async (req, res) => {
  try {
    const { name, eventId, participants } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: 'At least one participant is required' });
    }

    const Event = (await import('../models/Event.js')).default;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only organizer can create group' });
    }

    const group = await GroupChat.create({
      name: name.trim(),
      eventId,
      participants: [req.userId, ...participants],
      createdBy: req.userId,
      messages: [{
        senderId: req.userId,
        text: `Welcome to ${name.trim()}! This group was created for event: ${event.title}`,
        type: 'system'
      }]
    });

    await group.populate('participants', 'name email profilePhoto');
    await group.populate('eventId', 'title');

    res.status(201).json({ group });
  } catch (error) {
    res.status(500).json({ message: 'Error creating group', error: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await GroupChat.find({ 
      participants: req.userId,
      isActive: true
    })
      .populate('participants', 'name email profilePhoto')
      .populate('eventId', 'title status')
      .populate('createdBy', 'name')
      .sort({ lastMessageAt: -1 });

    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error: error.message });
  }
};

export const getGroup = async (req, res) => {
  try {
    const group = await GroupChat.findById(req.params.id)
      .populate('participants', 'name email profilePhoto')
      .populate('eventId', 'title status')
      .populate('messages.senderId', 'name profilePhoto');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.participants.some(p => p._id.toString() === req.userId.toString())) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    res.json({ group });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group', error: error.message });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { text, type = 'text', fileUrl } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const group = await GroupChat.findById(req.params.id)
      .populate('participants', 'name')
      .populate('eventId', 'title');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.participants.some(p => p._id.toString() === req.userId.toString())) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const message = {
      senderId: req.userId,
      text,
      type,
      fileUrl,
      readBy: [req.userId]
    };

    group.messages.push(message);
    group.lastMessage = text;
    group.lastMessageAt = new Date();
    await group.save();

    // Get sender info
    const User = (await import('../models/User.js')).default;
    const sender = await User.findById(req.userId).select('name');

    // Emit socket event to group
    const io = req.app.get('io');
    io.to(`group_${group._id}`).emit('group-message', {
      groupId: group._id,
      message: group.messages[group.messages.length - 1]
    });

    // Create notifications for other participants
    const { createNotification } = await import('./notificationController.js');
    const otherParticipants = group.participants.filter(
      p => p._id.toString() !== req.userId.toString()
    );

    for (const participant of otherParticipants) {
      await createNotification(participant._id, {
        type: 'message',
        title: `New message in ${group.name}`,
        message: `${sender.name}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
        relatedId: group._id,
        relatedModel: 'GroupChat',
        actionUrl: `/groups/${group._id}`
      });

      // Emit notification to user
      io.to(`user_${participant._id}`).emit('notification', {
        type: 'message',
        message: `New message from ${sender.name}`
      });
    }

    res.json({ message: 'Message sent', data: message });
  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    const group = await GroupChat.findById(req.params.id)
      .populate('eventId', 'title')
      .populate('participants', 'name');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only group creator can add members' });
    }

    const newMembers = userIds.filter(id => !group.participants.some(p => p._id.toString() === id));
    
    if (newMembers.length === 0) {
      return res.status(400).json({ message: 'All users are already members' });
    }

    group.participants.push(...newMembers);
    
    // Add system message
    const User = (await import('../models/User.js')).default;
    const addedUsers = await User.find({ _id: { $in: newMembers } }).select('name');
    const addedNames = addedUsers.map(u => u.name).join(', ');
    
    group.messages.push({
      senderId: req.userId,
      text: `${addedNames} ${addedUsers.length > 1 ? 'were' : 'was'} added to the group`,
      type: 'system'
    });
    
    await group.save();

    // Send notifications to new members
    const { createNotification } = await import('./notificationController.js');
    const io = req.app.get('io');

    for (const userId of newMembers) {
      await createNotification(userId, {
        type: 'group',
        title: 'Added to Group',
        message: `You were added to ${group.name}`,
        relatedId: group._id,
        relatedModel: 'GroupChat',
        actionUrl: `/groups/${group._id}`
      });

      io.to(`user_${userId}`).emit('notification', {
        type: 'group',
        message: `Added to ${group.name}`
      });
    }

    // Emit to group
    io.to(`group_${group._id}`).emit('group-message', {
      groupId: group._id,
      message: group.messages[group.messages.length - 1]
    });

    res.json({ message: 'Members added successfully', group });
  } catch (error) {
    console.error('Error adding members:', error);
    res.status(500).json({ message: 'Error adding members', error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const group = await GroupChat.findById(req.params.id)
      .populate('participants', 'name');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only group creator can remove members' });
    }

    if (userId === group.createdBy.toString()) {
      return res.status(400).json({ message: 'Cannot remove group owner' });
    }

    const removedUser = group.participants.find(p => p._id.toString() === userId);
    
    group.participants = group.participants.filter(p => p._id.toString() !== userId);
    
    // Add system message
    group.messages.push({
      senderId: req.userId,
      text: `${removedUser?.name || 'A member'} was removed from the group`,
      type: 'system'
    });
    
    await group.save();

    // Notify removed user
    const { createNotification } = await import('./notificationController.js');
    await createNotification(userId, {
      type: 'group',
      title: 'Removed from Group',
      message: `You were removed from ${group.name}`,
      relatedId: group._id,
      relatedModel: 'GroupChat',
      actionUrl: '/groups'
    });

    // Emit socket events
    const io = req.app.get('io');
    io.to(`user_${userId}`).emit('notification', {
      type: 'group',
      message: `Removed from ${group.name}`
    });

    io.to(`group_${group._id}`).emit('group-message', {
      groupId: group._id,
      message: group.messages[group.messages.length - 1]
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Error removing member', error: error.message });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const group = await GroupChat.findById(req.params.id)
      .populate('participants', 'name');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() === req.userId.toString()) {
      return res.status(400).json({ message: 'Group owner cannot leave. Transfer ownership first.' });
    }

    const User = (await import('../models/User.js')).default;
    const leavingUser = await User.findById(req.userId).select('name');

    group.participants = group.participants.filter(p => p._id.toString() !== req.userId.toString());
    
    // Add system message
    group.messages.push({
      senderId: req.userId,
      text: `${leavingUser.name} left the group`,
      type: 'system'
    });
    
    await group.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(`group_${group._id}`).emit('group-message', {
      groupId: group._id,
      message: group.messages[group.messages.length - 1]
    });

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ message: 'Error leaving group', error: error.message });
  }
};

export const transferOwnership = async (req, res) => {
  try {
    const { newOwnerId } = req.body;

    if (!newOwnerId) {
      return res.status(400).json({ message: 'New owner ID is required' });
    }

    const group = await GroupChat.findById(req.params.id)
      .populate('participants', 'name');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only group owner can transfer ownership' });
    }

    if (!group.participants.some(p => p._id.toString() === newOwnerId)) {
      return res.status(400).json({ message: 'New owner must be a group member' });
    }

    const User = (await import('../models/User.js')).default;
    const [oldOwner, newOwner] = await Promise.all([
      User.findById(req.userId).select('name'),
      User.findById(newOwnerId).select('name')
    ]);

    group.createdBy = newOwnerId;
    
    // Add system message
    group.messages.push({
      senderId: req.userId,
      text: `${oldOwner.name} transferred group ownership to ${newOwner.name}`,
      type: 'system'
    });
    
    await group.save();

    // Notify new owner
    const { createNotification } = await import('./notificationController.js');
    await createNotification(newOwnerId, {
      type: 'group',
      title: 'Group Ownership Transferred',
      message: `You are now the owner of ${group.name}`,
      relatedId: group._id,
      relatedModel: 'GroupChat',
      actionUrl: `/groups/${group._id}`
    });

    // Emit socket events
    const io = req.app.get('io');
    io.to(`user_${newOwnerId}`).emit('notification', {
      type: 'group',
      message: `You are now owner of ${group.name}`
    });

    io.to(`group_${group._id}`).emit('group-message', {
      groupId: group._id,
      message: group.messages[group.messages.length - 1]
    });

    res.json({ message: 'Ownership transferred successfully', group });
  } catch (error) {
    console.error('Error transferring ownership:', error);
    res.status(500).json({ message: 'Error transferring ownership', error: error.message });
  }
};
