let OPENWEATHER_API_KEY = '22ffc970721c18909dbc91b7f0c6ba3b';


let searchButton = document.querySelector("#search-button");

searchButton.addEventListener("click",handleCitySearch);

// let resp;

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
                if (city.length !== 0) {
                    url = geoUrlFromCity(city);
                    fetch(url)
                        .then(function (response) {
                            if (response.ok) {
                                response.json().then(function (data) {
                                    let cityName = data[0].name;
                                    let lat = data[0].lat;
                                    let lon = data[0].lon;
                                    console.log('name/lat/lon = ' + cityName + ' / ' + lat + ' / ' + lon);
                                    getWeatherAndDisplay (cityName, lat, lon);
                                });
                            } else {
                                alert('Error: ' + response.statusText);
                            }
                        })
                        .catch(function (error) {
                            alert('Unable to connect to openweathermap for geo');
                        });
                } else {
                    console.log('no search done on blank city');
                    // TODO - need some kind of error response here
                }
            }
        }
    }
}

function getWeatherAndDisplay (city, lat, lon) {
    let url = weatherUrlFromLatLon (lat, lon);
    fetch(url)
    .then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                console.log('weather received : ' + JSON.stringify(data));
                displayWeatherInfo(data);
            });
        } else {
            alert('Error: ' + response.statusText);
        }
    })
    .catch(function (error) {
        alert('Unable to connect to openweathermap for weather');
    });
}

function displayWeatherInfo(weatherResponse) {
    console.log('reported item count = ' + weatherResponse.cnt);
    console.log('actual item count = ' + weatherResponse.list.length);

}

// function cityDataFromAPI(cityName) {
//     let url = geoUrlFromCity(cityName);
//     return new Promise(function(resolve,reject) {
//         fetch(url)
//             .then(function(responseJson) {
//                 console.log('geo resp raw = ' + responseJson);
//                 console.log('type of geo resp raw = ' + typeof responseJson);
//                 return responseJson.json();
//             })
//             .then(function (respObj) {
//                 console.log('geo resp obj = ' + respObj);
//                 console.log('type of geo resp conv = ' + typeof respObj);
//                 let lat = respObj[0].lat;
//                 let lon = respObj[0].lon;
//                 let name = respObj[0].name;
//                 console.log('name/lat/lon = ' + name + ', ' + lat + ', ' + lon);
//                 return {name: name, lat: lat, lon: lon};
//             }).catch(function(arg) {
//                 console.log('geo catch arg = ' + arg);
//                 console.log('geo catch clause');
//             })
//         }
//     );
// }

function geoUrlFromCity(city) {
    let BASE_URL = 'http://api.openweathermap.org/';
    let GEO_API_BRANCH = 'geo/1.0/direct';
    let url = BASE_URL + GEO_API_BRANCH + "?" +
        "q=" + city /* TODO */ + "&limit=1" +
        "&appid=" + OPENWEATHER_API_KEY;
    let urlEncoded = encodeURI(url);
    console.log('geo url = "' + urlEncoded + '"');
    return urlEncoded;
}

function weatherUrlFromLatLon(lat,lon) {
    let BASE_URL = 'http://api.openweathermap.org/';
    let GEO_API_BRANCH = 'data/2.5/forecast';
    let url = BASE_URL + GEO_API_BRANCH + "?" +
        "lat=" + lat + "&lon=" + lon + 
        "&appid=" + OPENWEATHER_API_KEY;
    let urlEncoded = encodeURI(url);
    console.log('weather url = "' + urlEncoded + '"');
    return urlEncoded;
}


let testWeatherOutput = null;
weatherFromCoords(39.97,-75.2);

function weatherFromCoords (lat, lon) {
    let url = weatherUrlFromLatLon(lat, lon);
    return new Promise(function(resolve,reject) {
        fetch(url)
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