const imageDB = require('../database/collectionImages');
const chai = require('chai');
let query =  { 'fileName' : 'imgteste.jpeg', 'originalName' : 'imgteste.jpeg', 'enabled': false };
describe('Collection de Images', () =>{
    describe('imageCollection.remove(fileName:value)', () => {
        it('Removendo imagem.', (done) => {
            let images = imageDB.remove(query);
            images.then((images) => {
                chai.expect(images.result).to.be.an('object');
                chai.expect(images.result).to.have.property('n');
                done();
            }).catch((erro) => {
                if (erro) done(erro);
            });
        });
    });
    describe('imageCollection.insert(fileName:value)', () => {
        it('Inserindo imagem.', (done) => {
            let images = imageDB.insert(query);
            images.then((images) => {
                chai.expect(images).to.be.an('object');
                chai.expect(images).to.have.property('insertedCount');
                chai.expect(images).to.have.property('insertedId');
                done();
            }).catch((erro) => {
                if (erro) done(erro);
            });
        });
    });
    describe('imageCollection.list({})', () => {
        it('Deve retornar uma lista de imagens numa estrutura certa.', (done) => {
            let images = imageDB.list();
            images.then((images) => {
                chai.expect(images).to.be.an('array');
                chai.expect(images[0]).to.have.keys(['_id','enabled','fileName', 'originalName']);
                done();
            }).catch((erro) => {
                if (erro) done(erro);
            });
        });
    });
    describe('imageCollection.list({fileName:value})', () => {
        it('Deve retornar uma uma imagem com o valor certo.', (done) => {
            let images = imageDB.list(query);
            images.then((images) => {
                chai.expect(images).to.be.an('array');
                chai.expect(images[0]).to.have.keys(['_id','fileName', 'originalName', 'enabled']);
                chai.expect(images[0].fileName).to.be.equal('imgteste.jpeg');
                done();
            }).catch((erro) => {
                if (erro) done(erro);
            });
        });
    });
});