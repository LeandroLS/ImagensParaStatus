const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../config/express');
chai.use(chaiHttp);
let requester = chai.request(app).keepOpen();
function getImagesCategoryHeader(category = null){
    let header = 'Imagens';
    if(category) {
        header = `Imagens da categoria ${category}`;
    }
    return header;
}
describe('mainController test suite', () => {
    it('Deve obter um nome de categoria semantico com a categoria informada', async () => {
        let category = getImagesCategoryHeader('Teste');
        chai.expect(category).to.be.equal('Imagens da categoria Teste');
    });
});