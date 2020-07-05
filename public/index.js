"use strict"

let arrayPassengers = []


function searchFlights(petition){

  fetch(petition, { method : 'GET'})
    .then(response => response.json())
    .then((data) => {
      if (data.msg){

        document.getElementById('modalWaiting').style.visibility = "hidden"
        document.getElementById('modalWaiting').style.opacity = "0"
        document.getElementById('notFound').style.visibility = "visible"
        document.getElementById('notFound').style.opacity = "100"
        document.getElementById('closeNotFound').addEventListener('click', ()=>{
        location.href = '#';
        document.getElementById('notFound').style.visibility = "hidden"
        document.getElementById('notFound').style.opacity = "0"
        })
      console.log(data.msg)
      }
      else{
      console.log("La data que llega a front: ", data)
      location.href = '#';
      document.getElementById('modalWaiting').style.visibility = "hidden"
      document.getElementById('modalWaiting').style.opacity = "0"
      document.getElementById('response').style.display = "flex"
      renderResult(data, arrayPassengers)
    }
    })
  }

// ------------ RENDER VIEW FUNCTION ------------ //

function renderResult(data, arrayPassengers) {

  let imgDep= document.getElementById("imgDeparture")
  let imgArr= document.getElementById("imgArrival")
  let airlineArrival = document.getElementById("btnArrival")
  let airlineReturn= document.getElementById("btnDeparture")
  let departureAirport = document.getElementById("labelDeparture")
  let arrivalAirport = document.getElementById("labelArrival")
  let departureDate = document.getElementById("labelDepartureDate")
  let departureTime = document.getElementById("departureTime")
  let arrivalTime = document.getElementById("arrivalTime")
  let returnDepartureAirport = document.getElementById("labelReturnDA")
  let returnArrivalAirport = document.getElementById("labelReturnAA")
  let returnDate = document.getElementById("labelReturnDate")
  let returnDepartureTime = document.getElementById("returnDepartureTime")
  let returnArrivalTime = document.getElementById("returnArrivalTime")
  let finalValue = document.getElementById("labelPrice")
  let passengersNum = document.getElementById("labelPassengers")

  airlineArrival.href= data.urlAirline
  airlineReturn.href= data.urlAirline
  departureAirport.innerHTML = data.departureAirport
  arrivalAirport.innerHTML = data.arrivalAirport
  departureDate.innerHTML = data.departureDate
  departureTime.innerHTML = data.departureTime
  arrivalTime.innerHTML = data.arrivalTime
  returnDepartureAirport.innerHTML = data.returnDepartureAirport
  returnArrivalAirport.innerHTML = data.returnArrivalAirport
  returnDate.innerHTML = data.returnDate
  returnDepartureTime.innerHTML = data.returnDepartureTime
  returnArrivalTime.innerHTML = data.returnArrivalTime
  finalValue.innerHTML = `${data.finalValue} €`
  passengersNum.innerHTML = arrayPassengers.length
  document.getElementById('response').style.display = "flex"

  if(data.airlineName  && data.airlineReturn === "Wizz Air"){
      imgDep.src = "images/wizz-logo.png",
      imgArr.src = "images/wizz-logo2.png"
  }
  else {
      imgDep.src = "images/norwegian-logo.png",
      imgArr.src = "images/norwegian-logo2.png"
  }
}

function LabelAges(){
  document.getElementById("label-ages").innerHTML = "Selecciona sus edades";
}

function callResponse(){
  var x = document.getElementById("response");
  if (x.style.display === "none") {
    x.style.display = "flex";
    location.href = '#response';
  } else {
    x.style.display = "none";
  }
 }

// ------------ AIRPORTS INPUTS FUNCTIONS ------------ //

function getDepartureAirport(){
  let returnDepartureAirport= document.getElementById("departureOptions").addEventListener('click', (e) => {
    let option = e.target.value
    search1.value= option
    let text = e.target.textContent
    search1.placeholder = text
    document.getElementById("departureOptions").style.display = "none";
    })
  return returnDepartureAirport;
}

function getArrivalAirport(){
  let returnArrivalAirport = document.getElementById("arrivalOptions").addEventListener('click', (e) => {
    let option = e.target.value
    search2.value = option
    let text = e.target.text
    arrOptions.placeholder = text
    document.getElementById("arrivalOptions").style.display = "none";
  })
  return returnArrivalAirport;
}
getArrivalAirport()
getDepartureAirport()

/// SELECT DEPARTURE & ARRIVAL ///
const cities = [];
const search1 = document.querySelector("#departureAirport");
const depOptions = document.querySelector('#departureOptions');
const search2 = document.querySelector('#arrivalAirport');
const arrOptions = document.querySelector('#arrivalOptions');

