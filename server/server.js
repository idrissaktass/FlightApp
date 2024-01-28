// src/server.js
const express = require('express');
const cors = require('cors');
const flightsData = require('./flightsData.json');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/flights', (req, res) => {
  res.json(flightsData.flights);
});

app.get('/cities', (req, res) => {
  const cities = flightsData.flights.reduce((acc, flight) => {
    if (!acc.includes(flight.departureCity)) {
      acc.push(flight.departureCity);
    }
    if (!acc.includes(flight.arrivalCity)) {
      acc.push(flight.arrivalCity);
    }
    // if (!acc.includes(flight.departureAirport)) {
    //   acc.push(flight.departureAirport);
    // }
    // if (!acc.includes(flight.arrivalAirport)) {
    //   acc.push(flight.arrivalAirport);
    // }
    return acc;
  }, []);
  res.json(cities);
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});