const request = require('supertest');
const app = require('../app');

describe('Contacts API & Ownership Authorization', () => {
  let tokenUserA;
  let tokenUserB;
  let userAId;
  let userBId;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'usera@example.com',
      password: 'password123'
    });
    tokenUserA = resA.body.token;
    userAId = resA.body.user._id;

    // Register User B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'userb@example.com',
      password: 'password123'
    });
    tokenUserB = resB.body.token;
    userBId = resB.body.user._id;
  });

  describe('POST /api/contacts', () => {
    it('should create contact for authenticated user', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-1111',
          company: 'Acme Corp',
          category: 'Work'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.contact.firstName).toBe('John');
      expect(res.body.contact.user.toString()).toBe(userAId);
    });

    it('should reject contact creation without firstName', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          lastName: 'Doe',
          email: 'john.doe@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/first name is required/i);
    });

    it('should reject contact creation with invalid email format', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          firstName: 'John',
          email: 'not-an-email'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/contacts - Search, Filter, Sort, Pagination', () => {
    beforeEach(async () => {
      // Add contacts for User A
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ firstName: 'Alice', lastName: 'Smith', email: 'alice.s@example.com', company: 'Google', category: 'Work', isFavorite: true });

      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ firstName: 'Bob', lastName: 'Taylor', email: 'bob.t@example.com', company: 'Microsoft', category: 'Personal', isFavorite: false });

      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ firstName: 'Charlie', lastName: 'Brown', email: 'charlie.b@example.com', company: 'Apple', category: 'Work', isFavorite: false });

      // Add contact for User B
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ firstName: 'Secret', lastName: 'Agent', email: 'spy@classified.com', company: 'MI6', category: 'Work' });
    });

    it('should retrieve only User A contacts and not User B contacts', async () => {
      const res = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBe(3);
      const emails = res.body.contacts.map(c => c.email);
      expect(emails).not.toContain('spy@classified.com');
    });

    it('should filter contacts by category', async () => {
      const res = await request(app)
        .get('/api/contacts?category=Personal')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.contacts.length).toBe(1);
      expect(res.body.contacts[0].firstName).toBe('Bob');
    });

    it('should filter contacts by favorites', async () => {
      const res = await request(app)
        .get('/api/contacts?isFavorite=true')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.contacts.length).toBe(1);
      expect(res.body.contacts[0].firstName).toBe('Alice');
    });

    it('should search contacts across names, emails, and company', async () => {
      const res = await request(app)
        .get('/api/contacts?search=Apple')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.contacts.length).toBe(1);
      expect(res.body.contacts[0].firstName).toBe('Charlie');
    });

    it('should sort contacts by name asc/desc', async () => {
      const res = await request(app)
        .get('/api/contacts?sortBy=name&sortOrder=asc')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.contacts[0].firstName).toBe('Alice');
      expect(res.body.contacts[2].firstName).toBe('Charlie');
    });
  });

  describe('Contact Ownership Authorization', () => {
    let contactAId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ firstName: 'Private', lastName: 'Data', email: 'private@usera.com' });
      contactAId = createRes.body.contact._id;
    });

    it('User B CANNOT view User A contact by ID', async () => {
      const res = await request(app)
        .get(`/api/contacts/${contactAId}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('User B CANNOT update User A contact', async () => {
      const res = await request(app)
        .put(`/api/contacts/${contactAId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ firstName: 'Hacked' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('User B CANNOT delete User A contact', async () => {
      const res = await request(app)
        .delete(`/api/contacts/${contactAId}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify still exists for User A
      const verifyRes = await request(app)
        .get(`/api/contacts/${contactAId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);
      expect(verifyRes.status).toBe(200);
    });

    it('User A can successfully update and delete their own contact', async () => {
      const updateRes = await request(app)
        .put(`/api/contacts/${contactAId}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ firstName: 'UpdatedName' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.contact.firstName).toBe('UpdatedName');

      const deleteRes = await request(app)
        .delete(`/api/contacts/${contactAId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(deleteRes.status).toBe(200);
    });
  });
});
