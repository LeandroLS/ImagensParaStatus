class SEOHelper {
    getImagesCategoryHeader(category = null){
        let header = 'Imagens Para Compartilhar';
        if(category) {
            header = `Imagens com frases de ${category}`;
        }
        return header;
    }
    getTitleDescription(category = null){
        let title = 'Imagens para status pra whatsapp, facebook, pinterest e etc!';
        if(category) {
            title = `Imagens para status de ${category} para whatsapp, facebook, pinterest e etc!`;
        }
        return title;
    }
    facebookOGManipulator(image){
        let OGproperties = {};
        OGproperties.url = 'https://imagensparastatus.com.br/image/' + encodeURIComponent(image.fileName);
        OGproperties.title = 'Imagens Para Status - Diversas imagens para compartilhar nos status do whatsapp, facebook, pinterest e etc!';
        OGproperties.description = image.phrase;
        OGproperties.image = 'https://imagensparastatus.com.br/images/original-images/' + encodeURIComponent(image.fileName);
        return OGproperties;
    }
    geraCanonicalLink(url){
        if(url == '/'){
            return 'https://imagensparastatus.com.br';
        }
        return 'https://imagensparastatus.com.br'+url;
    }
    getMetaDescription($category = null){
        var description = '';
        if($category){
            description = `Imagens Para Status de ${$category}. Imagens com frases para compartilhar no whatsapp, facebook, pinterest.`;
        } else {
            description = 'Imagens Para Status. Aqui você encontra diversas imagens com frases para compartilhar. :D';
        }
        return description;
    }
}

module.exports = new SEOHelper();