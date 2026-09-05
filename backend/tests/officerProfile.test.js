const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const OfficerProfile = require('../src/models/OfficerProfile');

describe('Officer Competency Profile Fields (Item 2)', () => {
  const dummyUserId = new mongoose.Types.ObjectId();

  test('should validate and save qualifications, experience, and previousTrainings', async () => {
    const profile = new OfficerProfile({
      user: dummyUserId,
      currentSkills: [],
      qualifications: [
        {
          degree: 'M.Sc.',
          field: 'Statistics',
          institution: 'Delhi University',
          year: 2021,
        },
      ],
      experience: [
        {
          organization: 'NSSO (FOD)',
          role: 'Junior Statistical Officer',
          fromYear: 2022,
          toYear: null,
        },
      ],
      previousTrainings: [
        {
          title: 'CAPI Field Survey Training',
          provider: 'MoSPI Training Division',
          completedAt: new Date('2023-05-10'),
          certificateUrl: 'https://mospi.gov.in/certs/12345',
        },
      ],
    });

    await profile.validate();
    assert.equal(profile.qualifications.length, 1);
    assert.equal(profile.qualifications[0].degree, 'M.Sc.');
    assert.equal(profile.experience.length, 1);
    assert.equal(profile.experience[0].toYear, null);
    assert.equal(profile.previousTrainings.length, 1);
    assert.equal(profile.previousTrainings[0].title, 'CAPI Field Survey Training');
  });

  test('should reject qualifications missing degree or experience missing required fields', async () => {
    const invalidQualProfile = new OfficerProfile({
      user: dummyUserId,
      qualifications: [
        {
          field: 'Statistics',
          institution: 'Delhi University',
        },
      ],
    });

    await assert.rejects(async () => {
      await invalidQualProfile.validate();
    }, /Path `degree` is required/);

    const invalidExpProfile = new OfficerProfile({
      user: dummyUserId,
      experience: [
        {
          organization: 'MoSPI',
          // role missing
          fromYear: 2022,
        },
      ],
    });

    await assert.rejects(async () => {
      await invalidExpProfile.validate();
    }, /Path `role` is required/);
  });
});
