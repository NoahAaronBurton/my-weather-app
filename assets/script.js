var APIKey = 'dfbba4a30298f58de574bb93ae5e3065';


var dateRow = document.getElementById('date-row');
var tempRow = document.getElementById('temp-row');
var humidRow = document.getElementById('humid-row');
var windRow = document.getElementById('wind-row');


var cityIconCol = document.getElementById('city-icon-col')

// TODO: validate user input for city

var searchButton = document.getElementById('search-btn')


function getCityData() {
    var cityInput = document.getElementById('search-field');
    var noSpaces = cityInput.value.replace(/\s/g, '+'); // api takes '+' for spaces for request url

    var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + noSpaces + '&units=imperial' + "&appid=" + APIKey;

    fetch(queryURL)
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
       console.log(iconUrl);
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


       
    }) 
    cityInput.value = ''; // clear search field
};


searchButton.addEventListener('click', getCityData);



