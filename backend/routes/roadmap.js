const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const geminiCache = require('../services/geminiCache');
const mongoose = require('mongoose');

// GET or CREATE Roadmap for User's Career with Authorization Check
router.get('/:careerId', authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { careerId } = req.params;

        // 1. Get user to check authorization
        const user = await User.findById(req.userId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. AUTHORIZATION: Check if user has selected this career
        if (!user.selectedCareer || user.selectedCareer.careerId !== careerId) {
            await session.abortTransaction();
            return res.status(403).json({
                message: 'Access denied. Complete career assessment first or select this career.',
                requiresAssessment: !user.selectedCareer,
            });
        }

        // 3. Try to find existing roadmap in database
        let roadmap = await Roadmap.findOne({ careerId }).session(session);

        if (roadmap) {
            console.log(`✅ Roadmap found in DB for: ${careerId}`);

            // Update user's progress roadmapId if not set
            if (!user.progress || !user.progress.roadmapId) {
                if (!user.progress) {
                    user.progress = { completedTopics: [], totalHours: 0 };
                }
                user.progress.roadmapId = roadmap.roadmapId;
                await user.save({ session });
            }

            await session.commitTransaction();
            return res.json(roadmap);
        }

        // 4. Roadmap doesn't exist - generate with Gemini (with caching)
        console.log(`⚠️ Roadmap NOT in DB. Generating for: ${careerId}`);

        const roadmapData = await geminiCache.generateRoadmap(
            careerId,
            user.selectedCareer.domain,
            user.selectedCareer.careerName
        );

        // 5. Save to database for future users with same career
        roadmap = new Roadmap({
            ...roadmapData,
            generatedAt: new Date(),
            lastUpdated: new Date(),
        });

        await roadmap.save({ session });

        // 6. Update user's progress
        if (!user.progress) {
            user.progress = { completedTopics: [], totalHours: 0 };
        }
        user.progress.roadmapId = roadmap.roadmapId;
        await user.save({ session });

        await session.commitTransaction();

        res.json(roadmap);
    } catch (error) {
        await session.abortTransaction();
        console.error('Get roadmap error:', error);
        res.status(500).json({
            message: 'Failed to load roadmap',
            error: error.message,
        });
    } finally {
        session.endSession();
    }
});

module.exports = router;
