const jimp = require('jimp');

jimp.read('c:\\Users\\Leandro\\Desktop\\EscrevaNaImagem\\public\\images\\test.png', function(err,img) {
    jimp.loadFont(jimp.FONT_SANS_128_WHITE).then((font)=>{
        img.print(font, 50, 50, 'alooooooo');
        img.write('teste2.png');
    });
});
