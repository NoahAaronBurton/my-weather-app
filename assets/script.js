var APIKey = 'dfbba4a30298f58de574bb93ae5e3065';

var cityHeadingRow = document.getElementById('city-heading-row');

// TODO: validate user input for city

var searchButton = document.getElementById('search-btn')

function getCityName() {
    var cityInput = document.getElementById('search-field').value;
    var noSpaces = cityInput.replace(/\s/g, '+'); // api takes '+' for spaces for request url

    var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + noSpaces + "&appid=" + APIKey;

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
        cityHeadingRow.appendChild(makeCityHeading);
        cityHeadingRow.appendChild(makeDateHeading);

       

        

        // to do: print .name to basic well area


       
    }) 

};


searchButton.addEventListener('click', getCityName);



