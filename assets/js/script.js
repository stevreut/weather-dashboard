let OPENWEATHER_API_KEY = '22ffc970721c18909dbc91b7f0c6ba3b';


let searchButton = document.querySelector("#search-button");
searchButton.addEventListener("click",handleCitySearch);

let searchCity = document.querySelector("#search-city");

let cityList = document.querySelector("#city-list");
cityList.addEventListener("click",handleHistSelect);

let todayForecast = document.querySelector("#today-forecast");
let nextDaysDiv = document.querySelector("#next-days");

let weatherHistory = [];

loadHistory();

function loadHistory() {
    // Get saved cities (and associated coordinates) from localStorage
    // and use that data to rebuild the weatherHistory array and the
    // column of buttons for the same, as these two mirror each other.
    weatherHistory = localStorage.getItem("weather-db-hist");
    if (weatherHistory === null) {
        // If no localStorage then start with a blank link
        weatherHistory = [];
    } else {
        weatherHistory = JSON.parse(weatherHistory);
    }
    // Build the buttons, including lat= and lon= attributes which can 
    // be passed to the weather API without the need to re-query the 
    // geocode API.
    buildHistoryFromWeatherHistory();
    // If this list is populated then use the first city on the list
    // to do a weather look-up for purpose of initially populating the page.
    //
    // If there are currently no buttons then arbitrary add one for 
    // Cocoa Beach (HSH) and look-up the weather for the same - again for
    // the purpose of populating the page on the initial load.
    if (weatherHistory.length > 0) {
        lookupCityAndDisplay(weatherHistory[0].city);
    } else {
        lookupCityAndDisplay('Cocoa Beach');
    }
}

function kelvinAsFahrenheit(k) {
    // Converts a NUMERIC Kelvin temperature
    // to a STRING Fahrenheit, rounded to one figure
    // after the decimal point.
    let c = k-273.15;
    let f = c*1.8+32;
    f = Math.floor(f*10+0.5)/10;
    return f.toFixed(1);
}

function msAsMph(ms) {
    // Concerts a NUMERIC velocity in metres per second to
    // a STRING velocity in mph, rounded to one figure
    // after the decimal point.
    let mph = ms*3600/1609.344;
    mph = Math.floor(mph*10+0.5)/10;
    return mph.toFixed(1);
}

function handleCitySearch(event) {
    // This is the listener associated with clicking the 
    // "Search" button.
    if (event !== null) {
        let elem = event.target;
        // Remove any temporary warning content that might have been
        // temporarily placed in the same-day forecast box.
        removeWarnings();
        // Confirm event matches a click of the desired button.
        if (elem.matches("#search-button")) {
            // Attempt to do the multiple look-ups and, if
            // successful, populate the page with data therefrom.
            let city = searchCity.value;
            lookupCityAndDisplay(city);
        }
    }
}

function lookupCityAndDisplay(city) {
    // After verifying that the the city parameter is non-null
    // and not empty, use the same to get latitude and longitude from
    // the appropriate API.  If that succeeds then look-up weather
    // from another API and, if successful, populate today's and the
    // next five days' weather info on the page.
    if (city !== null) {
        city = city.trim();
        if (city.length !== 0) {
            url = geoUrlFromCity(city);
            fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        // asynchronous conversion of response object to 
                        // response CONTENT object
                        response.json()
                .then(function (data) {
                    if (data.length > 0) {
                        let cityName = data[0].name;
                        let lat = data[0].lat;
                        let lon = data[0].lon;
                        getWeatherAndDisplay (cityName, lat, lon);
                        addHistButton(cityName, lat, lon);
                        searchCity.value = '';
                    } else {
                        // A "valid" response from the geo API can still be an empty array,
                        // indicating that no matching cities were found.  This is not a "trap" but
                        // needs to be handled as a 'not found' scenario.  To do so, we repurpose the
                        // <div> that normally contains today's weather but, in this case, we apply 
                        // brighter colors by swapping in the "warning-alert" class, then put
                        // warning information in the H2 content and hide the other children (temperature,
                        // etc.)
                        let cityH2 = document.querySelector("#city-date");
                        cityH2.textContent = "No information found for " + city;
                        cityH2.setAttribute("class","warning-alert");
                        cityH2.parentElement.setAttribute("class","warning-alert");
                        document.querySelector("#today-icon").style.visibility = 'hidden';
                        document.querySelector("#today-temp").style.visibility = 'hidden';
                        document.querySelector("#today-wind").style.visibility = 'hidden';
                        document.querySelector("#today-humidity").style.visibility = 'hidden';
                        // Also remove the 5-day forecast
                        nextDaysDiv.innerHTML = '';
                        searchCity.value = '';
                    }
                        });
                    } else {
                        alert('Error: ' + response.statusText);
                    }
                })
                .catch(function (error) {
                    alert('Unable to connect to openweathermap for geo');
                });
        }
    }
}

