const { getEmbedding } = require('../services/embeddings');
const { rankSkillGaps } = require('../services/skillMatcher');

/**
 * POST /api/skill-gap/:officerId
 * 
 * Computes the skill gap for an officer based on vectors provided in the request body.
 * Expects:
 * {
 *   currentSkills: [{ skillName: string, vector: number[], requiredWeight: number }],
 *   requiredSkills: [{ skillName: string, vector: number[], requiredWeight: number }]
 * }
 * 
 * NOTE: For missing vectors, this controller could call getEmbedding(skillName) 
 * but for this simplified service we expect the caller to provide vectors, or we mock them.
 */
const computeSkillGap = async (req, res) => {
    try {
        const officerId = req.params.officerId;
        const { currentSkills, requiredSkills } = req.body;

        if (!currentSkills || !requiredSkills) {
            return res.status(400).json({ 
                success: false, 
                error: "Both currentSkills and requiredSkills arrays are required" 
            });
        }

        // If vectors are missing from the payload, generate them (simulated behavior)
        for (const skill of [...currentSkills, ...requiredSkills]) {
            if (!skill.vector || skill.vector.length === 0) {
                // Generate embedding on the fly using Gemini
                skill.vector = await getEmbedding(skill.skillName);
            }
        }

        const gaps = rankSkillGaps(currentSkills, requiredSkills);

        res.status(200).json({
            success: true,
            data: {
                officerId,
                gaps
            }
        });
    } catch (error) {
        console.error("Skill Gap Error:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

module.exports = { computeSkillGap };
