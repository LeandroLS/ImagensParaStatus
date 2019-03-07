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
function calcNumberOfPages(qtdImages){
    let imagesPerPage = 2;
    return Math.ceil(qtdImages / imagesPerPage);
}
describe('mainController test suite', () => {
    it('Deve obter um nome de categoria semantico com a categoria informada', async () => {
        let category = getImagesCategoryHeader('Teste');
        chai.expect(category).to.be.equal('Imagens da categoria Teste');
    });

    it('Deve retornar um número inteiro. Se for número flutuante deve retornar o valor arrendodado pra cima', () => {
        let result = calcNumberOfPages(7);
        chai.expect(result).to.be.equal(4);
    })
});