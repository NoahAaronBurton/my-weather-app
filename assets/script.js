var APIKey = 'dfbba4a30298f58de574bb93ae5e3065';


var dateRow = document.getElementById('date-row');
var tempRow = document.getElementById('temp-row');
var humidRow = document.getElementById('humid-row');
var windRow = document.getElementById('wind-row');

var forecastRow = document.getElementById('forecast-row');


var cityIconCol = document.getElementById('city-icon-col')

// TODO: validate user input for city

var searchButton = document.getElementById('search-btn')



function unixToLocal(unix_timestamp) { // chat gpt helped me with this function for formatting dates
    // Convert to milliseconds by multiplying by 1000
    let date = new Date(unix_timestamp * 1000);
    // Returns date as a string in local time format without seconds
    let dateTimeFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return dateTimeFormat.format(date);
}

function getCityData() {
    var cityInput = document.getElementById('search-field');
    var noSpaces = cityInput.value.replace(/\s/g, '+'); // api takes '+' for spaces for request url

    // First, get the geocoding data for the city
    var searchQuery = "http://api.openweathermap.org/geo/1.0/direct?q=" + noSpaces + "&limit=1&appid=" + APIKey;

    fetch(searchQuery)
    .then(function(response) {
        if (!response.ok) {
            alert('There was a problem with your search. Please check the spelling of your query.')
            throw new Error('Problem with geocoding API');
        } else {
            return response.json();
        }
    })
    .then(function (data){
        
        // Now that we have the geocoding data, we can make the second API call. Chat GPT helped me with this second call.
        if (data.length === 0) {
            alert('No results found. Please check the spelling of your query.');
            throw new Error('No geocoding data found');
        }
        var lat = data[0].lat;
        var lon = data[0].lon;
        
        //console.log(data);

        // Then, get the weather data for the coordinates
        var weatherURL = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + '&units=imperial' + "&appid=" + APIKey;

        fetch(weatherURL)
        .then(function(response) {
            if (response.status === 404) {
                alert('There was a problem with your search. Please check the spelling of your query.')
            } else {
                return response.json();
            }
        })
        .then(function (data){
            console.log(data);

        //clear previous city data before loading in more
        cityIconCol.innerHTML = '';
        dateRow.innerHTML = '';
        tempRow.innerHTML ='';
        humidRow.innerHTML = '';
        windRow.innerHTML = '';
         
        
        //city heading and date
        var makeCityHeading = document.createElement('h2');
        var makeDateHeading = document.createElement('h4');
        
        var unix_timestamp = data.dt;
        var localTime = unixToLocal(unix_timestamp);
        
        makeCityHeading.textContent = data.name;
        makeDateHeading.textContent = localTime;
        makeDateHeading.style.padding = '10px';
        cityIconCol.appendChild(makeCityHeading);
        dateRow.appendChild(makeDateHeading);

       // icon
       var iconId = data.weather[0].icon; // reference to icon ID
       var iconUrl = 'http://openweathermap.org/img/w/' + iconId + '.png'
       
       var makeIconImg = document.createElement('img');
       //console.log(iconUrl);
       makeIconImg.src = iconUrl; 
       makeIconImg.id = 'weather-icon'
       cityIconCol.appendChild(makeIconImg);
        
        // temp
        var makeTempHeading = document.createElement('h5');
        makeTempHeading.textContent = data.main.temp + ' °F';
        makeTempHeading.style.padding = '10px';
        tempRow.appendChild(makeTempHeading);

       //humidity
       var makeHumidHeading = document.createElement('h5');
       makeHumidHeading.textContent = 'Hudmidity: ' + data.main.humidity + '%';
       makeHumidHeading.style.padding = '10px';
       humidRow.appendChild(makeHumidHeading);

       // wind
       var makeWindHeading = document.createElement('h5');
       makeWindHeading.textContent = 'Wind speed: ' + data.wind.speed + ' MPH';
       makeWindHeading.style.padding = '10px';
       windRow.appendChild(makeWindHeading);


        // to do: print .name to basic well area

        // make forecast cards
        var forecastURL = 'http://api.openweathermap.org/data/2.5/forecast?lat=' + lat+ '&lon=' + lon + /*+ '&cnt=5' +*/ '&appid=' + APIKey;
        console.log(forecastURL);
        fetch(forecastURL)
        .then(function (response){
            return response.json();
        })
        .then(function(data) {
            console.log(data);
            // clear prev cards
            forecastRow.innerHTML = '';
            // create cards
            var makeCard = document.createElement('div');
            makeCard.className= 'card';
            var previousDate= '';
            for (var i = 0; i < data.list.length; i++) {
                // get date ref 
                var date = new Date(data.list[i].dt * 1000); // chat gpt helped me with the next three lines
                var day = date.getDate();
                var hour = date.getHours();
                // get icon url
                var iconForecastId = data.list[i].weather[0].icon; // weather array has one item for each day; icon is inside
                var iconForecastUrl = 'http://openweathermap.org/img/w/' + iconForecastId + '.png'
                //console.log(iconForecastUrl);
                // check if the hour is noon and the day has changed... only way to get different days from the API
                if (hour === 12 && day !== previousDate) {

                    // create a new column and card for each day
                    var makeCol = document.createElement('div');
                    makeCol.className = 'col';
                    var makeCard = document.createElement('div');
                    makeCard.className= 'card';
                    var makeForecastIcon = document.createElement('img');
                    makeForecastIcon.className = 'forecast-icon'
                    makeForecastIcon.src = iconForecastUrl;
                    
                    var heading = document.createElement('h5');
                    heading.textContent = date.toDateString(); // format the date as a string
                    heading.className = 'card-header';
                    // to do: append icon 
                    makeCard.appendChild(heading);
                    makeCard.appendChild(makeForecastIcon);
                    makeCol.appendChild(makeCard);
                    forecastRow.appendChild(makeCol);

                    previousDate = day;
                }
            }
            
        })

        }) 
        
    });
    
    cityInput.value = ''; // clear search field
};


