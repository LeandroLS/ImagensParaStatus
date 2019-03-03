const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../config/express');
chai.use(chaiHttp);
let requester = chai.request(app).keepOpen();
describe('Auth test suite', () => {
    it('Deve obter um token', async () => {
        requester.post('/teste/teste').end((err, res) => {
            chai.expect(err).to.be.null;
            chai.expect(res.status).to.be.equal(200);
        })
    });
});