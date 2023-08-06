let OPENWEATHER_API_KEY = '22ffc970721c18909dbc91b7f0c6ba3b';


let searchButton = document.querySelector("#search-button");

searchButton.addEventListener("click",handleCitySearch);

let resp;
//testResponse();  // TODO - temporary


// function testResponse() {  // TODO - temporary
//     resp = JSON.parse(respJson);
//     let cnt = resp.cnt;
//     if (cnt < 1) {
//         return;
//     }
//     console.log('count = ' + cnt);
//     console.log('arr len = ' + resp.list.length);
//     for (let i=0;i<cnt;i++) {
//         let txt = 'dt/time = ' + resp.list[i].dt_txt + ' : ';
//         let k = resp.list[i].main.temp;
//         let c = k-273.15;
//         let f = c*9.0/5+32;
//         f = Math.floor(f+0.5);
//         txt += (f + ' deg F');
//         console.log(i + ' : ' + txt);
//     }
// }

function handleCitySearch(event) {
    if (event === null) {
        console.log('click event was null');
    } else {
        console.log('click on button search button');
        let elem = event.target;
        if (!elem.matches("button") || !elem.matches("#search-button")) {
            console.log('bad match on search button event');
        } else {
            console.log('search button click even trapped');
            let city = document.querySelector("#search-city").value;
            if (city === null) {
                console.log('null city detected');
            } else {
                console.log('initial city value = "' + city + '"');
                city = city.trim();
                console.log('trimmed city = "' + city + '" with length = ' + city.length);
                // TODO - temp - pending refinement, call testFormatWeather() just to demo display
                // testFormatWeather(JSON.parse(respJson)); // TODO
                // let cityData = cityDataFromAPI(city);
                // if (cityData === null) {
                //     console.log('null returned from geo');
                // } else {
                //     console.log('city returned from geo = ' + cityData);
                // }
                if (city.length !== 0) {
                    cityDataFromAPI(city)
                    .then(function(cityData) {
                        console.log('city data after API return = ' + cityData);
                    })
                    .catch(function(arg) {
                        console.log('caught something here');
                        console.log('caught arg = ' + arg);
                    });
                } else {
                    console.log('no search done on blank city');
                    // TODO - need some kind of error response here
                }
            }
        }
    }
}

function cityDataFromAPI(cityName) {
    // returns promise containing:
    //  {name: name, lat: <north latitude, lon: <east longitude>}
    //    or
    //  null  ??
    //--
    // Construct URL
    let BASE_URL = 'http://api.openweathermap.org/';
    let GEO_API_BRANCH = 'geo/1.0/direct';
    let url = BASE_URL + GEO_API_BRANCH + "?" +
        "q=" + cityName /* TODO */ + "&limit=1" +
        "&appid=" + OPENWEATHER_API_KEY;
    let urlEncoded = encodeURI(url);
    console.log('geo url = "' + urlEncoded + '"');
    return new Promise(function(resolve,reject) {
        fetch(urlEncoded)
            .then(function(responseJson) {
                console.log('geo resp raw = ' + responseJson);
                console.log('type of geo resp raw = ' + typeof responseJson);
                return responseJson.json();
            })
            .then(function (respObj) {
                console.log('geo resp obj = ' + respObj);
                console.log('type of geo resp conv = ' + typeof respObj);
                let lat = respObj[0].lat;
                let lon = respObj[0].lon;
                let name = respObj[0].name;
                console.log('name/lat/lon = ' + name + ', ' + lat + ', ' + lon);
                return {name: name, lat: lat, lon: lon};
            }).catch(function(arg) {
                console.log('geo catch arg = ' + arg);
                console.log('geo catch clause');
            })
        }
    );
}


let testWeatherOutput = null;
weatherFromCoords(39.97,-75.2);

function weatherFromCoords (lat, lon) {
    // returns response from weather API as object, or
    // null
    let BASE_URL = 'http://api.openweathermap.org/';
    let GEO_API_BRANCH = 'data/2.5/forecast';
    let url = BASE_URL + GEO_API_BRANCH + "?" +
        "lat=" + lat + "&lon=" + lon + 
        "&appid=" + OPENWEATHER_API_KEY;
    let urlEncoded = encodeURI(url);
    console.log('weather url = "' + urlEncoded + '"');
    return new Promise(function(resolve,reject) {
        fetch(urlEncoded)
            .then(function(responseJson) {
                console.log('weather resp raw = ' + responseJson);
                console.log('type of wthr resp raw = ' + typeof responseJson);
                return responseJson.json();
            })
            .then(function (respObj) {
                console.log('weather resp obj = ' + respObj);
                console.log('type of weather resp conv = ' + typeof respObj);
                testWeatherOutput = respObj;
                console.log('testWeatherOutput set');
            }).catch(function(arg) {
                console.log('weather catch arg = ' + arg);
                console.log('weather catch clause');
            })
        }
    );
}

function testFormatWeather(resp) {
    let nextDaysDiv = document.querySelector("#next-days");
    if (resp === null) {
        console.log('resp is null');
    } else {
        let typ = typeof resp;
        console.log('type of response = ' + typ);
        if (typ !== 'object') {
            console.log('not an object');
        } else {
            console.log('is an object (good)');
            let i = 0;
            let count = 0;
            nextDaysDiv.innerHTML = '';  // reset content before appending children
            while (count < 5 && i < resp.list.length) {
                let divElem = document.createElement("div");
                let datePara = document.createElement("p");
                datePara.textContent = dayjs.unix(resp.list[i].dt).format("YYYY-MM-DD[T]HH:mm");
                divElem.appendChild(datePara);
                // TODO conditions (later)
                let degK = resp.list[i].main.temp;
                let degC = degK-273.15;  // convert Kelvin to Celsius
                let degF = degC*1.5+32;  // convert Celsius to Fahrenheit
                degF = Math.floor(degF*10+0.5)/10;  // show 0.1 precision (might not work for < 0)
                let tempPara = document.createElement("p");
                tempPara.textContent = degF;
                divElem.appendChild(tempPara);
                let humidPara = document.createElement("p");
                humidPara.textContent = resp.list[i].main.humidity + "%";
                divElem.appendChild(humidPara);
                nextDaysDiv.appendChild(divElem);
                count++;
                i += 8;
            }
        }
    }
}