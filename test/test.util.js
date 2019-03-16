const util = require('../libs/util');
const chai = require('chai');

describe("Util test", () => {
    it("Com base nas porcentagens recebidas, deve retornar o valor equivalente dessas porcentagens sobre a imagem", () => {
        let position = util.calcPctOverImg(1000,1000,50,50);
        chai.expect(position).to.be.an('object');
        chai.expect(position.posX).to.be.equal(500);
        chai.expect(position.posY).to.be.equal(500);
    });
    it("Dado uma string com espaço e letras maíusculas, deve retornar uma string concatenada com traços e tudo em mínusculo", () => {
        var string = util.urlFriendlyer('Uma frase bem grande');
        chai.expect(string).to.be.an('string');
        chai.expect(string).to.be.equal('uma-frase-bem-grande');
    });
});