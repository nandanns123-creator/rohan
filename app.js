class WeatherApp {
    constructor() {
        this.apiKey = "YOUR_API_KEY_HERE";
        this.cityInput = document.getElementById("cityInput");
        this.searchBtn = document.getElementById("searchBtn");
        this.weatherDisplay = document.getElementById("weatherDisplay");
        this.forecastContainer = document.getElementById("forecast");
        this.recentContainer = document.getElementById("recentSearches");
        this.clearBtn = document.getElementById("clearHistory");

        this.recentSearches = [];

        this.init();
    }

    init() {
        this.searchBtn.addEventListener("click", () => {
            const city = this.cityInput.value.trim();
            if (town) this.getWeather(town);
        });

        this.clearBtn.addEventListener("click", () => this.clearHistory());

        this.loadRecentSearches();
        this.loadLastCity();
    }

    async getWeather(city) {
        try {
            const currentRes = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${this.apiKey}`
            );
            const currentData = await currentRes.json();

            if (currentData.cod !== 200) {
                alert("City not found");
                return;
            }

            const forecastRes = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${this.apiKey}`
            );
            const forecastData = await forecastRes.json();

            this.displayWeather(currentData);
            this.displayForecast(forecastData);

            this.saveRecentSearch(city);

        } catch (error) {
            console.error(error);
        }
    }

    displayWeather(data) {
        this.weatherDisplay.innerHTML = `
            <h2>${data.name}</h2>
            <h3>${data.main.temp}°C</h3>
            <p>${data.weather[0].description}</p>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
        `;
    }

    displayForecast(data) {
        this.forecastContainer.innerHTML = "";

        const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        daily.slice(0, 5).forEach(day => {
            const card = document.createElement("div");
            card.classList.add("forecast-card");

            card.innerHTML = `
                <p>${new Date(day.dt_txt).toLocaleDateString()}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p>${day.main.temp}°C</p>
            `;

            this.forecastContainer.appendChild(card);
        });
    }

    saveRecentSearch(city) {
        city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

        this.recentSearches = this.recentSearches.filter(c => c !== city);
        this.recentSearches.unshift(city);

        if (this.recentSearches.length > 5) {
            this.recentSearches.pop();
        }

        localStorage.setItem("recentSearches", JSON.stringify(this.recentSearches));
        localStorage.setItem("lastCity", city);

        this.displayRecentSearches();
    }

    loadRecentSearches() {
        const stored = localStorage.getItem("recentSearches");
        this.recentSearches = stored ? JSON.parse(stored) : [];
        this.displayRecentSearches();
    }

    displayRecentSearches() {
        this.recentContainer.innerHTML = "";

        this.recentSearches.forEach(city => {
            const btn = document.createElement("button");
            btn.textContent = city;
            btn.classList.add("recent-btn");
            btn.addEventListener("click", () => this.getWeather(city));
            this.recentContainer.appendChild(btn);
        });
    }

    loadLastCity() {
        const lastCity = localStorage.getItem("lastCity");
        if (lastCity) {
            this.getWeather(lastCity);
        }
    }

    clearHistory() {
        localStorage.removeItem("recentSearches");
        localStorage.removeItem("lastCity");
        this.recentSearches = [];
        this.displayRecentSearches();
    }
}

new WeatherApp();
