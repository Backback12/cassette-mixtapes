"use strict"

/*
 * parseArgs()
 * Reads hashes (#)  or searches (?) in the url
 */
 function parseArgs() {
    var hash = location.hash.length == 0 ? location.search.replace('?', '') : location.hash.replace('#', '');
    var all = hash.split('&');
    var args = {};
    _.each(all, function(keyvalue) {
        var kv = keyvalue.split('=');
        var key = kv[0];
        var val = kv[1];
        args[key] = val;
    });
    return args;
}
/*
 * getSpotify()
 * Makes a GET request from Spotify's API
 */
 function getSpotify(url) {
    return new Promise((resolve, reject) => {
        $.ajax(`https://api.spotify.com/v1${url}`, {
            dataType: 'json',
            headers: {'Authorization': `Bearer ${accessToken}`},
            success: function(response) {
                resolve(response);
            },
            error: function(err) {
                if (err.status === 401) {
                    // Invalid or Expired Token
                    window.location.href = "../?error=invalid_token";
                } else {
                    // Bad Request
                    reject(new Error(`Request failed: ${err.statusText}`));
                }
            }
        });
    });
}




var urlList = [];
var userData = {};

/*
 * loadUserData
 *
 */
function loadUserData() {
    return new Promise((resolve, reject) => {
        getSpotify(`/me/top/tracks?limit=10&time_range=short_term`)
        .then(data => {
            userData['short_term'] = data;
            return getSpotify(`/me/top/tracks?limit=10&time_range=medium_term`);
        })
        .then(data => {
            userData['medium_term'] = data;
            return getSpotify(`/me/top/tracks?limit=10&time_range=long_term`);
        })
        .then(data => {
            userData['long_term'] = data;
            return getSpotify(`/me`);
        })
        .then(data => {
            userData['me'] = data;
            resolve()
        })
        .catch(err => {
            reject(err);
        })
    })
}




