const imageDB = require('../database/collectionImages');
const chai = require('chai');
describe('Collection de Images', () =>{
    describe('imageCollection.find({})', () => {
        it('Deve retornar uma lista de imagens numa estrutura certa.', (done) => {
            let images = imageDB.list();
            images.then((images) => {
                chai.expect(images).to.be.an('array');
                chai.expect(images[0]).to.have.keys(['_id','fileName', 'originalName']);
                done();
            }).catch((erro) => {
                if (erro) done(erro);
            });
        });
    });
    describe('imageCollection.find({file:Name:value})', () => {
        it('Deve retornar uma uma imagem com o valor certo.', (done) => {
            let query = { 'fileName' : 'image-13022019-08-37-20.jpeg' };
            let images = imageDB.list(query);
            images.then((images) => {
                chai.expect(images).to.be.an('array');
                chai.expect(images[0]).to.have.keys(['_id','fileName', 'originalName']);
                chai.expect(images[0].fileName).to.be.equal('image-13022019-08-37-20.jpeg');
                done();
            }).catch((erro) => {
                if (erro) done(erro);
            });
        });
    });
});