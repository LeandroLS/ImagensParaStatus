module.exports = {
    /**
     * Data determinada porcentagem, calcular a posição da mesma sobra a imagem.
     */
    calcPctOverImg(imgWidth, imgHeight, pctX, pctY){
        let posX = (imgWidth / 100) * pctX;
        let posY = (imgHeight / 100) * pctY;
        let position = { posX : posX, posY : posY};
        return position;
    },
    async checkIfDataExists(phrase, category){
        let categoryResult = categoryDB.list({"category" : category}).then(category => category);
        let phraseResult = phraseDB.list({'phrase' : phrase}).then(phrase => phrase);
        let result = Promise.all([categoryResult, phraseResult]).then(data => {
            let category = data[0];
            let phrase = data[1];
            if(category.length >= 1){
                return {
                    success: false,
                    message: "Categoria já existe."
                }
            } else if (phrase.length >= 1){
                return {
                    success: false,
                    message: "Frase já existe."
                }
            } else {
                return {
                    success: true,
                    message: "Não há esses registros no banco."
                }
            }
        }).catch(err => {
            console.log(err);
        });
        return result;
    }
}