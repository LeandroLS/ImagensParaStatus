const Jimp = require('jimp');

Jimp.read('c:\\Users\\Leandro\\Desktop\\EscrevaNaImagem\\public\\images\\test.png', function(err,img) {
    Jimp.loadFont(Jimp.FONT_SANS_128_WHITE).then((font)=>{
        img.print(font, 50, 50, 'Hello World!');
        img.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
            img.write('teste2.png');
        });
    });
});
