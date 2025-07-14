import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getRandomUser(): Observable<any> {
    return this.http.get('https://randomuser.me/api?results=1').pipe(
      map((res: any) => res.results[0]),
      catchError(err => {
        console.error('Error fetching user', err)
        return throwError(() => new Error('Failed to fetch user'))
      })
    )
  }

  getCoordinates(city: string, latitude: number, longitude: number): Observable<{ latitude: number; longitude: number }> {
    console.log(city)
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
    return this.http.get<any>(url).pipe(
      map(res => {
        if (res && res.results && res.results.length > 0) {
          return {
            latitude: res.results[0].latitude,
            longitude: res.results[0].longitude
          }
        } else {
          console.log("Used coordinates from user API")
          return {
            latitude: latitude,
            longitude: longitude
          }
        }
      }),
      catchError(err => {
        console.error('Error fetching coordinates', err)
        return throwError(() => new Error('Failed to fetch coordinates'))
      })
    )
  }
}
