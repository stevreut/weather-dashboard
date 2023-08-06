// function testFetch () {
//     // temporary test code to produce a sample of data returned from API for Phila.
//     let baseUrl = 'https://api.openweathermap.org/';
//     let urlSuffix = 'data/2.5/forecast';
//     let lat = '39.97';
//     let lon = '-75.20';
//     let fullUrl = baseUrl + urlSuffix + '?' + 
//         'lat=' + lat + '&lon=' + lon + '&appid=' + OPENWEATHER_API_KEY;
//     console.log('full URL = "' + fullUrl + '"');
//     fetch(fullUrl) 
//         .then(response => response.json())
//         .then(data => {
//             console.log('data = ' + data);
//             return data;
//         })
//         .then(data_obj => {
//             let str = JSON.stringify(data_obj);
//             localStorage.setItem('phila-test-weather',str);
//             let myWindow = window.open("","","width=500,height=300");
//             let doc = myWindow.document;
//             doc.writeln('<html><head><title>temp</title></head>');
//             doc.writeln('<body><pre>');
//             doc.writeln(str);
//             doc.writeln('</pre></body></html>');
//         });
// }
