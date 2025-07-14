import { Component, OnInit } from '@angular/core'
import { UserService } from './services/userService'
import { WeatherService } from './services/weatherService'
import { switchMap } from 'rxjs/operators'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [CommonModule],
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  public user: any
  public weatherData: any

  public errorUserRequestMessage?: string
  public errorWeatherRequestMessage?: string
  public errorCoordinatesRequestMessage?: string
  public minDailyTemperature: number | undefined
  public maxDailyTemperature: number | undefined
  public weatherCode: number | undefined
  public weatherIconUrl: string | undefined;
  public weatherDescription: string | undefined
  
  constructor(
    private userService: UserService,
    private weatherService: WeatherService
  ) {}

  ngOnInit(): void {
    this.loadUserWithWeather()
  }
  
  getWeatherIconUrl(weatherCode: number): string {
    let iconCode: string;
    const dayNightSuffix = this.weatherData.current_weather.is_day === 1 ? 'd' : 'n';

    if (weatherCode >= 0 && weatherCode <= 3) {
        iconCode = '01' + dayNightSuffix; this.weatherDescription = "Clear / Mostly clear"
    } else if (weatherCode === 45 || weatherCode === 48) { 
        iconCode = '50' + dayNightSuffix; this.weatherDescription = "Fog"
    } else if ((weatherCode >= 51 && weatherCode <= 55) || (weatherCode >= 61 && weatherCode <= 65) || (weatherCode >= 80 && weatherCode <= 82)) { // Дощ
        iconCode = '10' + dayNightSuffix; this.weatherDescription = "Rain"
    } else if ((weatherCode >= 71 && weatherCode <= 75) || weatherCode === 77 || (weatherCode >= 85 && weatherCode <= 86)) { 
        iconCode = '13' + dayNightSuffix; this.weatherDescription = "Snow"
    } else if ((weatherCode >= 56 && weatherCode <= 57) || (weatherCode >= 66 && weatherCode <= 67)) { 
        iconCode = '09' + dayNightSuffix; this.weatherDescription = "Freezing Drizzle / Freezing Rain"
    } else if ((weatherCode >= 95 && weatherCode <= 99)) { 
        iconCode = '11' + dayNightSuffix; this.weatherDescription = "Thunderstorm"
    } else {
        iconCode = '01' + dayNightSuffix; 
    }
    
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

  loadUserWithWeather(): void {
    this.user = undefined
    this.weatherData = undefined
    this.errorUserRequestMessage = undefined
    this.errorCoordinatesRequestMessage = undefined
    this.errorWeatherRequestMessage = undefined

    this.userService.getRandomUser()
      .pipe(
        switchMap(user => {
          this.user = user
          return this.userService.getCoordinates(user.location.city, user.location.coordinates.latitude, user.location.coordinates.longitude)
        }),
        switchMap(coords => {
          return this.weatherService.getWeather(coords.latitude, coords.longitude)
          
        })
      )
      .subscribe({
        next: weather => {
          this.weatherData = weather
          console.log(weather)
          this.minDailyTemperature = Math.min(...this.weatherData.hourly.temperature_2m)
          this.maxDailyTemperature = Math.max(...this.weatherData.hourly.temperature_2m)
          this.weatherIconUrl = this.getWeatherIconUrl(this.weatherData.current_weather.weathercode)
        },
        error: (error) => {
          const msg = error.message || 'Unknown error'
          if (msg.includes('user')) this.errorUserRequestMessage = msg
          else if (msg.includes('coordinates')) this.errorCoordinatesRequestMessage = msg
          else this.errorWeatherRequestMessage = msg
        }
      })
  }
}

