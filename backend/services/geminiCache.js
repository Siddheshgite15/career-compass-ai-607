const { GoogleGenerativeAI } = require('@google/generative-ai');
const Cache = require('../models/Cache');

class GeminiCacheService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('⚠️ Gemini API key not found. AI features will be limited.');
            this.genAI = null;
        } else {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }

    /**
     * Generate roadmap with caching - SAVES TOKENS!
     * Cache roadmaps by careerId to avoid regenerating for every user
     */
    async generateRoadmap(careerId, domain, careerName) {
        const cacheKey = `roadmap_${careerId}_v1`;

        try {
            // 1. Try to get from cache first
            let cached = await Cache.findOne({ cacheKey });

            if (cached) {
                console.log(`✅ Cache HIT for roadmap: ${careerId}`);
                await cached.incrementHit();
                return cached.data;
            }

            console.log(`⚠️ Cache MISS for roadmap: ${careerId}. Calling Gemini...`);

            // 2. Generate using Gemini (costs tokens)
            if (!this.genAI) {
                throw new Error('Gemini API not configured');
            }

            const model = this.genAI.getGenerativeModel({
                model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
            });

            const prompt = `Generate a comprehensive learning roadmap for: ${careerName}
      
Domain: ${domain}
Career ID: ${careerId}

Create a structured learning path with:
- 4-5 modules
- Each module has 5-6 topics
- Each topic has learning objectives and estimated hours
- Include practical projects
- Focus on FREE resources
- Optimize for Indian job market

Return ONLY valid JSON in this format:
{
  "roadmapId": "${careerId}_roadmap",
  "careerId": "${careerId}",
  "domain": "${domain}",
  "targetDuration": 12,
  "modules": [
    {
      "moduleId": "module-1",
      "title": "Module Title",
      "topics": [
        {
          "topicId": "topic-1",
          "title": "Topic Title",
          "estimatedHours": 8,
          "learningObjectives": ["objective 1", "objective 2"]
        }
      ]
    }
  ]
}`;

            const result = await model.generateContent(prompt);
            const response = result.response.text();
            const jsonData = this.extractJSON(response);
            const roadmap = JSON.parse(jsonData);

            // 3. Save to cache (expires in 30 days)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            await Cache.create({
                cacheKey,
                cacheType: 'roadmap',
                data: roadmap,
                metadata: {
                    careerId,
                    domain,
                    version: 1,
                },
                expiresAt,
            });

            console.log(`✅ Roadmap cached for ${careerId}`);
            return roadmap;

        } catch (error) {
            console.error('Roadmap generation error:', error);

            // Return fallback roadmap structure
            return {
                roadmapId: `${careerId}_roadmap`,
                careerId,
                domain,
                targetDuration: 12,
                modules: [],
                error: 'Failed to generate roadmap. Please try again.',
            };
        }
    }

    /**
     * Generate career recommendations (NOT cached - user-specific)
     */
    async recommendCareers(assessmentData) {
        if (!this.genAI) {
            throw new Error('Gemini API not configured');
        }

        const model = this.genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
        });

        const prompt = `Analyze this career assessment and recommend 3-5 careers:

Interests: ${assessmentData.interests.join(', ')}
Skills: ${assessmentData.skills.join(', ')}
Education: ${assessmentData.education}
Goals: ${assessmentData.careerGoals}

Return ONLY valid JSON with career recommendations including fit scores.`;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            const jsonData = this.extractJSON(response);
            return JSON.parse(jsonData);
        } catch (error) {
            console.error('Career recommendation error:', error);
            throw error;
        }
    }

    /**
     * Get topic resources with caching by topic name
     */
    async getTopicResources(topicName, domain) {
        const cacheKey = `resources_${topicName.toLowerCase().replace(/\s+/g, '_')}_${domain}`;

        try {
            // 1. Try cache first
            let cached = await Cache.findOne({ cacheKey });

            if (cached) {
                console.log(`✅ Cache HIT for resources: ${topicName}`);
                await cached.incrementHit();
                return cached.data;
            }

            console.log(`⚠️ Cache MISS for resources: ${topicName}`);

            // 2. Generate using Gemini
            if (!this.genAI) {
                throw new Error('Gemini API not configured');
            }

            const model = this.genAI.getGenerativeModel({
                model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
            });

            const prompt = `Find FREE learning resources for: ${topicName}

Domain: ${domain}

Recommend 3-5 FREE resources:
- YouTube videos (prefer Indian instructors)
- Articles/tutorials
- Practice platforms
- GitHub repos

Return JSON format with resource list.`;

            const result = await model.generateContent(prompt);
            const response = result.response.text();
            const jsonData = this.extractJSON(response);
            const resources = JSON.parse(jsonData);

            // 3. Cache for 7 days
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            await Cache.create({
                cacheKey,
                cacheType: 'topic_resources',
                data: resources,
                metadata: { domain },
                expiresAt,
            });

            return resources;

        } catch (error) {
            console.error('Topic resources error:', error);
            return { resources: [] };
        }
    }

    /**
     * Extract JSON from Gemini response
     */
    extractJSON(text) {
        const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            return jsonMatch[1].trim();
        }

        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) return objectMatch[0];

        return text.trim();
    }

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        const stats = await Cache.aggregate([
            {
                $group: {
                    _id: '$cacheType',
                    count: { $sum: 1 },
                    totalHits: { $sum: '$hitCount' },
                },
            },
        ]);

        return stats;
    }
}

module.exports = new GeminiCacheService();
