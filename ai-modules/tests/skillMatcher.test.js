const { cosineSimilarity, rankSkillGaps } = require('../src/services/skillMatcher');

describe('Skill Matcher (Cosine Similarity & Gap Ranking)', () => {
    describe('cosineSimilarity', () => {
        it('should return 1 for identical vectors', () => {
            const vec1 = [1, 2, 3];
            const vec2 = [1, 2, 3];
            expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(1);
        });

        it('should return 0 for orthogonal vectors', () => {
            const vec1 = [1, 0];
            const vec2 = [0, 1];
            expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(0);
        });
        
        it('should calculate correctly for arbitrary vectors', () => {
            const vec1 = [2, 1, 0, 2];
            const vec2 = [1, 2, 0, 1];
            // dot product = 2*1 + 1*2 + 0*0 + 2*1 = 2 + 2 + 0 + 2 = 6
            // norm1 = sqrt(4 + 1 + 0 + 4) = sqrt(9) = 3
            // norm2 = sqrt(1 + 4 + 0 + 1) = sqrt(6) = 2.449
            // cos = 6 / (3 * 2.449) = 6 / 7.348 = 0.8165
            expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(0.8165, 4);
        });
    });

    describe('rankSkillGaps', () => {
        it('should correctly calculate and rank gaps based on similarity and weight', () => {
            // Mock data representing embeddings for 3 skills
            
            // Skill A: Exact match -> Similarity = 1, Gap = 0
            const rsA = { skillName: 'Skill A', requiredWeight: 2, vector: [1, 1, 1] };
            const csA = { skillName: 'Skill A', vector: [1, 1, 1] };
            
            // Skill B: Orthogonal -> Similarity = 0, Gap = 1. Weight = 3. Priority = 3 * 1 = 3
            const rsB = { skillName: 'Skill B', requiredWeight: 3, vector: [1, 0, 0] };
            const csB = { skillName: 'Skill B', vector: [0, 1, 0] };
            
            // Skill C: Missing current skill entirely -> Similarity = 0, Gap = 1. Weight = 1. Priority = 1 * 1 = 1
            const rsC = { skillName: 'Skill C', requiredWeight: 1, vector: [0.5, 0.5, 0.5] };
            
            // Skill D: Partial match -> Similarity = ~0.816. Gap = ~0.184. Weight = 4. Priority = 4 * 0.184 = 0.736
            const rsD = { skillName: 'Skill D', requiredWeight: 4, vector: [2, 1, 0, 2] };
            const csD = { skillName: 'Skill D', vector: [1, 2, 0, 1] };

            const requiredSkills = [rsA, rsB, rsC, rsD];
            const currentSkills = [csA, csB, csD];

            const gaps = rankSkillGaps(currentSkills, requiredSkills);

            // Skill A should not be in the output (gap < 0.01)
            expect(gaps.length).toBe(3);

            // Highest priority should be Skill B (gap=1, weight=3 -> priority=3)
            expect(gaps[0].skillName).toBe('Skill B');
            expect(gaps[0].priority).toBeCloseTo(3);

            // Second priority should be Skill C (gap=1, weight=1 -> priority=1)
            expect(gaps[1].skillName).toBe('Skill C');
            expect(gaps[1].priority).toBeCloseTo(1);

            // Third priority should be Skill D (gap=0.1835, weight=4 -> priority=0.734)
            expect(gaps[2].skillName).toBe('Skill D');
            expect(gaps[2].priority).toBeCloseTo(0.734, 1);
        });
    });
});
