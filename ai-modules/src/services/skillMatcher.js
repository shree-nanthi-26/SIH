/**
 * Calculate the cosine similarity between two vectors.
 * 
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} - Similarity score between -1 and 1
 */
const cosineSimilarity = (vecA, vecB) => {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Compute a gap score per skill and rank gaps by severity.
 * 
 * Gap score = 1 - cosine_similarity(currentSkillVector, requiredSkillVector)
 * Higher gap score means higher severity (less similarity).
 * 
 * @param {Array<{skillName: string, vector: number[], requiredWeight: number}>} currentSkills 
 * @param {Array<{skillName: string, vector: number[], requiredWeight: number}>} requiredSkills 
 * @returns {Array<{skillName: string, similarity: number, gapScore: number, priority: number}>} - Ranked list of gaps
 */
const rankSkillGaps = (currentSkills, requiredSkills) => {
    const gaps = [];
    
    // Convert current skills to a map for easy lookup by name
    const currentMap = new Map();
    for (const cs of currentSkills) {
        currentMap.set(cs.skillName.toLowerCase(), cs);
    }
    
    for (const rs of requiredSkills) {
        const cs = currentMap.get(rs.skillName.toLowerCase());
        
        // If the officer has no vector for this skill, treat as orthogonal (similarity = 0, gap = 1)
        let similarity = 0;
        let gapScore = 1;
        
        if (cs && cs.vector && cs.vector.length > 0 && rs.vector && rs.vector.length > 0) {
            similarity = cosineSimilarity(cs.vector, rs.vector);
            // Gap is the opposite of similarity. similarity is roughly [0, 1] for positive vectors
            gapScore = 1 - similarity; 
        }
        
        // Calculate priority combining gap and required weight
        // Higher weight and higher gap score = higher priority
        const priority = gapScore * rs.requiredWeight;
        
        // Only include positive gaps
        if (gapScore > 0.01) {
            gaps.push({
                skillName: rs.skillName,
                similarity: Number(similarity.toFixed(4)),
                gapScore: Number(gapScore.toFixed(4)),
                priority: Number(priority.toFixed(4))
            });
        }
    }
    
    // Sort descending by priority
    return gaps.sort((a, b) => b.priority - a.priority);
};

module.exports = { cosineSimilarity, rankSkillGaps };
