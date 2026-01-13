const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
    roadmapId: {
        type: String,
        required: true,
        unique: true,
    },
    careerId: {
        type: String,
        required: true,
    },
    domain: {
        type: String,
        required: true,
        enum: ['technology', 'design', 'business', 'healthcare'],
    },
    targetDuration: Number, // weeks
    difficultyLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
    },
    prerequisiteSkills: [String],
    modules: [{
        moduleId: String,
        title: String,
        description: String,
        estimatedHours: Number,
        prerequisiteModules: [String],
        topics: [{
            topicId: String,
            title: String,
            description: String,
            learningObjectives: [String],
            estimatedHours: Number,
            resources: [{
                type: String,
                platform: String,
                title: String,
                url: String,
                isFree: Boolean,
                duration: String,
                instructor: String,
                rating: Number,
                language: String,
                certification: Boolean,
                thumbnail: String,
                priority: Number,
            }],
            practiceResources: [{
                platform: String,
                difficulty: String,
                problemSet: [String],
            }],
            assessmentQuiz: {
                questions: Number,
                passingScore: Number,
            },
        }],
    }],
    capstoneProjects: [{
        title: String,
        description: String,
        estimatedHours: Number,
        requiredSkills: [String],
        githubTemplate: String,
    }],
    generatedAt: {
        type: Date,
        default: Date.now,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    version: {
        type: Number,
        default: 1,
    },
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