// displays salt lake city weather when first opened
function placeholderData(){
    var initQueryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + 'salt+lake+city' + '&units=imperial' + "&appid=" + APIKey;
    
    fetch(initQueryURL)
    .then(function(response) {
        if (response.status === 404) {
            alert('Error pulling in placeholder data. Please make a search to display weather data')
        } else {
            return response.json();
        }
        
    })
    .then(function (data){
        //console.log(data);

        //clear previous city data before loading in more
        cityIconCol.innerHTML = '';
        dateRow.innerHTML = '';
        tempRow.innerHTML ='';
        humidRow.innerHTML = '';
        windRow.innerHTML = '';
        // to do: display weather data to placeholder 
        
        //city heading and date
        var makeCityHeading = document.createElement('h2');
        var makeDateHeading = document.createElement('h4');
        
        var unix_timestamp = data.dt;
        var localTime = unixToLocal(unix_timestamp);
        function unixToLocal(unix_timestamp) { // chat gpt helped me with this function for formatting dates
            // Convert to milliseconds by multiplying by 1000
            let date = new Date(unix_timestamp * 1000);
            // Returns date as a string in local time format without seconds
            let dateTimeFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return dateTimeFormat.format(date);
        }
        makeCityHeading.textContent = data.name;
        makeDateHeading.textContent = localTime;
        makeDateHeading.style.padding = '10px';
        cityIconCol.appendChild(makeCityHeading);
        dateRow.appendChild(makeDateHeading);

       // icon
       var iconId = data.weather[0].icon; // reference to icon ID
       var iconUrl = 'http://openweathermap.org/img/w/' + iconId + '.png'
       
       var makeIconImg = document.createElement('img');
       //console.log(iconUrl);
       makeIconImg.src = iconUrl; 
       makeIconImg.id = 'weather-icon'
       cityIconCol.appendChild(makeIconImg);
        
        // temp
        var makeTempHeading = document.createElement('h5');
        makeTempHeading.textContent = data.main.temp + ' °F';
        makeTempHeading.style.padding = '10px';
        tempRow.appendChild(makeTempHeading);

       //humidity
       var makeHumidHeading = document.createElement('h5');
       makeHumidHeading.textContent = 'Hudmidity: ' + data.main.humidity + '%';
       makeHumidHeading.style.padding = '10px';
       humidRow.appendChild(makeHumidHeading);

       // wind
       var makeWindHeading = document.createElement('h5');
       makeWindHeading.textContent = 'Wind speed: ' + data.wind.speed + ' MPH';
       makeWindHeading.style.padding = '10px';
       windRow.appendChild(makeWindHeading);  


    }) 

}
placeholderData();

searchButton.addEventListener('click', getCityData);