/*
* 
* Spotify Guidelines:
*   Playlist/album name: 25 characters  - not needed
*   Artist name: 18 characters
*   Track name: 23 characters
*  
*   
*/
function updateCanvas(term='medium_term') {
    // Layer Images:
    // Paper
    // Sticker
    // Cassette Case
    // Case
    // Text
    const paperUrl = [
        '../img/paper0.png',
        '../img/paper1.png',
    ][Math.floor(Math.random() * 2)];
    
    const stickerUrl = [
        '../img/sticker0.png',
        '../img/sticker1.png',
    ][Math.floor(Math.random() * 2)];
    
    const cassetteUrl = [
        '../img/cassette0.png',
        '../img/cassette1.png',
    ][Math.floor(Math.random() * 2)];

    const caseUrl = [
        '../img/case0.png',
    ][Math.floor(Math.random() * 1)];

    const PEN_COLOUR = [
        // '#0654a9', 
        // '#3d4ab1', 
        '#424192',
        '#310332'
    ][Math.floor(Math.random() * 2)];

    
    const termText = {
        'short_term': 'Last Month',
        'medium_term': 'Last Six Months',
        'long_term': 'All Time'
    }[term];  
    
    const titleText = `Top lO Mixtape | ${termText}\n${userData['me']['display_name']}`;

    const MAX_LINE_LENGTH = 30;



    return new Promise((resolve, reject) => {
        var canvas = new fabric.StaticCanvas('c');
        canvas.clear();

        
        var penFont = new FontFaceObserver('Reenie Beanie');
        // var textFont = new FontFaceObserver('Futura Primer');
        // Promise.all([penFont.load(), textFont.load()]).then(() => {
        penFont.load().then(function() {
            // generate image
            // var canvas = new fabric.StaticCanvas('c');
            canvas.setWidth(CANVAS_WIDTH);
            canvas.setHeight(CANVAS_HEIGHT);
            canvas.setBackgroundColor(null, canvas.renderAll.bind(canvas));

            function addImageToCanvas(imgUrl, x=0, y=0) {
                // All images should be scaled to fit canvas size (0.5x)
                return new Promise(function(resolve, reject) {
                    fabric.Image.fromURL(imgUrl, function(img) {
                        img.scale(0.5, 0.5)
                        img.left = x;
                        img.top = y;
                        canvas.add(img);
                        resolve();
                    })
                })
            }

            
            

            addImageToCanvas(paperUrl)
            .then(function() {
                return addImageToCanvas(stickerUrl, 32, 28);
            })
            .then(function() {
                return addImageToCanvas(cassetteUrl, 32, 28);
            })
            .then(function() {
                return addImageToCanvas(caseUrl)
            })
            .then(function() {
                // write text

                // Title
                var textTitle = new fabric.Text(titleText, {
                    fontFamily: 'Reenie Beanie',
                    fontWeight: '800',
                    textAlign: 'center',
                    fill: PEN_COLOUR,
                    originX: 'center',
                    // fontSize: 60,
                    // left: 548,
                    // top: 94,
                    // lineHeight: 0.90,
                    fontSize: 75,
                    left: 548,
                    top: 80,
                    lineHeight: 0.75,
                });
                canvas.add(textTitle);
                
                
                // Side A Title
                var textDateA1 = new fabric.Text("DATE:", {
                    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto',
                    fontSize: 28,
                    fontWeight: 500,
                    fill: '#100000',
                    left: 150,
                    top: 707,
                });
                canvas.add(textDateA1);
                var textDateA2 = new fabric.Text(getCurrentDate(), {
                    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto',
                    fontSize: 22,
                    fontWeight: 800,
                    fill: '#100000',
                    left: 240,
                    top: 708,
                });
                canvas.add(textDateA2);

                // Side B Title
                canvas.add(textDateA1);
                var textDateA2 = new fabric.Text("CassettifyMixtape.XYZ", {
                    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto',
                    fontSize: 22,
                    fontWeight: 800,
                    fill: '#100000',
                    left: 670,
                    top: 708,
                });
                canvas.add(textDateA2);
                
                // Write Tracks
                var trackListText = [];
                urlList = [];
                for (let i = 0; i < userData[term]['items'].length; i++) {
                    trackListText.push(`${i+1}|` + userData[term]['items'][i]['name']);
                    // trackListText.push(userData[term]['items'][i]['name']);
                    // trackListText.push("  " + userData[term]['items'][i]['artists'][0]['name']);      // ONLY TAKING FIRST ARTIST??
                    trackListText.push(userData[term]['items'][i]['artists'][0]['name']);      // ONLY TAKING FIRST ARTIST??
                    // CHECK IF YOU CAN FIT MORE ARTISTS IN?
                    // CHECK IF YOU NEED TO PUT TRACK IN A NEW LINE
                    // I DON'T WANNA BE OKAY WITHOUT YOU
                    // THAT IS 33 CHARACTERS
                    urlList.push(userData[term]['items'][i]['external_urls']['spotify']);
                }
                // addTrackUrls(urlList);
                
                var trackListText_off = [
                    // "COUNTING EE",
                    // "COUNTING EEE",
                    // "COUNTING EEEE",
                    // "COUNTING FOURT",
                    "THIS HAS FIFTEE",
                    "STRING SIXTEEN!!",
                    "SEVENTEEN CHARACT",
                    "THIS HAS EIGHTEENS",
                    "NINETEEN CHARACTERS",
                    "THIS SHOULD BE TWENT",
                    "WHAT NINE PLUS TEN 21",
                    "TWO TWO TWO TWO TWO TW",
                    "TWENTY THREE TWENTY THR",
                    "TWO AND A FOUR MAKES 24!",
                    "TWENTY FIVE IS A LONG STR",
                    "I DONT KNOW WHAT ELSE TO D",
                    "TWENTY SEVEN IS PUSHING ITS",
                    "TWENTY EIGHT IS ALMOST THERE",
                    "TN LETS GO TN LETS GO HAAHHAH",
                    "OKAY THIS ONE IS THE BIG TO WO",
                    "THIS STRING HAS THIRTY ONE LETT",
                    // "THIRTY TWO. IS THIS STILL LEGIBL",
                    "boom",
                    "this string is a very long string. I wonder what it will do",
                    "BOOM long",
                ];

                // Modify strings to fit names properly
                for (let i = 0; i < trackListText.length; i += 2) {
                // for (let i = 0; i < 0; i++) {
                    var string1 = trackListText[i].split(" ");
                    var string2 = trackListText[i+1];
                    var line1 = "";
                    var line2 = "";

                    // For each word in string1:
                    // attempt to fit in line1
                    
                    // place string2 into line2
                    // if extra words in string1:
                    // place extra words into START of line2, and add /
                    // else, place a few spaces into START of line2
                    
                    // OR try to remove brackets???
                    if (trackListText[i].length + string2.length + 3 <= MAX_LINE_LENGTH-5) {
                        // just put on one line
                        line1 = trackListText[i] + " - " + string2;
                    }
                    else {
                        var line1doneEarly = false;
                        while (!line1doneEarly && string1.length != 0) {
                            // list.shift() removes and returns first element
                            var newWord = string1.shift();
                            // line1.push();
                            if (line1.length + newWord.length + 1 > MAX_LINE_LENGTH) {
                                // too many words
                                string1.unshift(newWord);
                                line1doneEarly = true;
                            }
                            else {
                                // word can fit
                                line1 = line1 + (line1.length === 0 ? "" : " ") + newWord;
                            }
                        }
                        // line2 += string2;
                        if (line1doneEarly) {
                            // line1 still has words left 
                            // line2 = "|" + line2;
                            var artistLine = " |" + string2;
                            var line2doneEarly = false;
                            while (!line2doneEarly && string1.length != 0) {
                                var newWord = string1.shift();
                                if (line2.length + newWord.length + 1 + artistLine.length > MAX_LINE_LENGTH) {
                                    // too many words
                                    string1.unshift(newWord);
                                    line2doneEarly = true;
                                    artistLine = "~" + artistLine;
                                }
                                else {
                                    // word can fit
                                    // line2 = newWord + (line2[0] === "|" ? "" : " ") + line2;
                                    line2 = line2 + " " + newWord;
                                }
                            }
                            line2 += artistLine
                        }
                        else {
                            // line is only artist
                            line2 = "  " + string2;
                        }
                    }
                    trackListText[i] = line1;
                    trackListText[i+1] = line2;
                }


                for (let i = 0; i < trackListText.length; i++) {
                    var trackText = new fabric.Textbox(trackListText[i], {
                        fontFamily: 'Reenie Beanie',
                        fontWeight: '800',
                        // textAlign: 'left',
                        // textAlign: 'center',
                        textAlign: i % 2 == 0 ? 'left' : 'right',
                        fill: PEN_COLOUR,
                        fontSize: 55,
                        // fontSize: 10,
                        originX: 'left',
                        left: i < 10 ? 50 : 565,
                        top: 775 + i % 10 * 51.5,
                        charSpacing: 0,
                        width: 440,
                        height: 55,
                    });
                    // Custom function to calculate the maximum character spacing that fits the text box
                    function calculateMaxCharSpacing(textbox) {
                        var originalCharSpacing = textbox.charSpacing;
                        
                        // Decrese charSpacing until it fits in one line
                        while (textbox.height > 80) {
                            originalCharSpacing -= 1;
                            textbox.set({ charSpacing: originalCharSpacing });
                        }
                        
                        return originalCharSpacing;
                    }
                    
                    trackText.set({
                        charSpacing: calculateMaxCharSpacing(trackText),
                        // text: trackText.height.toString(),
                    });
                    // trackText.scaleToHeight(40);
                    trackText.scaleToHeight(66);
                    canvas.add(trackText);
                    canvas.moveTo(trackText, 10);
                    
                }
            })   // .then image layer chain
            .catch((err) => {
                console.log("Error displaying images: " + err);
            });
        })
        .then(() => {
            resolve();
        }) // font.load.then
        .catch((err) => {
            console.log("Error loading fonts: " + err);
        });
        
    }); // end returned promise
}








