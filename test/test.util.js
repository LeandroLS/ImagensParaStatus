const util = require('../libs/util');
const chai = require('chai');

describe("Util calcPctOverImg()", () => {
    it("Com base nas porcentagens recebidas, deve retornar o valor equivalente dessas porcentagens sobre a imagem", () => {
        let position = util.calcPctOverImg(1000,1000,50,50);
        chai.expect(position).to.be.an('object');
        chai.expect(position.posX).to.be.equal(500);
        chai.expect(position.posY).to.be.equal(500);
    })
});