function addHistButton(city, lat, lon) {
    // Adds a new history button to the column AND the associated 
    // weatherHistory array based on the parameters, then persists
    // the modified weatherHistory array to localStorage.
    let matchFound = false;
    let matchIdx = -1;
    // First scan the weatherHistory for any elements of the array
    // that match the city in the parameter and, if found, note the
    // index where that match was found.
    for (let i=0;i<weatherHistory.length;i++) {
        if (city === weatherHistory[i].city) {
            matchFound = true;
            matchIdx = i;
        }
    }
    if (matchFound) {
        // If a match was found then we first remove that match from the array
        // weatherHistory = weatherHistory.splice(matchIdx, 1);
        weatherHistory.splice(matchIdx, 1);
    }
    // Now, whether matched or now, we insert the new button at the top of the
    // array, and then store the array in its entirety.
    weatherHistory.unshift({city: city, lat: lat, lon: lon})
    localStorage.setItem("weather-db-hist", JSON.stringify(weatherHistory));
    // Now we completely rebuild the button column from the weatherHistory, 
    // thereby insuring that weatherHistory, its localStorage incarnation, and
    // the column of buttons are all three in-synch.
    buildHistoryFromWeatherHistory();
}

function buildHistoryFromWeatherHistory() {
    cityList.innerHTML = '';  // Clear any pre-existing history button content
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
    // Event listener for clicking of city history buttons.  This
    // uses event delegation and, therefore, an event need not
    // necessarily be the clocking of a button, thus we check
    // that it matches ".hist-button" before processing.
    if (event !== null) {
        let elem = event.target;
        if (elem.matches(".hist-button")) {
            // Remove any warning content that may have been 
            // previously placed in the current day forecast
            // box.
            removeWarnings();
            let city = elem.textContent;
            if (city !== null && city.length > 0) {
                let lat = elem.getAttribute("lat");
                let lon = elem.getAttribute("lon");
                lat = parseFloat(lat);
                lon = parseFloat(lon);
                // Use city, latitude and longitude to look-up weather and
                // then populate page content.
                getWeatherAndDisplay (city, lat, lon);
            }
            searchCity.value = '';
        }
    }

}

function removeWarnings() {
    // Clears any warning content that may have been left in the current day
    // forecast box.
    let cityH2 = document.querySelector("#city-date");
    cityH2.classList.remove("warning-alert");
    cityH2.parentElement.classList.remove("warning-alert");
    document.querySelector("#today-icon").style.visibility = 'visible';
    document.querySelector("#today-temp").style.visibility = 'visible';
    document.querySelector("#today-wind").style.visibility = 'visible';
    document.querySelector("#today-humidity").style.visibility = 'visible';
}

function getWeatherAndDisplay (city, lat, lon) {
    // Use latitute and longitude to form the correct API
    // for the fetch, then populate page of fetch is successful.
    let url = weatherUrlFromLatLon (lat, lon);
    fetch(url)
    .then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
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

function displayWeatherInfo(city, resp) {
    // Populate page content based on response from the weather API as well
    // as the city name passed as a parameter.
    let minCount = resp.cnt;
    if (resp.list.length < minCount) {
        minCount = resp.list.length;
    }
    // First populate the box for TODAY'S weather (info from resp.list[0]):
    document.querySelector("#city-date").textContent = 
        // Note dt is unix epoch and must be converted.
        city + ' (' + dayjs.unix(resp.list[0].dt).format("M/D/YYYY") + ')';
    document.querySelector("#today-temp").textContent =
        'Temp: ' + kelvinAsFahrenheit(resp.list[0].main.temp) + "\u00B0 F";
    document.querySelector("#today-wind").textContent =
        'Wind: ' + msAsMph(resp.list[0].wind.speed) + " mph";
    document.querySelector("#today-humidity").textContent =
        'Humidity: ' + resp.list[0].main.humidity + '%';
    let img = document.querySelector("#today-icon");
    let src = "https://openweathermap.org/img/wn/" + resp.list[0].weather[0].icon + ".png";
    img.setAttribute("src",src);
    img.setAttribute("alt",resp.list[0].weather[0].description);
    nextDaysDiv.innerHTML = '';  // reset content before appending children
    // Populate the 5-day forecast cards, assuming that at least 40 elements occur in the
    // resp.list[] array.  If less than 40 then we still move forward by incrementing the 
    // index in increments of 8 (3 hrs ea = 24 hours) creating UP TO five cards.
    let count = 0;
    let i = 7;
    while (count < 5 && i < minCount) {
        formatCard(resp, i);
        i += 8;
        count++;
    }
}

function formatCard(resp, idx) {
    // Formats a single weather card for the day whose information is provided
    // in resp.list[idx].  This is done through dynamic creation of the
    // card (<div>) corresponding to that forecast.
    let divElem = document.createElement("div");
    divElem.setAttribute("class","card");
    let datePara = document.createElement("p");
    datePara.textContent = dayjs.unix(resp.list[idx].dt).format("M/D/YYYY");
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
        "q=" + city + "&limit=1" +
        "&appid=" + OPENWEATHER_API_KEY;
    let urlEncoded = encodeURI(url);
    return urlEncoded;
}

function weatherUrlFromLatLon(lat,lon) {
    let BASE_URL = 'http://api.openweathermap.org/';
    let GEO_API_BRANCH = 'data/2.5/forecast';
    let url = BASE_URL + GEO_API_BRANCH + "?" +
        "lat=" + lat + "&lon=" + lon + 
        "&appid=" + OPENWEATHER_API_KEY;
    let urlEncoded = encodeURI(url);
    return urlEncoded;
}
