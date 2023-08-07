let OPENWEATHER_API_KEY = '22ffc970721c18909dbc91b7f0c6ba3b';


let searchButton = document.querySelector("#search-button");
searchButton.addEventListener("click",handleCitySearch);

let cityList = document.querySelector("#city-list");
cityList.addEventListener("click",handleHistSelect);

let todayForecast = document.querySelector("#today-forecast");
let nextDaysDiv = document.querySelector("#next-days");

let weatherHistory = [];

loadHistory();

function loadHistory() {
    weatherHistory = localStorage.getItem("weather-db-hist");
    if (weatherHistory === null) {
        weatherHistory = [];
    } else {
        weatherHistory = JSON.parse(weatherHistory);
    }
    cityList.innerHTML = '';
    for (let idx=0;idx<weatherHistory.length;idx++) {
        let histButton = document.createElement("button");
        histButton.setAttribute("class","hist-button");
        histButton.setAttribute("lat",weatherHistory[idx].lat);
        histButton.setAttribute("lon",weatherHistory[idx].lon);
        histButton.textContent = weatherHistory[idx].city;
        cityList.appendChild(histButton);
    }
}

function kelvinAsFahrenheit(k) {
    let c = k-273.15;
    let f = c*1.8+32;
    f = Math.floor(f*10+0.5)/10;
    return f.toFixed(1);
}

function msAsMph(ms) {
    let mph = ms*3600/1609.344;
    mph = Math.floor(mph*10+0.5)/10;
    return mph.toFixed(1);
}

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
                                    addHistButton(cityName, lat, lon);
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

function addHistButton(city, lat, lon) {
    console.log('adding button for ' + city + ', ' + lat + ', ' + lon);
    let matchFound = false;
    let matchIdx = -1;
    for (let i=0;i<weatherHistory.length;i++) {
        if (city === weatherHistory[i].city) {
            matchFound = true;
            matchIdx = idx;
        }
    }
    if (matchFound) {
        weatherHistory = weatherHistory.splice(matchIdx, 1);
    }
    weatherHistory.unshift({city: city, lat: lat, lon: lon})
    localStorage.setItem("weather-db-hist", JSON.stringify(weatherHistory));
    cityList.innerHTML = '';
    for (let idx=0;idx<weatherHistory.length;idx++) {
        let histButton = document.createElement("button");
        histButton.setAttribute("class","hist-button");
        histButton.setAttribute("lat",weatherHistory[idx].lat);
        histButton.setAttribute("lon",weatherHistory[idx].lon);
        histButton.textContent = weatherHistory[idx].city;
        cityList.appendChild(histButton);
    }
}

function handleHistSelect(event) {
    if (event === null) {
        console.log('hist click event was null');
    } else {
        console.log('click on hist list');
        let elem = event.target;
        if (!elem.matches(".hist-button")) {
            console.log('bad match on hist button event');
        } else {
            console.log('hist button click even trapped');
            let city = elem.textContent;
            console.log('hist button city = ' + city);
            if (city !== null) {
                console.log('null hist city detected');
                let lat = elem.getAttribute("lat");
                let lon = elem.getAttribute("lon");
                console.log('hist button coords = ' + lat + ', ' + lon);
                lat = parseFloat(lat);
                lon = parseFloat(lon);
                if (lat === null || lon === null) {
                    console.log ('null coords on hist button ' + city);
                }
                console.log ('will get display for hist ' + city + ', ' + lat + ', ' + lon);
                getWeatherAndDisplay (city, lat, lon);
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
                displayWeatherInfo(city, data);
            });
        } else {
            alert('Error: ' + response.statusText);
        }
    })
    .catch(function (error) {
        alert('Unable to connect to openweathermap for weather');
    });
}

let testResp = null;

function displayWeatherInfo(city, resp) {
    testResp = resp;
    console.log('reported item count = ' + resp.cnt);
    console.log('actual item count = ' + resp.list.length);
    let minCount = resp.cnt;
    if (resp.list.length < minCount) {
        minCount = resp.list.length;
    }
    // todayForecast.innerHTML = '';
    document.querySelector("#city-date").textContent = 
        city + ' (' + dayjs.unix(resp.list[0].dt).format("M/d/YYYY") + ')';
    document.querySelector("#today-temp").textContent =
        'Temp: ' + kelvinAsFahrenheit(resp.list[0].main.temp) + "\u00B0 F";
    document.querySelector("#today-wind").textContent =
        'Wind: ' + msAsMph(resp.list[0].wind.speed) + " mph";
    document.querySelector("#today-humidity").textContent =
        'Humidity: ' + resp.list[0].main.humidity + '%';
    let img = document.querySelector("#today-icon");
    let src = "https://openweathermap.org/img/wn/" + resp.list[0].weather[0].icon + ".png";
    console.log('src = ' + src);
    img.setAttribute("src",src);
    img.setAttribute("alt",resp.list[0].weather[0].description);
    console.log('min count = ' + minCount);
    nextDaysDiv.innerHTML = '';  // reset content before appending children
    let count = 0;
    let i = 7;  // TODO
    while (count < 5 && i < minCount) {
        formatCard(resp, i);
        i += 8;
        count++;
    }
}

function formatCard(resp, idx) {
    let divElem = document.createElement("div");
    let datePara = document.createElement("p");
    datePara.textContent = dayjs.unix(resp.list[idx].dt).format("M/d/YYYY");
    divElem.appendChild(datePara);
    let img = document.createElement("img");
    img.setAttribute("src","https://openweathermap.org/img/wn/" + resp.list[idx].weather[0].icon + ".png");
    img.setAttribute("alt",resp.list[0].weather[0].description);
    divElem.appendChild(img);
    let tempPara = document.createElement("p");
    tempPara.textContent = 'Temp: ' + kelvinAsFahrenheit(resp.list[idx].main.temp) + "\u00B0 F";
    divElem.appendChild(tempPara);
    let windPara = document.createElement("p");
    windPara.textContent = 'Wind: ' + msAsMph(resp.list[idx].wind.speed) + ' mph';
    divElem.appendChild(windPara);
    let humidPara = document.createElement("p");
    humidPara.textContent = 'Humidity: ' + resp.list[idx].main.humidity + '%';
    divElem.appendChild(humidPara);
    nextDaysDiv.appendChild(divElem);
}

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
