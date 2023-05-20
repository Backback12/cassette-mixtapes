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

var userData = {};

/*
 * loadUserData
 *
 */
function loadUserData() {
    return new Promise((resolve, reject) => {
        let promiseList = [];
        
        promiseList.push(
            getSpotify(`/me/top/tracks?limit=10&time_range=short_term`)
            .then((data) => {
                userData['short_term'] = data;
            }
        ));
        promiseList.push(
            getSpotify(`/me/top/tracks?limit=10&time_range=medium_term`)
            .then((data) => {
                userData['medium_term'] = data;
            }
        ));
        promiseList.push(
            getSpotify(`/me/top/tracks?limit=10&time_range=long_term`)
            .then((data) => {
                userData['long_term'] = data;
            }
        ));
        promiseList.push(
            getSpotify(`/me`)
            .then((data) => {
                userData['me'] = data;
            }
        ));

        Promise.all(promiseList)
        .then((allData) => {
            resolve();
        })
        .catch((err) => {
            reject(err);
        })
    })
}




function updateCanvas(term='medium_term') {
    
    const PEN_COLOUR = ['#0654a9', '#3d4ab1', '#424192'][Math.floor(Math.random() * 3)];


    if (term == 'short_term') {
        var termText = "ONE MONTH";
    }
    else if (term == 'medium_term') {
        var termText = "SIX MONTHS";
    }
    else {
        var termText = "ALL TIME";
    }


    var canvas = new fabric.StaticCanvas('c');
    canvas.clear();

    /*
    * writeTracklist
    *
    * Writes one side (A or B) or the tracklist
    * shrinks font size if the line does not fit
    * 
    * Guidelines:
    *   Playlist/album name: 25 characters  - not needed
    *   Artist name: 18 characters
    *   Track name: 23 characters
    *  
    *   
    */
    
    var font = new FontFaceObserver('Reenie Beanie');
    font.load().then(function() {
        // generate image
        // var canvas = new fabric.StaticCanvas('c');
        canvas.setWidth(CANVAS_WIDTH);
        canvas.setHeight(CANVAS_HEIGHT);
        canvas.setBackgroundColor(null, canvas.renderAll.bind(canvas));
        // var canvas = new fabric.Canvas('c');
        
        // writeTracklist(55, 778);

        // const designUrl = [
        //     '/img/mixtape.png',
        //     '/img/mixtape2.png',
        // ][Math.floor(Math.random() * 2)];
        // fabric.Image.fromURL(designUrl, function(oImg) {
        //     oImg.scaleToWidth(CANVAS_WIDTH).scaleToHeight(CANVAS_HEIGHT);
        //     canvas.add(oImg);
        //     canvas.moveTo(oImg, 0);
        // });

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
        
        // 65,56 / 2 = 32, 28
        const stickerUrl = [
            '../img/sticker0.png',
            '../img/sticker1.png',
        ][Math.floor(Math.random() * 2)];
        
        const cassetteUrl = [
            '../img/cassette0.png',
            '../img/cassette1.png',
        ][Math.floor(Math.random() * 2)];
        

        addImageToCanvas(paperUrl)
        .then(function() {
            return addImageToCanvas(stickerUrl, 32, 28);
        })
        .then(function() {
            return addImageToCanvas(cassetteUrl, 32, 28);
        })
        .then(function() {
            return addImageToCanvas('../img/case0.png')
        })
        .then(function() {
        
        
        // Date:
        var textDateA1 = new fabric.Text("DATE", {
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
            left: 226,
            top: 708,
        });
        canvas.add(textDateA2);


        // Title
        var textTitle = new fabric.Text(`TOP TEN MIXTAPE / ${termText}\n${userData['me']['display_name'].toUpperCase()}`, {
            fontFamily: 'Reenie Beanie',
            fontWeight: '800',
            textAlign: 'center',
            fill: PEN_COLOUR,
            fontSize: 60,
            originX: 'center',
            left: 548,
            top: 94,
            lineHeight: 0.90,
        });
        canvas.add(textTitle);
        // canvas.moveTo(textTitle, 1);


        // Write Tracks
        var trackListText = [];
        for (let i = 0; i < userData[term]['items'].length; i++) {
            trackListText.push(`${i+1}. ` + userData[term]['items'][i]['name']);
            trackListText.push("    - " + userData[term]['items'][i]['artists'][0]['name']);      // ONLY TAKING FIRST ARTIST??
        }
        var trackListTextTest = [
            "COUNTING EE",
            "COUNTING EEE",
            "COUNTING EEEE",
            "COUNTING FOURT",
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
        ];
        for (let i = 0; i < trackListText.length; i++) {
            var trackText = new fabric.Textbox(trackListText[i].toUpperCase(), {
                fontFamily: 'Reenie Beanie',
                fontWeight: '800',
                textAlign: 'left',
                fill: PEN_COLOUR,
                fontSize: 55,
                originX: 'left',
                left: i < 10 ? 50 : 565,
                top: 775 + (i % 10) * 51.5,
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
            trackText.scaleToHeight(66);
            canvas.add(trackText);
            canvas.moveTo(trackText, 10);
            
        }
        });   // .then layer chain
    }); // font.load.then
}








function getCurrentDate() {
    const now = new Date();

    function getOrdinalSuffix(day) {
        if (day >= 11 && day <= 13) {
        return 'th';
        }

        switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
        }
    }

    const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    const suffix = getOrdinalSuffix(day);

    return `${month} ${day}${suffix}, ${year}`;
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

        // Assign buttons
        var lastSelectedOption = $('input[name="btnradio"]:checked').attr('id');
    
        $('input[name="btnradio"]').change(function() {
            var selectedOption = $(this).attr('id');
            
            if (selectedOption !== lastSelectedOption) {
                // Option has changed, perform your actions
                if (selectedOption === 'btnshort') {
                    updateCanvas('short_term');
                    console.log("short");
                } else if (selectedOption === 'btnmedium') {
                    updateCanvas('medium_term');
                    console.log("medium");
                } else if (selectedOption === 'btnlong') {
                    updateCanvas('long_term');
                    console.log("long");
                }
                
                // Update the last selected option
                lastSelectedOption = selectedOption;
            }
        });

        loadUserData()
        .then(() => {
            updateCanvas('short_term');
        });
    }
});



