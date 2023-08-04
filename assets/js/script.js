let OPENWEATHER_API_KEY = '22ffc970721c18909dbc91b7f0c6ba3b';


let searchButton = document.querySelector("#search-button");

searchButton.addEventListener("click",handleCitySearch);

//testFetch();  // TODO - DELIBERATELY disabled

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
            }
        }
    }
}

function testFetch () {
    // temporary test code to produce a sample of data returned from API for Phila.
    let baseUrl = 'https://api.openweathermap.org/';
    let urlSuffix = 'data/2.5/forecast';
    let lat = '39.97';
    let lon = '-75.20';
    let fullUrl = baseUrl + urlSuffix + '?' + 
        'lat=' + lat + '&lon=' + lon + '&appid=' + OPENWEATHER_API_KEY;
    console.log('full URL = "' + fullUrl + '"');
    fetch(fullUrl) 
        .then(response => response.json())
        .then(data => {
        
            console.log('data = ' + data);
            return data;
        })
        .then(data_obj => {
            let str = JSON.stringify(data_obj);
            localStorage.setItem('phila-test-weather',str);
            let myWindow = window.open("","","width=500,height=300");
            let doc = myWindow.document;
            doc.writeln('<html><head><title>temp</title></head>');
            doc.writeln('<body><pre>');
            doc.writeln(str);
            doc.writeln('</pre></body></html>');
        });
    
}
    /* https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key} */
