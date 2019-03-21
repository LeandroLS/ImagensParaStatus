class SEOHelper {
    getImagesCategoryHeader(category = null){
        let header = 'Imagens Para Compartilhar';
        if(category) {
            header = `Imagens relacionadas a ${category}`;
        }
        return header;
    }
    getTitleDescription(category = null){
        let title = 'Imagens Para Status. Diversas imagens para whatsapp, facebook, pinterest :D';
        if(category) {
            title = `Imagens com frases de ${category} para whatsapp, facebook, pinterest e etc! :D`;
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
            description = `Imagens para compartilhar nos status do whatsapp, facebook, pinterest relacionadas a ${$category}`;
        } else {
            description = 'Imagens Para Status. Aqui você encontra diversas imagens para compartilhar. :D';
        }
        return description;
    }
}

module.exports = new SEOHelper();