// Variable
let cities = [];

// API Requests

$("#find-city").on("click", function (event) {
  event.preventDefault();

  let city = $("#city-input").val();
  getAPIs(city);
});

$("#city-list").on("click", ".city", function (event) {
  event.preventDefault();

  let city = $(this).text();
  getAPIs(city);
});

// To clear the city names array
$("#clear-city-names").on("click", function () {
  cities = [];
  saveCities();
  renderCities();
})

function getAPIs(city) {

  // More variables
  const apiKey = "b920abd260d921a019c33f7b1fed4b1b";
  let forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city},us&units=imperial&appid=${apiKey}`;
  let mainWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city},us&units=imperial&appid=${apiKey}`;

  $.ajax({
    url: forecastURL,
    method: "GET"
  }).then(function (response) {
    showFiveDayWeather(response);
  })

  $.ajax({
    url: mainWeatherURL,
    method: "GET"
  }).then(function (response) {
    showMainWeather(response);
  })

  // Add city to array
  if (cities.indexOf(city) === -1) {
    cities.push(city);
  }

  saveCities();
  renderCities();

  // Separate code to get API for UV index
  $.getJSON(mainWeatherURL,
    function (data) {

      // Variables for getting lon/lat of city from the object data
      var lon = (data.coord.lon)
      var lat = (data.coord.lat)
      var apiUV = ("https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + lat + "&lon=" + lon)

      $.getJSON(apiUV,
        function (uvData) {

          var uvIndex = (uvData.value);
          $("#uvIndex").text(uvIndex);

        }
      )
    });
};

function init() {

  // Parsing the JSON to an object
  let storedCities = JSON.parse(localStorage.getItem("cities"));

  if (storedCities !== null) {
    cities = storedCities;
  }
}

function saveCities() {

  // Save cities into localStorage
  localStorage.setItem("cities", JSON.stringify(cities));
}

function showMainWeather(response) {

  // This displays the main weather report
  let cityName = response.name;
  let cityDate = moment().format('l');
  let cityIcon = response.weather[0].icon;
  let cityTemp = Math.round(response.main.temp);
  let cityHumid = response.main.humidity;
  let cityWind = Math.round(response.wind.speed);
  let cityCondition = response.weather[0].main;
  let cityIconEl = $("<img>").attr("src", `https://openweathermap.org/img/w/${cityIcon}.png`)
  $("#city-name").text(cityName + ' (' + cityDate + ')').append(cityIconEl);
  $("#city-temp").text(cityTemp);
  $("#city-humid").text(cityHumid);
  $("#city-wind").text(cityWind);
  $("#city-condition").text(cityCondition);

}

// This displays the 5-day weather report
function showFiveDayWeather(response) {

  // This clears 5-day forecast before getting updated
  $("#weeklyForecast").empty();
  for (let i = 6; i < 40; i += 8) {
    let cardDate = response.list[i].dt_txt;
    let date = new Date(cardDate).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    let cardTemp = Math.round(response.list[i].main.temp);
    let cardHumid = Math.round(response.list[i].main.humidity);
    let iconSource = response.list[i].weather[0].icon;

    let cardEl = $("<div>").attr("class", "card");
    let cardBodyEl = $("<div>").attr("class", "card-body five-card");
    let cardTitleEl = $("<h6>").attr("class", "card-title").text(date);
    let cardIcon = $("<img>").attr("src", `https://openweathermap.org/img/w/${iconSource}.png`);
    let cardTempEl = $("<p>").attr("class", "card-text").text(`Temp: ${cardTemp} °F`);
    let cardHumidEl = $("<p>").attr("class", "card-text").text(`Humidity: ${cardHumid}%`);
    cardEl.append(cardBodyEl);
    cardBodyEl.append(cardTitleEl).append(cardIcon).append(cardTempEl).append(cardHumidEl);
    $("#weeklyForecast").append(cardEl);
  }
}

function renderCities() {

  // Clear city names element before updating
  $("#city-list").empty();

  // Render names for each city
  cities.forEach(city => {

    let cityCard = $("<div>").attr("class", "card");
    let cityCardBody = $("<div>").attr("class", "card-body city").text(city);
    cityCard.append(cityCardBody);
    $("#city-list").prepend(cityCard);
  })
}

init();