// -- DEPARTURE -- //
fetch('./airport.json')
  .then(data => data.json())
  .then(data => {
      cities.push(...data)
  });

function findMatches(wordToMatch, cities) {
  wordToMatch = wordToMatch.split(",");
  return cities.filter(place => {
    if (wordToMatch.length === 1) {
      const regex = new RegExp(wordToMatch[0], 'gi');
      return (place.city.match(regex) || place.iata.match(regex));
    } else {
      const regex0 = new RegExp(wordToMatch[0], 'gi');
      const regex1 = new RegExp(wordToMatch[1].substr(1, wordToMatch[1].length), 'gi');
      return (place.city.match(regex0) && place.iata.match(regex1));
    }
  });
}

function displayMatches(e) {
  const html = findMatches(e.target.value, cities).map(place => {
    if (place.iata !== "" ){
      return `<option value="${place.iata}"id="${place.iata}">${place.city}, ${place.iata}</option>`
    }
  }).join('');
  depOptions.style.display = "block";
  depOptions.innerHTML = html;
}

search1.addEventListener('keyup', (e) => displayMatches(e));

// -- ARRIVAL -- //
const cities2 = [];
fetch('./airport.json')
  .then(data => data.json())
  .then(data => {
    cities2.push(...data)
  });

function findMatches2(wordToMatch, cities2) {
  wordToMatch = wordToMatch.split(",");
  return cities2.filter(place => {
    if (wordToMatch.length === 1) {
      const regex = new RegExp(wordToMatch[0], 'gi');
      return (place.city.match(regex) ||
        place.iata.match(regex));
    } else {
      const regex0 = new RegExp(wordToMatch[0], 'gi');
      const regex1 = new RegExp(wordToMatch[1].substr(1, wordToMatch[1].length), 'gi');
      return (place.city.match(regex0) &&
        place.iata.match(regex1));
    }
  });
}

function displayMatches2(e) {
  const html2 = findMatches2(e.target.value, cities).map(place => {
    if (place.iata !== "" ){
      return `<option value="${place.iata}"id="${place.iata}">${place.city}, ${place.iata}</option>`
    }
  }).join('');
  arrOptions.style.display = "block";
  arrOptions.innerHTML = html2;
}
search2.addEventListener('keyup', (e) => displayMatches2(e));

function functDir(){
  if(document.getElementById('selectDir').value == "departure") {
    document.getElementById("returnDepartureDateDiv").style.display = "none";
  }
  else{
    document.getElementById("returnDepartureDateDiv").style.display = "flex";
  }
}


// -------------- DATES INPUTS FUNCTIONS ------------- //

function getDepartureDate(){
  let departureDate = document.getElementById('departureDate').value;
    return departureDate
};

function getReturnDepartureDate(){
  if (document.getElementById('selectDir').value == "departure"){
    let returnDepartureDate = null;
    return returnDepartureDate
  }
  else {
  let returnDepartureDate = document.getElementById('returnDepartureDate').value;
    return returnDepartureDate
  }

};

// ------------ PASSENGERS INPUTS FUNCTIONS ------------ //

let passengersNumber = document.getElementById('passengersPax')
let passengers = document.getElementById('passengersPax').addEventListener('change', passengersPerAge)
let labelAges = document.getElementById('passengersPax').addEventListener('change', LabelAges)

function deleteChilds () {
  let div = document.getElementById('passengersAge');
    while (div.firstChild) {
          div.removeChild(div.firstChild);
    }
}

function passengersPerAge() {
  let passengersPax = passengersNumber.value
    deleteChilds()
    renderAgeOptions(passengersPax)
}

