const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe("GET /", () => {
    it("Deve retornar a página inicial do site.", (done) => {
        chai.request('http://localhost:8000')
        .get('/')
        .end((err,res) => {
            chai.expect(err).to.be.null;
            chai.expect(res).to.have.status(200);
            done();
        });
    })
});

describe("GET /upload-images", () => {
    it("Deve retornar a página de upload de imagens.", (done) => {
        chai.request('http://localhost:8000')
        .get('/upload-images')
        .end((err,res) => {
            chai.expect(err).to.be.null;
            chai.expect(res).to.have.status(200);
            done();
        });
    })
});


describe("POST /images", () => {
    describe("POST /images sem imagem", () => {
        it("Deve ser redirecionado para /upload-images.", (done) => {
            chai.request('http://localhost:8000')
            .post('/images')
            .end((err,res) => {
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.status(200);
                chai.expect(res).to.redirectTo('http://localhost:8000/upload-images');
                done();
            });
        });
    });
});