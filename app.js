// --- Server Initialization --- //
const express = require('express');
const cheerio = require('cheerio');
const app = express();
const path = require('path')
const puppeteer = require('puppeteer');
const port = process.env.PORT || 8888;
app.listen(port)
console.log('Server listening to: ', port)


//// -------- Endpoints -------- ////
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

app.get ('/search/D/:departureAirport/A/:arrivalAirport/DD/:departureDate/AD/:returnDepartureDate/PA/:aditionalPassengers', (req, res) =>{

    // --- Request Params --- //
    let depAirport = req.params.departureAirport
    let arrAirport = req.params.arrivalAirport
    let depDate = req.params.departureDate
    let retDate = req.params.returnDepartureDate
    let depMonth = getYearAndMonth(req.params.departureDate)
    let depDay = getDay(req.params.departureDate)
    let retMonth = getYearAndMonth(req.params.returnDepartureDate)
    let retDay = getDay(req.params.returnDepartureDate)
    let passengers = getPassengers(req.params.aditionalPassengers)

    let url = `https://www.norwegian.com/es/ipc/availability/avaday?AdultCount=${passengers.adults}&ChildCount=${passengers.kids}&InfantCount=${passengers.babies}&A_City=${arrAirport}&D_City=${depAirport}&D_Month=${depMonth}&D_Day=${depDay}&R_Month=${retMonth}&R_Day=${retDay}&IncludeTransit=true&TripType=2`
    let urlWizz =`https://wizzair.com/es-es/#/booking/select-flight/${depAirport}/${arrAirport}/${depDate}/${retDate}/${passengers.adults}/${passengers.kids}/${passengers.babies}/0/null`

    sendBestPrice(url, urlWizz, depAirport, arrAirport)

    // --- Response --- //

async function sendBestPrice(url, urlWizz, depAirport, arrAirport){
    let resultWizz = await getDataWizz(urlWizz, depAirport, arrAirport)
            .then((data) => {
                if(data === undefined){
                    setTimeout(getDataWizz(urlWizz), 300)
                    console.log('data undefined')
                }
                else {
                    return data
                }
            })


    let resultNor = await getData(url, depAirport, arrAirport)
            .then((data) => {
            if(data === undefined){
                setTimeout(getData(url), 300)
                console.log('data undefined')
            }
            else {
                return data
            }
        })
        await getBestPrice(resultNor, resultWizz)
                .then(
                (data) => {
                    if(data === NaN){
                        setTimeout(getBestPrice(resultNor, resultWizz), 300)
                        console.log('data undefined')
                    }
                    if(data === undefined || data.finalValue === null){
                        let noFlights = {
                            msg : "No hay resultados para tu búsqueda, prueba buscando otras fechas u otros destinos."
                        }
                        res.send(noFlights)
                    }
                    else {
                        res.send(data)
                    }    
                }
                )
            .catch( err => { console.log("Error in promise: ",  err); })
            }
})

