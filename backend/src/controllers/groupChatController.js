import GroupChat from '../models/GroupChat.js';
import Job from '../models/Job.js';

export const createGroup = async (req, res) => {
  try {
    const { name, jobId, participants } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.organizerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only organizer can create group' });
    }

    const group = await GroupChat.create({
      name,
      jobId,
      participants: [req.userId, ...participants],
      createdBy: req.userId,
      messages: [{
        senderId: req.userId,
        text: `Welcome to ${name}! This group was created for job: ${job.title}`,
        type: 'system'
      }]
    });

    await group.populate('participants', 'name email profilePhoto');
    await group.populate('jobId', 'title');

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
      .populate('jobId', 'title status')
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
      .populate('jobId', 'title status')
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
    const group = await GroupChat.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.participants.includes(req.userId)) {
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

    const io = req.app.get('io');
    io.to(`group_${group._id}`).emit('group-message', {
      groupId: group._id,
      message: group.messages[group.messages.length - 1]
    });

    res.json({ message: 'Message sent', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { userIds } = req.body;
    const group = await GroupChat.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only group creator can add members' });
    }

    const newMembers = userIds.filter(id => !group.participants.includes(id));
    group.participants.push(...newMembers);
    await group.save();

    res.json({ message: 'Members added', group });
  } catch (error) {
    res.status(500).json({ message: 'Error adding members', error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const group = await GroupChat.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only group creator can remove members' });
    }

    group.participants = group.participants.filter(p => p.toString() !== userId);
    await group.save();

    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing member', error: error.message });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const group = await GroupChat.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.participants = group.participants.filter(p => p.toString() !== req.userId.toString());
    await group.save();

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving group', error: error.message });
  }
};
