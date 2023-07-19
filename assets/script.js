var APIKey = 'dfbba4a30298f58de574bb93ae5e3065';


// TODO: validate user input for city

var searchButton = document.getElementById('search-btn')

function getCityName() {
    var cityInput = document.getElementById('search-field').value;
    var noSpaces = cityInput.replace(/\s/g, '+'); // api takes + for spaces for request url

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
        
    }) 

};


searchButton.addEventListener('click', getCityName);



