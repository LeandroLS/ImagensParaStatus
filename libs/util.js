module.exports = {
    /**
     * Dada determinada porcentagem, calcular a posição da mesma sobra a imagem.
     */
    calcPctOverImg(imgWidth, imgHeight, pctX, pctY){
        let posX = (imgWidth / 100) * pctX;
        let posY = (imgHeight / 100) * pctY;
        let position = { posX : posX, posY : posY};
        return position;
    },
    /**
     * @param {string} string 
     * Troca espaços por traços e deixa tudo em lower case.
     */
    urlFriendlyer(string){
        string = string.replace(/ /g, '-').toLowerCase();
        return string;
    }
    
}