# Baker&Taylor Font De-Obfuscation Tool

### What is this repository for?

This is a font de-obfuscation tool that will help generate decrypted font files. It has two methods: get one certain decrypted font file by path and get all decrypted font files under one book.

### Quick Start

* Set the host and port number inside config.js. Default values are `localhost` and`'8081'`.
* run `npm install` to install dependencies.
* run `npm run start:quick` to do a quick start. Alternatively,
    * run `npm run build` to build.
    * run `npm run info:createfile` to create the version file. Then run `npm run version:display` to check the version.
    * run `npm run start` to start.
* In the browser input http://localhost:8081/dev.html to start.

### Configuration
By default, the server will only listen on localhost:8081.  

You can change these settings in the `config.js` or as environment variables.  Environment variables take precedence over settings in the `config.js`

* `HOST`: set to an IP or domain.  Use 0.0.0.0 to listen to all IPs.
* `PORT`: set the listening port.


### How to use this website

There are two components on this Font De-Obfuscation Tool website: get a certain de-obfuscated font file by path & ISBN and get all de-obfuscated font files by ISBN.

**Get a certain de-obfuscated font file by path**

1. Enter the book ISBN in the ISBN field.
2. Enter the font path. For example, the font file A.ttf is under the folder '9781620140000/OEBPS/font', then the input is '/OEBPS/font/A.ttf'.
3. Optional: Enter the book identifier in the opf file. If the input is empty, the identifier will be fetched automatically.
4. Click Generate to fetch font file
5. When the font is ready, click Download to download the font.

**Get all de-obfuscated font files by ISBN**

1. Enter the book ISBN in the ISBN field.
2. Click Download All to download all decrypted font files under this book.