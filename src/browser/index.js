import $ from 'jquery';
import {fetchPlainResource, fetchEncryptedResourceAsUint8Array as fetchEncryptedResource} from '../utils/resource_fetcher';
import deObfuscateEmbeddedFont from '../utils/encryption_document_parser';
import utils from '../utils/utils';
import '../../views/login.png';
import bootstrap from "bootstrap";

$(function() {
    var token = localStorage.getItem('token');
    var user = localStorage.getItem('username');
    if (token && user) {
        $('span#loginOrOutTxt').text('Log out, ' + user);
        $('span#login').addClass('logout').removeClass('login');
    } else {
        $('span#loginOrOutTxt').text('Log in');
        $('span#login').addClass('login').removeClass('logout');
    }
    var currentFontPath, currentFileBlob;
    var label = $('label#generateProgress')[0];
    var dlLabel = $('label#currentFileName')[0];
    var getAllLabel = $('label#allFileNames')[0];
    var generateError = $('span#generateError')[0];
    var toggleProdDCC3 = $('input#dccToggle').prop('checked') ? 'prod' : 'qa';

    $('input#dccToggle').on("change", function () {
        toggleProdDCC3 = $('input#dccToggle').prop('checked') ? 'prod' : 'qa';
    })
    // ADD LISTENERS

    $(".instruction-toggle").on("click touchend", function () {
        $(".instructions").toggle();
        if ($(this).text() == "hide"){
            $(this).text("show");
        }else{
            $(this).text("hide");
        }
    })

    $('button.generate').on('click touchend', function() {
        // clean up
        $("#txtFontpath").removeClass('is-invalid');
        $("#txtIsbn").removeClass('is-invalid');
        label.innerText = '';

        var { isbn, fontPath, bookId} = getInputData();
        if (!isbn || !fontPath) {
            generateError.innerText = 'Please input ISBN and font path.';
            if (!isbn) {
                $("#txtIsbn").addClass('is-invalid');
            }
            if (!fontPath) {
                $("#txtFontpath").addClass('is-invalid');
            }
            return;
        }

        // start generate
        label.innerText = 'Generating...';
        generateError.innerText = '';
        
        updateBookURL(isbn, toggleProdDCC3);
        fetchFontAndDeobfuscate(fontPath, bookId).then((deBlob)=>{
            currentFileBlob = deBlob;
            currentFontPath = fontPath;
            // update labels
            label.innerText = fontPath + '  Done!';
            dlLabel.innerText = fontPath + ' is ready to download!';
        }).catch((err)=>{
            label.innerText = '';
            var isAuthError = authErrorHandler(err);
            if (!isAuthError) {
                if (err.response && err.response.status == 500) {
                    generateError.innerText = 'Fail to fetch files. Please input valid ISBN and font path.';
                } else if (err.message.indexOf('Deobfuscation') > -1) {
                    generateError.innerText = 'Fail to deobfuscate the font file. Please input valid ISBN and font path.';
                } else {
                    generateError.innerText = 'Error. Please input valid ISBN and font path.';
                }
            }
        })
    });
    
    $('button.download').on('click touchend', function() {
        if (!currentFontPath) {
            dlLabel.innerText = 'Nothing to download. Please generate frist!';
            return;
        }
        var fileName = currentFontPath.split('/');
        fileName = fileName[fileName.length-1];
        download(currentFileBlob,fileName);
    });

    $('button.getAll').on('click touchend', function() {
        // clean up
        $('span#getAllIsbnErrorMsg').hide();
        $("#txtGetallBookId").removeClass('is-invalid');
        $('span#getAllError')[0].innerText = '';
        getAllLabel.innerText = '';
        var { getAllIsbn } = getInputData();
        if (!getAllIsbn) {
            $("#txtGetallBookId").addClass('is-invalid');
            $('span#getAllIsbnErrorMsg').show();
            return;
        }
        // start get all
        updateBookURL(getAllIsbn, toggleProdDCC3);
        getAll().catch((err)=>{
            var isAuthError = authErrorHandler(err);
            if (!isAuthError) {
                if (err.response && err.response.status == 500) {
                    $('span#getAllError')[0].innerText = 'Fail to fetch files. Please input valid ISBN.';
                } else if (err.message.indexOf('Deobfuscation') > -1) {
                    $('span#getAllError')[0].innerText = 'Fail to deobfuscate the font file. Please input valid ISBN.';
                } else {
                    $('span#getAllError')[0].innerText = 'Error. Please input valid ISBN.';
                }
            }
        })
    });

    $.get("info.json").done(function (data) {
        $(".version").text(data.version);
    })

    $('span.login,button#goToLogin').on('click', function() {
        window.location.href = '/login.html';
    })

    $('span.logout').on('click', function() {
        window.localStorage.clear();
        $('span#loginOrOutTxt').text('Log in');
        $('span#login').addClass('login').removeClass('logout');
        location.reload();
    })

    $('input#dccToggle').on("change", function () {
        toggleProdDCC3 = $('input#dccToggle').prop('checked') ? 'prod' : 'qa';
    })

    // INTERNAL FUNCTIONS

    var getInputData = function () {
        var bookIdUserInput = $("#txtBookId").val().trim();
        var isbnFromUserInput = $("#txtIsbn").val().trim();
        var fontPathFromUserInput = $("#txtFontpath").val().trim();
        var getallBookIdUserInput = $("#txtGetallBookId").val().trim();
        return {
            fontPath: fontPathFromUserInput,
            bookId: bookIdUserInput,
            isbn: isbnFromUserInput,
            getAllIsbn: getallBookIdUserInput,
        }
    }

    var updateBookURL = function (isbn, dcc) {
        utils.setBookURL(isbn, dcc);
    }

    async function fetchFontAndDeobfuscate (fontPath, bookId){
        if (!bookId) {
            bookId = await getBookIdFromContentfile().catch((err) => {
                throw err;
            });
        }
        var rawData = await fetchEncryptedResource(fontPath).catch((err) => {
                throw err;
            });
       
        try {
            let deobfuscatedData = deObfuscateEmbeddedFont(rawData, bookId);
            return deobfuscatedData;
        } catch (error) {
            throw new Error('DeobfuscationError');
        }
    }

    var getBookIdFromContentfile = function () {
        return fetchPlainResource('META-INF/container.xml')
            .then((res)=>{
                var containerDom = new DOMParser().parseFromString(res, 'text/xml');
                var rootfile = containerDom.getElementsByTagNameNS('*', 'rootfile')[0].attributes['full-path'].value;
                return rootfile;
            }).then((rootfile)=>{
                return fetchPlainResource(rootfile)
            }).then((res)=>{
                var containerDom = new DOMParser().parseFromString(res, 'text/xml');
                var identifier = containerDom.getElementsByTagNameNS('*', 'identifier')[0].textContent;
                return identifier;
            }).catch((err)=>{
                throw err;
            })
    }

    var download = function (blob, filename) {    
        var a = document.createElement("a"),
            url = URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    var getAll = async function () {
        try {
            const bookID = await getBookIdFromContentfile();
            let encryptionFileRaw = await fetchPlainResource('META-INF/encryption.xml');
            let containerDom = new DOMParser().parseFromString(encryptionFileRaw, 'text/xml');
            let fontPathsArray = parse(containerDom);
            for(let pathEle of fontPathsArray) {
                const deobfuscatedData = await fetchFontAndDeobfuscate(pathEle, bookID);
                var fileName = pathEle.split('/');
                fileName = fileName[fileName.length-1];
                download(deobfuscatedData,fileName);
                getAllLabel.innerText += fileName + '\n';
            }
        } catch (err) {
            throw err;
        }
    }

    var parse = function(encryptionDom) {
        var encryptedDataElems = encryptionDom.getElementsByTagNameNS('*', 'EncryptedData');
        var fontPathsArray = [];
        Array.prototype.forEach.call(encryptedDataElems, function(element, index, array) {
          var encryptionAlgorithm = element.getElementsByTagNameNS('*', 'EncryptionMethod')[0].getAttribute('Algorithm');
          var cipherReferenceURI = element.getElementsByTagNameNS('*', 'CipherReference')[0].getAttribute('URI');
          if (encryptionAlgorithm.indexOf('embedding') !== -1) {
            fontPathsArray.push(cipherReferenceURI);
          }
        })
        return fontPathsArray;
    }

    var authErrorHandler = function (err) {
        // token expired error
        if (err && err.response && err.response.status == 403
            && err.response.statusText.indexOf('TokenExpired') > -1) {
                openErrorModal('Sorry, your token has expired. Please log in again.');
                return true;
        }
        if (err && err.response && err.response.status == 401
            && err.response.statusText.indexOf('Empty') > -1) {
                openErrorModal('Authorization token is empty. Please log in first.');
                return true;
        }
        return false;
    }
    
    var openErrorModal = function (body, title) {
        var title = title || 'Authorization Error';
        var body = body || 'There was a problem getting the auth token. Please log in again.'
        $('#errorModal .modal-title').text(title);
        $('#errorModal .modal-body').text(body);
        $('#errorModal').modal();
    }

})