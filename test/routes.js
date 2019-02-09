const chai = require('chai');
const chaiHttp = require('chai-http');
// const app = require('../config/express');
chai.use(chaiHttp);
describe("GET '/'", () => {
    it("Deve retornar a página inicial do site.", () => {
        chai.request('http://localhost:8000')
        .get('/')
        .end((err,res) => {
            // console.log(res);
            chai.expect(res).to.have.status(200);
        });
    })
});