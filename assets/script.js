var APIKey = 'dfbba4a30298f58de574bb93ae5e3065';

var dateRow = document.getElementById('date-row');
var tempRow = document.getElementById('temp-row');
var humidRow = document.getElementById('humid-row');
var windRow = document.getElementById('wind-row');

var forecastRow = document.getElementById('forecast-row');

var cityIconCol = document.getElementById('city-icon-col')

var searchButton = document.getElementById('search-btn')
var cityInput = document.getElementById('search-field');

// history
function displayHistory () {
    var listElement = document.getElementById('history'); // ref to target list element
    var searchHistory = JSON.parse(localStorage.getItem('search-history')) || []; // look for history in local storage OR have it be empty if there is no data
    listElement.innerHTML = '';
    

    for (var i = 0; i <searchHistory.length; i++) {
        var listItem = document.createElement('a');
        listItem.textContent =searchHistory[i];
        listItem.className = 'list-group-item list-group-item-action';
        listItem.addEventListener('click', function (){
            cityInput.value = this.textContent;
            getCityData();// trigger new search if a list item is clicked
        })
        listElement.appendChild(listItem);
    }

}

function unixToLocal(unix_timestamp) { // chat gpt helped me with this function for formatting dates
    // Convert to milliseconds by multiplying by 1000
    let date = new Date(unix_timestamp * 1000);
    // Returns date as a string in local time format without seconds
    let dateTimeFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return dateTimeFormat.format(date);
}

function getCityData() { 
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
        var searchHistory = JSON.parse(localStorage.getItem('search-history')) || [];
        //console.log(data[0].name);
       
        // adds check for duplicates for the search history
        if (!searchHistory.includes(data[0].name)){
            searchHistory.push(data[0].name);
            localStorage.setItem('search-history', JSON.stringify(searchHistory));
        }
        
        displayHistory(); // update history
        cityInput.value = ''; // clear search field

        // Now that we have the geocoding data, we can make the second API call. Chat GPT helped me with this second call.
        if (data.length === 0) {
            alert('No results found. Please check the spelling of your query.');
            throw new Error('No geocoding data found');
        }
        var lat = data[0].lat;
        var lon = data[0].lon;
        

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

        // make forecast cards
        var forecastURL = 'http://api.openweathermap.org/data/2.5/forecast?lat=' + lat+ '&lon=' + lon + '&units=imperial' + '&appid=' + APIKey;
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
                // temp
                var forecastTemp = data.list[i].main.temp + ' °F';
                // wind
                var forecastWind = data.list[i].wind.speed + ' MPH wind speed';
                //humid
                var forecastHumid = data.list[i].main.humidity + '% Humidity'
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
                    var makeForecastTempHeading = document.createElement('h6');
                    makeForecastTempHeading.textContent = forecastTemp;
                    makeForecastTempHeading.style.padding = '5px';
                    var makeForecastWind = document.createElement('h6');
                    makeForecastWind.textContent = forecastWind;
                    makeForecastWind.style.padding = '5px'
                    var makeForecastHumid = document.createElement('h6');
                    makeForecastHumid.textContent = forecastHumid;
                    makeForecastHumid.style.padding = '5px';
                    
                    var heading = document.createElement('h5');
                    heading.textContent = date.toDateString(); // format the date as a string
                    heading.className = 'card-header';
                    
                    makeCard.appendChild(heading);
                    makeCard.appendChild(makeForecastIcon);
                    makeCol.appendChild(makeCard);
                    forecastRow.appendChild(makeCol);
                    makeCard.appendChild(makeForecastTempHeading);
                    makeCard.appendChild(makeForecastWind);
                    makeCard.appendChild(makeForecastHumid);

                    previousDate = day;
                }
            }
            
        })

        }) 
        
    });
   
    
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
        var lat = data.coord.lat;
        var lon = data.coord.lon;


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


       // make forecast cards
       
       var forecastURL = 'http://api.openweathermap.org/data/2.5/forecast?lat=' + lat+ '&lon=' + lon + '&units=imperial' + '&appid=' + APIKey;
       
        fetch(forecastURL)
       .then(function (response){
           return response.json();
       })
       .then(function(data) {
           //console.log(data);
            
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
               // temp
               var forecastTemp = data.list[i].main.temp + ' °F';
               // wind
               var forecastWind = data.list[i].wind.speed + ' MPH wind speed';
               //humid
               var forecastHumid = data.list[i].main.humidity + '% Humidity'
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
                   var makeForecastTempHeading = document.createElement('h6');
                   makeForecastTempHeading.textContent = forecastTemp;
                   makeForecastTempHeading.style.padding = '5px';
                   var makeForecastWind = document.createElement('h6');
                   makeForecastWind.textContent = forecastWind;
                   makeForecastWind.style.padding = '5px'
                   var makeForecastHumid = document.createElement('h6');
                   makeForecastHumid.textContent = forecastHumid;
                   makeForecastHumid.style.padding = '5px';
                   
                   var heading = document.createElement('h5');
                   heading.textContent = date.toDateString(); // format the date as a string
                   heading.className = 'card-header';
                   // to do: append temp, wind, and humidity
                   makeCard.appendChild(heading);
                   makeCard.appendChild(makeForecastIcon);
                   makeCol.appendChild(makeCard);
                   forecastRow.appendChild(makeCol);
                   makeCard.appendChild(makeForecastTempHeading);
                   makeCard.appendChild(makeForecastWind);
                   makeCard.appendChild(makeForecastHumid);

                   previousDate = day;
               }
           }
           
       })
        

    }) 

}
placeholderData();

searchButton.addEventListener('click', getCityData);



document.addEventListener('DOMContentLoaded', displayHistory); // wait til doc load before getting history. this helps with duplicates