//// -------- Scraping Functions -------- ////
async function getData(url, depAirport, arrAirport){

let dataNor = {
    airlineName : "Norwegian",
    urlAirline: url,
    departureAirport: depAirport,
    arrivalAirport: arrAirport,
    departureDate: null,
    departureTime: null,
    arrivalTime: null,
    airlineReturn: "Norwegian",
    returnDepartureAirport: arrAirport,
    returnArrivalAirport: depAirport,
    returnDate: null,
    returnDepartureTime: null,
    returnArrivalTime: null,
    finalValue: null
  }

    try {
        const goToUrl = async (url) => {
            const browser = await puppeteer.launch({
                headless : true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0')
            await page.goto(url);
            await sleep(20000);
            await page.screenshot({path: 'screenshot.png'});
           //setTimeout(
            const scrapeData = async (depAirport, arrAirport) => {
                const $ = cheerio.load(await page.content());
                //$("tbody .oddrow.rowinfo1 .arrdest div span").text()

                let depTime = $(".oddrow.rowinfo1 .depdest div").html()
                let depTimeSpan = $(".oddrow.rowinfo1 .depdest div span").text()
                let arrTime = $(".arrdest div").html()
                let arrTimeSpan = addScale(depTime, arrTime)
                let depPrice = parseFloat($(".content label").text().replace(/,/g, '.'))
                let arrPrice = parseFloat($("#avaday-inbound-result > div > div > div > div > table > tbody > tr > .fareselect.standardlowfare .content label").html().replace(/,/g, '.'))
                let depCity = $(".avadaytable > tbody > .oddrow.rowinfo2 > .depdest > .content").html()
                let arrCity = $(".avadaytable > tbody > .oddrow.rowinfo2 > .arrdest > .content").html()
                let depDate = $(".sectionboxavaday.avadayoutbound > .headerbox > .layouttable > tbody > tr > td").next().text()
                let retDate = $(".sectionboxavaday.avadayinbound > .headerbox > .layouttable > tbody > tr > td").next().text()
                let retDepTime = $(".sectionboxavaday.avadayinbound > .bodybox > .body > .avadaytable > tbody > tr > td > div").html()
                let retArrTime = $(".sectionboxavaday.avadayinbound > .bodybox > .body > .avadaytable > tbody > tr > .arrdest > div").text()
                let retArrTimeSpan = addScale(retDepTime, retArrTime)

                function addScale(dep, arr){
                    let depHour = dep.substring(0,2)
                    let arrHour = arr.substring(0,2)
                    if(arrHour < depHour){
                        let oneScale = "+1"
                        return oneScale
                    }
                    else{
                        let noScale = ""
                        return noScale
                    }
                }

                await page.screenshot({path: 'screenshot.png'});

                dataNor.departureAirport = `${depCity}`;
                dataNor.arrivalAirport = `${arrCity}`;
                dataNor.departureDate = depDate;
                dataNor.departureTime = `${depTime}`;
                dataNor.arrivalTime = `${arrTime}${arrTimeSpan}`;
                dataNor.returnDepartureAirport = `${depTime}`;
                dataNor.returnArrivalAirport = `${arrCity}`;
                dataNor.returnDate = retDate;
                dataNor.returnDepartureTime = retDepTime;
                dataNor.returnArrivalTime = `${retArrTime.substring(0,5)}${retArrTimeSpan}`;
                dataNor.finalValue = depPrice + arrPrice;
                await browser.close();
                return dataNor
            }
            await scrapeData();

        }
        await goToUrl(url)
    } catch (err) {
        console.error(err);
    }
    await sleep(5000);
    return (dataNor);
}

async function getDataWizz(urlWizz, depAirport, arrAirport) {
    let dataWizz = {
        airlineName: "Wizz Air",
        urlAirline: urlWizz,
        departureAirport: depAirport,
        arrivalAirport: arrAirport,
        departureDate: null,
        departureTime: null,
        arrivalTime: null,
        airlineReturn: "Wizz Air",
        returnDepartureAirport: arrAirport,
        returnArrivalAirport: depAirport,
        returnDate: null,
        returnDepartureTime: null,
        returnArrivalTime: null,
        finalValue: null
    }
    try {
        const goToUrlWizz = async (urlWizz) => {
                const browser = await puppeteer.launch({
                    headless : true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                const page = await browser.newPage();
                await page.goto(urlWizz);
                await sleep(90000);
                const scrapeData = async () => {
                    const $= cheerio.load(await page.content());

                    let depCity= $('#outbound-fare-selector .flight-select__flight-info__time .station').html();
                    let arrCity= $('#outbound-fare-selector .flight-select__flight-info__time .station.align-right').html();
                    let departureDate= $('#outbound-fare-selector .flight-select__flight-info__details .flight-select__flight-info__day').html();
                    let departureTime= $('#outbound-fare-selector .flight-select__flight-info__time .hour').html();
                    let arrivalTime= $('#outbound-fare-selector .flight-select__flight-info__times :nth-child(3) span').html();
                    let arrTimeSpan = addScale(departureTime, arrivalTime)
                    let returnDepartureAirport= $('#return-fare-selector .flight-select__flight-info__time .station').html();
                    let returnArrivalAirport= $('#return-fare-selector .flight-select__flight-info__time .station.align-right').html();
                    let returnDate= $('#return-fare-selector .flight-select__flight-info__details .flight-select__flight-info__day').html();
                    let returnDepartureTime= $('#return-fare-selector .flight-select__flight-info__time .hour').html();
                    let returnArrivalTime= $('#return-fare-selector .flight-select__flight-info__times :nth-child(3) span').html();
                    let retArrTimeSpan = addScale(returnDepartureTime, returnArrivalTime)
                    let depPrice = parseFloat($('#outbound-fare-selector .fare-type-button__title.fare-type-button__title--active span').html().replace(/,/g, '.').substring(16, 21));
                    let arrPrice = parseFloat($('#return-fare-selector .fare-type-button__title.fare-type-button__title--active span').html().substring(16, 21).replace(/,/g, '.'));

                    function addScale(dep, arr){
                        let depHour
                        let arrHour
                        if (dep.length < 5 ){
                            depHour = dep.substring(0,1)
                        }
                        else if (arr.length < 5){
                            arrHour = arr.substring(0,1)
                        }
                        else{ depHour = dep.substring(0,2)
                            arrHour = arr.substring(0,2)
                        }

                        if(arrHour < depHour){
                            let oneScale = "+1"
                            return oneScale
                        }
                        else{
                            let noScale = ""
                            return noScale
                        }
                    }


                        dataWizz.departureAirport = depCity;
                        dataWizz.arrivalAirport = arrCity;
                        dataWizz.departureDate=  departureDate;
                        dataWizz.departureTime=  departureTime;
                        dataWizz.arrivalTime=  `${arrivalTime}${arrTimeSpan}`;
                        dataWizz.returnDepartureAirport= returnDepartureAirport;
                        dataWizz.returnArrivalAirport=  returnArrivalAirport;
                        dataWizz.returnDate=  returnDate;
                        dataWizz.returnDepartureTime=  returnDepartureTime;
                        dataWizz.returnArrivalTime=  `${returnArrivalTime}${retArrTimeSpan}`;
                        dataWizz.finalValue = parseFloat((depPrice + arrPrice).toFixed(2));
                        await browser.close();
                        return dataWizz
                    }
                    await scrapeData();

                }
                await goToUrlWizz(urlWizz)
            } catch (err) {
                console.error(err);
            }
            await sleep(5000);
            return (dataWizz);
}

//// -------- Handler Functions -------- ////
        /* --- Date Functions --- */

function getYearAndMonth(date){
    let year = date.substring(0,4)
    let month = date.substring(5,7)
    let result = year + month
    return result
  }

function getDay(date){
    let result = date.substring(8,10)
    return result
}
        /* --- Passengers Functions --- */

function getPassengers(passengers){
    let str = passengers
    let all = str.split("-");
    let babies = []
    let kids = []
    let adults = []
    let noPassanger = []


        for (i = 0; i < all.length; i++){

           if (all[i] == 0){
               noPassanger.push(all[i])
           }
            else if (all[i] < 2){
                babies.push(all[i])
            }
            else if (all[i] > 1 && all [i] < 12){
                kids.push(all[i])
            }
            else {
                adults.push(all[i])
            }
        }

        let passengersPerAge = {
            babies : `${babies.length}`,
            kids : `${kids.length}`,
            adults : `${adults.length}`,
            noOne : noPassanger.length
        }
            return passengersPerAge
}

        /* --- Best Price Functions --- */
async function getBestPrice (result1,result2){
    if(result1 === undefined || result1 === null || result1.finalValue === undefined || result1.finalValue === null ){
      return result2
    }
    else if(result2 === undefined ||result2 === null || result2.finalValue === undefined || result2.finalValue === null){
      return result1
    }
    else if(result1.finalValue === undefined && result2.finalValue === undefined){
        return false
    }
    else if(result1.finalValue === result2.finalValue){
        let twoOptions = [result1, result2]
        return twoOptions
    }
    else {
      let minValue = Math.min(result1.finalValue, result2.finalValue)

      switch (minValue) {
          case result1.finalValue:
            await new Promise (r => setTimeout(r, 1000) )
            return result1
            break;
          case result2.finalValue:
            await new Promise (r => setTimeout(r, 1000) )
            return result2
            break;
          default:
            await console.log('default');
        }

    }
  }
        /* --- Sleep Functions --- */

function sleep(miliseconds) {
    return new Promise((resolve, reject) => setTimeout(resolve, miliseconds))
}
