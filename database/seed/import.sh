mongoimport --host mongodb --db ImagensParaStatus --collection Categories --type json --file categories.json;
mongoimport --host mongodb --db ImagensParaStatus --collection Images --type json --file images.json;
mongoimport --host mongodb --db ImagensParaStatus --collection Phrases --type json --file phrases.json