function renderAgeOptions(passengersPax){
  function generatePassengersOptions(value, content){
    let newPassengerDiv = document.createElement('option')
    if(value === "1"){
      newPassengerDiv.setAttribute("value", "1")
      newPassengerDiv.text = "Bebé (de 0 a 23 meses)"
      return newPassengerDiv
    }
    else{
      newPassengerDiv.setAttribute("value", value)
      newPassengerDiv.text = content
      return newPassengerDiv
    }
  }
  let j = 0
  let x = 0
  for (x = 0; x < passengersPax ; x++){
    let newDiv = document.createElement('div')
    newDiv.innerHTML = `<select name="passengerAge" id="passengersAge${x}" required></select>`
    document.getElementById('passengersAge').appendChild(newDiv)
    drawPassengers(x)
    document.getElementById(`passengersAge${x}`).appendChild(generatePassengersOptions("","Ingrese la edad del pasajero"))


    if(x == 0){
      for(j = 18; j < 100; j++) {
        document.getElementById(`passengersAge${x}`).appendChild(generatePassengersOptions(j.toString(),j.toString()))
      }
    }else{
      document.getElementById(`passengersAge${x}`).appendChild(generatePassengersOptions("1","Bebé (de 0 a 23 meses)"))
        for(j = 2; j < 100; j++) {
          document.getElementById(`passengersAge${x}`).appendChild(generatePassengersOptions(j.toString(),j.toString()))
        }
    }
  }

  function drawPassengers(x){
    let passenger = document.getElementById(`passengersAge${x}`)
    passenger.addEventListener('change', () =>{
    let newPassengerAge = document.createElement('p')
    newPassengerAge.setAttribute("value", x)
    newPassengerAge.setAttribute("id", x)
    if(passenger.value == 1 || passenger.value.length > 2){
      newPassengerAge.innerHTML = `Pasajero nº ${x+1}: Bebé (de 0 a 23 meses)`
      document.getElementById('selectedPassengers').appendChild(newPassengerAge)
      arrayPassengers.push(`${passenger.value}`)
      console.log("estoy en el if", passenger.value)
    }
    else{
      newPassengerAge.innerHTML = `Pasajero nº ${x+1}: ${passenger.value} años`
      document.getElementById('selectedPassengers').appendChild(newPassengerAge)
      arrayPassengers.push(`${passenger.value}`)
    }
    })
    }
    return j
  }

 function setPassengers() {
    location.href = '#modal';
    var x = document.getElementById("0");
    if (x!==null) {
      let passengersPreviewDiv = document.getElementById("passengersPreview");
      passengersPreviewDiv.style.display = "none";
      document.getElementById("selectedPassengers").innerHTML="";
      deleteChilds()
    }
}


// ----------- MODAL WINDOW ----------- //

let btnPassengers = document.getElementById('btn-modal')
    btnPassengers.addEventListener('click', (e) =>{
    e.preventDefault()
    location.href = '#modal';
})

function closeModal(){
  location.href = '#';
  let passengersPreviewDiv = document.getElementById("passengersPreview");
  passengersPreviewDiv.style.display = "block";
};

function closeModalVisible(){
    document.getElementById("close").innerHTML = "ACEPTAR";
 };
console.log(getDepartureDate())


// ----------- VALIDATION FUNCTIONS ----------- //

function sendRequest() {

  // ------ waiting modal window ------ //
  location.href = '#waiting'
  document.getElementById('modalWaiting').style.visibility = "visible"
  document.getElementById('modalWaiting').style.opacity = "100"

  let departureAirport = document.getElementById('departureAirport').value
  let arrivalAirport = document.getElementById('arrivalAirport').value

  let departureDate = getDepartureDate()
  let returnDepartureDate = getReturnDepartureDate()
  
  let aditionalPassengers = writePassengers(arrayPassengers)
  function writePassengers(arrayPassengers){
    let i
    let passengersUrl
    let result = ""
      for (i=0; i < arrayPassengers.length - 1; i++){
        result += `${arrayPassengers[i].toString()}-`
        console.log(result)
      }
      result += `${arrayPassengers[i].toString()}`
      return result
  }
  let petition = `/search/D/${departureAirport}/A/${arrivalAirport}/DD/${departureDate}/AD/${returnDepartureDate}/PA/${aditionalPassengers}`
  searchFlights(petition, aditionalPassengers)
}


function checkDate(dateOrNot) {
  let regexDate = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
  if (!regexDate.test(dateOrNot)){
      return false;
  }
  else{
    return true;
  }
}

let search = document.getElementById('searchForm')
search.addEventListener("submit", e => {
  departureDate.style.border = "none"
  returnDepartureDate.style.border = "none"
  document.getElementById('btn-modal').style.border = "none"
  e.preventDefault()
  let warnings = ""
  let entrar = false
  let n = 0
  let passengerExist = document.getElementById(`${n}`)

  if (!checkDate(departureDate.value)) {
    warnings += `Introduce una fecha de ida válida: DD/MM/AAAA <br>`
    entrar = true
    departureDate.valueAsDate = null
    departureDate.style.border = "solid gold"
    console.log(departureDate.value)
    console.log("tipo", typeof departureDate.value)
  }
  else if (!checkDate(returnDepartureDate.value)) {
    warnings += `Introduce una fecha de vuelta válida: DD/MM/AAAA <br>`
    entrar = true
    returnDepartureDate.valueAsDate = null
    returnDepartureDate.style.border = "solid gold"
    console.log(returnDepartureDate.value)
  }
  else if (departureAirport.value === arrivalAirport.value) {
    warnings += `El aeropuerto de origen debe ser distinto del de destino`
    entrar = true
}
  else if (passengerExist === null) {
    warnings += `Seleccione al menos un pasajero <br>`
    entrar = true
    document.getElementById('btn-modal').style.border = "solid gold"
  }
  let parrafo = document.getElementById('mensajeValidar')
  if (entrar) {
      parrafo.innerHTML = warnings
  } else {
      sendRequest()
  }
})
