const WEB = 'https://www.kiwi.com/es/'

async function scrape() {
  // Config Puppeteer
  const puppeteer = require('puppeteer')
  const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox']})
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto(WEB, {waitUntil: 'networkidle2'})


  await search_journeys(page);
  await find_cities(page);
  //await browser.close()
}

async function search_journeys(page){
  // DOM selectors
  const SEARCHER_FROM_SELECTOR          = '.OneWayReturnForm-form .origin input'
  const SEARCHER_TO_SELECTOR            = '.OneWayReturnForm-form .destination input'
  const SEARCHER_SUGGESTIONS_SELECTOR   = '.ModalPicker .places-list > div:first-child'
  const SEARCHER_BTN_SELECTOR           = ".OneWayReturnForm > button"
    
  const ORIGIN_JOURNEY = 'Madrid'
  const DESTINATION_JOURNEY = 'Cualquier destino'
  
  // FROM
  await page.click(SEARCHER_FROM_SELECTOR)
  await page.waitFor(1000)
  await page.keyboard.press('Backspace')
  await page.keyboard.press('Backspace')
  await page.waitFor(1000)
  await page.keyboard.type(ORIGIN_JOURNEY)
  await page.waitFor(2000)
  await page.click(SEARCHER_SUGGESTIONS_SELECTOR)

  // TO
  await page.click(SEARCHER_TO_SELECTOR)
  await page.waitFor(1000)
  await page.keyboard.type(DESTINATION_JOURNEY)
  await page.waitFor(2000)
  await page.click(SEARCHER_SUGGESTIONS_SELECTOR)

  // SEARCH
  await page.click(SEARCHER_BTN_SELECTOR)

}

async function find_cities(page) {
  const CITY_ITEM_SELECTOR = '.PictureCardsLayout .PictureCard'  
  await page.waitForSelector(CITY_ITEM_SELECTOR)

  await page.click('.SearchResultsView-sortAggregateSwitch .LinkBtn')
  await page.waitForSelector(CITY_ITEM_SELECTOR)

  const result = await page.evaluate(() => {
    const LIST_CITY_SELECTOR             = '.PictureCard'
    let elements = document.querySelectorAll(LIST_CITY_SELECTOR)
    elements[0].click();
  })

  find_flights(page)
}

async function find_flights(page) {
  const JOURNEY_ITEM_SELECTOR = '.ResultList-results .Journey'  
  await page.waitForSelector(JOURNEY_ITEM_SELECTOR)

  const result = await page.evaluate(() => {
      const LIST_JOURNEY_SELECTOR             = '.Journey-overview'
      const JOURNEY_PRICE_SELECTOR            = '.JourneyInfo .price'
      const JOURNEY_DEPARTURE_TIME_SELECTOR   = '.JourneyTrips .Trip:nth-child(1) .TripInfoField:nth-child(2) .TripInfoField-time'
      const JOURNEY_DEPARTURE_DATE_SELECTOR   = '.JourneyTrips .Trip:nth-child(1) .TripInfoField:nth-child(2) .TripInfoField-date'
      const JOURNEY_DESTINATION_SELECTOR      = '.JourneyTrips .Trip:nth-child(1) .TripInfoField:nth-child(3) .TripInfoField-airport-codes .to .name'
      const JOURNEY_RETURN_TIME_SELECTOR      = '.JourneyTrips .Trip:nth-child(2) .TripInfoField:nth-child(2) .TripInfoField-time'
      const JOURNEY_RETURN_DATE_SELECTOR      = '.JourneyTrips .Trip:nth-child(2) .TripInfoField:nth-child(2) .TripInfoField-date'

      let data = []
      let elements = document.querySelectorAll(LIST_JOURNEY_SELECTOR)

      for (var element of elements){
          let price = element.querySelector(JOURNEY_PRICE_SELECTOR).innerText
          let departure_time = element.querySelector(JOURNEY_DEPARTURE_TIME_SELECTOR).innerText
          let departure_date = element.querySelector(JOURNEY_DEPARTURE_DATE_SELECTOR).innerText
          let destination = element.querySelector(JOURNEY_DESTINATION_SELECTOR).innerText
          let return_time = element.querySelector(JOURNEY_RETURN_TIME_SELECTOR).innerText
          let return_date = element.querySelector(JOURNEY_RETURN_DATE_SELECTOR).innerText
          data.push({
                price: price, 
                destination: destination,
                departure_time: departure_time,
                departure_date: departure_date,
                return_time: return_time,
                return_date: return_date,
              })
      }

      return data
  })
  console.log(result)
}

scrape()