function getCurrentDate() {
    const now = new Date();

    function getOrdinalSuffix(day) {
        if (day >= 11 && day <= 13) {return 'th';}
        return { 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] || 'th';
    }

    const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    const suffix = getOrdinalSuffix(day);

    return `${month} ${day}${suffix}, ${year}`;
}


function setUpTrackUrls() {
    var tableCells = document.querySelectorAll('table td');
    tableCells.forEach(function(cell, i) {
        cell.addEventListener('click', function() {
            clickTrackUrl(i);
        });
    });
}
function clickTrackUrl(i) {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        window.open(urlList[i % 2 === 0 ? i / 2 : (i-1) / 2 + 5], '_system');
    } else {
        // For non-mobile devices, open in a new tab
        window.open(urlList[i % 2 === 0 ? i / 2 : (i-1) / 2 + 5], '_blank');
    }
}



const CANVAS_WIDTH = 2180/2;    // actual base image / 2
const CANVAS_HEIGHT = 2725/2;



$(document).ready(function() {
    var args = parseArgs();
    self.args = args
    if (!("access_token" in args)) {
        // User is not authenticated, open default page
        window.location = '/?error=invalid_token'
    }
    else {
        // User is authenticated
        self.accessToken = args['access_token'];
        // console.log(!"access_token" in args)

        

        // Setup buttons
        $('input[name="btnradio"]').change(function() {
            var selectedOption = $(this).attr('id');
            
            if (selectedOption === 'btnshort') {
                updateCanvas('short_term');
                // console.log("short");
            } else if (selectedOption === 'btnmedium') {
                updateCanvas('medium_term');
                // console.log("medium");
            } else if (selectedOption === 'btnlong') {
                updateCanvas('long_term');
                // console.log("long");
            }
                
        });

        // Load user data
        loadUserData()
        .then(() => {
            // Draw initial canvas
            return updateCanvas('short_term')
        })
        .then(() => {
            // Set up track links
            setUpTrackUrls();
        })
        .catch((err) => {
            console.log("Error displaying canvas: " + err);
        });
        
    }
});
