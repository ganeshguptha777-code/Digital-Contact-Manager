const request = require('supertest');
const app = require('../app');
const Contact = require('../models/Contact');

describe('CSV Import & Export API', () => {
  let tokenUserA;
  let tokenUserB;

  beforeEach(async () => {
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'csv_a@example.com',
      password: 'password123'
    });
    tokenUserA = resA.body.token;

    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'csv_b@example.com',
      password: 'password123'
    });
    tokenUserB = resB.body.token;
  });

  describe('GET /api/csv/template', () => {
    it('should return a downloadable CSV template with standard headers', async () => {
      const res = await request(app).get('/api/csv/template');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.headers['content-disposition']).toMatch(/attachment; filename=/);
      expect(res.text).toContain('firstName,lastName,email,phone,company,jobTitle,address,category,notes,isFavorite');
    });
  });

  describe('GET /api/csv/export', () => {
    beforeEach(async () => {
      // User A contacts with one having a formula injection attempt
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          firstName: '=cmd|’ /C calc’!A0', // Potential formula injection
          lastName: 'Malicious',
          email: 'safe@example.com',
          company: '+AcmeCorp' // Also starts with +
        });

      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          firstName: 'Norman',
          lastName: 'Osborn',
          email: 'norman@oscorp.com'
        });

      // User B contact
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({
          firstName: 'UserBSecret',
          lastName: 'Person',
          email: 'secret@userb.com'
        });
    });

    it('should sanitize CSV formula injection and only export User A contacts', async () => {
      const res = await request(app)
        .get('/api/csv/export')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);

      // Check formula injection sanitization: dangerous prefixes should be prefixed with single quote
      expect(res.text).toContain("'=cmd|");
      expect(res.text).toContain("'+AcmeCorp");

      // Verify User B contacts are never leaked
      expect(res.text).not.toContain('UserBSecret');
      expect(res.text).not.toContain('secret@userb.com');
      expect(res.text).toContain('Norman');
    });
  });

  describe('POST /api/csv/import', () => {
    it('should import valid CSV contacts and report summary', async () => {
      const csvData = [
        'firstName,lastName,email,phone,company,jobTitle,category,isFavorite',
        'Bruce,Wayne,bruce@wayne.com,+1-555-0001,Wayne Enterprises,CEO,Work,true',
        'Clark,Kent,clark@dailyplanet.com,+1-555-0002,Daily Planet,Reporter,Personal,false'
      ].join('\r\n');

      const res = await request(app)
        .post('/api/csv/import')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .attach('file', Buffer.from(csvData), 'contacts.csv');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.summary.imported).toBe(2);
      expect(res.body.summary.failed).toBe(0);

      // Verify in DB for User A
      const contacts = await Contact.find({ user: (await Contact.findOne({ email: 'bruce@wayne.com' })).user });
      expect(contacts.length).toBe(2);
    });

    it('should report failed rows with invalid email or missing firstName without failing the whole batch', async () => {
      const csvData = [
        'firstName,lastName,email,phone',
        'ValidPerson,One,valid@test.com,+1-555-1111',
        ',MissingName,noname@test.com,+1-555-2222', // Missing firstName
        'BadEmailPerson,Three,invalid-email-string,+1-555-3333' // Invalid email
      ].join('\r\n');

      const res = await request(app)
        .post('/api/csv/import')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .attach('file', Buffer.from(csvData), 'contacts.csv');

      expect(res.status).toBe(200);
      expect(res.body.summary.imported).toBe(1);
      expect(res.body.summary.failed).toBe(2);
      expect(res.body.summary.details.some(d => d.status === 'FAILED' && d.reason.includes('Missing first name'))).toBe(true);
      expect(res.body.summary.details.some(d => d.status === 'FAILED' && d.reason.includes('Invalid email format'))).toBe(true);
    });

    it('should handle duplicate contacts properly when duplicateStrategy is skip', async () => {
      // First insert Bruce Wayne
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ firstName: 'Bruce', lastName: 'Wayne', email: 'bruce@wayne.com' });

      const csvData = [
        'firstName,lastName,email',
        'Bruce,Wayne,bruce@wayne.com',
        'Diana,Prince,diana@themyscira.gov'
      ].join('\r\n');

      const res = await request(app)
        .post('/api/csv/import')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .field('duplicateStrategy', 'skip')
        .attach('file', Buffer.from(csvData), 'contacts.csv');

      expect(res.status).toBe(200);
      expect(res.body.summary.imported).toBe(1);
      expect(res.body.summary.skipped).toBe(1);
    });
  });
});
