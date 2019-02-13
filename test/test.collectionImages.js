const imageDB = require('../database/collectionImages');
const chai = require('chai');
describe("Collection de Images", () =>{
    describe("imageCollection.find()", () => {
        it("Deve retornar uma lista de imagens numa estrutura certa.", (done) => {
            let images = imageDB.list();
            images.then((images) => {
                chai.expect(images).to.be.an('array');
                chai.expect(images[0]).to.have.keys(["_id",'fileName', 'originalName']);
                done();
            }).catch((erro) => {
                if (erro) done(erro);
            });
        });
    })
})