import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { Button, Col, Form, FormControl, FormGroup, FormLabel, Row } from 'react-bootstrap';
import CloseButton from 'react-bootstrap/CloseButton';


const FlightSearch = () => {
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [arrivalDate, setArrivalDate] = useState('')
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOneWay, setIsOneWay] = useState(false);
  const [searched, setSearched] = useState(false);
  const [departureCities, setDepartureCities] = useState([]);
  const [arrivalCities, setArrivalCities] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showResults, setShowResults] = useState(false);
  const [showClearDepartureCity, setShowClearDepartureCity] = useState(false);
  const [showClearArrivalCity, setShowClearArrivalCity] = useState(false);
  const [showClearDepartureDate, setShowClearDepartureDate] = useState(false);
  const [showClearReturnDate, setShowClearReturnDate] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('http://localhost:3001/cities');
        const cities = response.data;
        setDepartureCities(cities);
        setArrivalCities(cities);
      } catch (error) {
        console.error('Failed to fetch cities.', error);
      }
    };

    fetchCities();
  }, []);

  const searchFlights = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/flights', {
        params: {
          departure: departureCity,
          arrival: arrivalCity,
          departureDate,
          departureAirport: departureCity,
          arrivalAirport: arrivalCity,
          arrivalDate
        },
      });
      setFlights(response.data);
      const departureCities = response.data.map(flight => flight.departureCity);
      const arrivalCities = response.data.map(flight => flight.arrivalCity);
      const departureDates = response.data.map(flight => flight.departureDate);
  
      console.log("Departure Cities:", departureCities);
      console.log("Arrival Cities:", arrivalCities);
      console.log("Departure Dates:", departureDates);
    } catch (error) {
      console.error('There is no flight.', error);
    } finally {
      setLoading(false);
      setSearched(true);
      setShowResults(true);
    }
  };

  useEffect(() => {
    if (departureCity && arrivalCity && departureDate && (isOneWay || (!isOneWay && returnDate))) {
     searchFlights()
    }
  }, [departureCity, arrivalCity, departureDate, returnDate, isOneWay]);

  const validateInputs = () => {
    if (!departureCity || !arrivalCity || !departureDate || (!isOneWay && !returnDate)) {
      alert('Please enter all required information.');
      return false;
    }
    return true;
  };

  const filterFlights = () => {
    if (!departureCity && !arrivalCity && !departureDate && !returnDate) {
      return [];
    }
    const directFlights = flights.filter((flight) => {
      const isDepartureMatch =
        !departureCity ||
        flight.departureCity.toLowerCase() === departureCity.toLowerCase() ||
        flight.departureAirport.toLowerCase() === departureCity.toLowerCase();
      const isArrivalMatch =
        !arrivalCity ||
        flight.arrivalCity.toLowerCase() === arrivalCity.toLowerCase() ||
        flight.arrivalAirport.toLowerCase() === arrivalCity.toLowerCase();

      const isDepartureDateMatch =
        !departureDate ||
        new Date(flight.departureDate).toLocaleDateString() ===
          new Date(departureDate).toLocaleDateString();
  
      return isDepartureMatch && isArrivalMatch && isDepartureDateMatch;
    });
  
    const returnFlights = !isOneWay
      ? flights.filter((flight) => {
          const isDepartureMatch =
            !arrivalCity ||
            flight.departureCity.toLowerCase() === arrivalCity.toLowerCase() ||
            flight.departureAirport.toLowerCase() === arrivalCity.toLowerCase();
          const isArrivalMatch =
            !departureCity ||
            flight.arrivalCity.toLowerCase() === departureCity.toLowerCase() ||
            flight.arrivalAirport.toLowerCase() === departureCity.toLowerCase();
  
          const isDepartureDateMatch =
            !returnDate ||
            new Date(flight.departureDate).toLocaleDateString() ===
              new Date(returnDate).toLocaleDateString();
  
          return isDepartureMatch && isArrivalMatch && isDepartureDateMatch;
        })
      : [];
  
    return { directFlights, returnFlights };
  };

  const resetSearch = () => {
    setFlights([]);
    setSearched(false);
    setShowResults(false);
  };

  const handleDepartureCityChange = (value) => {
    setDepartureCity(value);
    if (!value) {
      resetSearch();
      setShowResults(false);
    }
  };

  const handleArrivalCityChange = (value) => {
    setArrivalCity(value);
    if (!value) {
      resetSearch();
      setShowResults(false);
    }
  };

  const clearInputField = (inputType) => {
    switch (inputType) {
      case 'departureCity':
        setDepartureCity('');
        setShowClearDepartureCity(false);
        break;
      case 'arrivalCity':
        setArrivalCity('');
        setShowClearArrivalCity(false);
        break;
      case 'departureDate':
        setDepartureDate('');
        setShowClearDepartureDate(false);
        break;
      case 'returnDate':
        setReturnDate('');
        setShowClearReturnDate(false);
        break;
      default:
        break;
    }
  
    setShowResults(false);
  };
  
  const sortFlights = (flightsToSort) => {
    if (!Array.isArray(flightsToSort)) {
      return [];
    }
  
    const sortedFlights = [...flightsToSort];
    return sortedFlights.sort((a, b) => {
      const aValue = getSortableValue(a);
      const bValue = getSortableValue(b);
  
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };
  
  const getSortableValue = (flight) => {
    switch (sortCriteria) {
      case 'price':
        return flight.price;
      case 'departureDate':
        return new Date(flight.departureDate);
      case 'duration':
        return getDurationInMinutes(flight.duration);
      default:
        return 0;
    }
  };
  
  const getDurationInMinutes = (duration) => {
    const [hours, minutes] = duration.split('h ').map((value) => parseInt(value, 10));
    return hours * 60 + minutes;
  };

  const handleSortChange = (criteria) => {
    if (sortCriteria === criteria) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCriteria(criteria);
      setSortOrder('asc');
    }
  };
  
  const { directFlights, returnFlights } = filterFlights();
  const sortedDirectFlights = sortFlights(directFlights);
  const sortedReturnFlights = sortFlights(returnFlights);

  const renderFlightsList = (flights, header) => {
    return (
      <>
        <Col lg={isOneWay || sortedReturnFlights.length === 0 ? 9 : 6}>
          {flights.length > 0 && (isOneWay || returnDate) && (
            <div>
              <hr className='mb-4 mt-4 flights-line'/>
              <div className='d-flex justify-content-center'>
                <h4 className='mt-1 flights-header'>{header}</h4>
              </div>
              <ul className='results-list'>
                {flights.map((flight) => (
                  <div key={flight.id} className='flight-details-container'>
                    <div className='d-flex justify-content-center'>
                  </div>
                  <li className='mb-4 mt-2' key={flight.id}>
                  <div className='d-flex align-items-center justify-content-center'>
                    <div className='d-block justify-content-center'>
                      ({flight.departureAirport})
                      <hr className = "m-2"/>
                      <div className='d-flex align-items-end'>
                        <svg className='results-svg' style={{fill:"#00b5ff"}} width="30px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M381 114.9L186.1 41.8c-16.7-6.2-35.2-5.3-51.1 2.7L89.1 67.4C78 73 77.2 88.5 87.6 95.2l146.9 94.5L136 240 77.8 214.1c-8.7-3.9-18.8-3.7-27.3 .6L18.3 230.8c-9.3 4.7-11.8 16.8-5 24.7l73.1 85.3c6.1 7.1 15 11.2 24.3 11.2H248.4c5 0 9.9-1.2 14.3-3.4L535.6 212.2c46.5-23.3 82.5-63.3 100.8-112C645.9 75 627.2 48 600.2 48H542.8c-20.2 0-40.2 4.8-58.2 14L381 114.9zM0 480c0 17.7 14.3 32 32 32H608c17.7 0 32-14.3 32-32s-14.3-32-32-32H32c-17.7 0-32 14.3-32 32z"/></svg> 
                        <div>
                        {flight.departureDate}    
                        </div>
                      </div>
                    </div>
                      <div className='d-flex align-items-center mx-3'>
                      <svg className='results-svg'style={{fill:"#00b5ff"}} width="30px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg> 
                      <div>
                        {flight.duration}
                      </div>
                      </div>
                      <div className='d-block justify-content-center'>
                      ({flight.arrivalAirport})
                      <hr className = "m-2"/>
                      <div className='d-flex align-items-end'>
                      <svg className='results-svg'style={{fill:"#00b5ff"}} width="30px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M.3 166.9L0 68C0 57.7 9.5 50.1 19.5 52.3l35.6 7.9c10.6 2.3 19.2 9.9 23 20L96 128l127.3 37.6L181.8 20.4C178.9 10.2 186.6 0 197.2 0h40.1c11.6 0 22.2 6.2 27.9 16.3l109 193.8 107.2 31.7c15.9 4.7 30.8 12.5 43.7 22.8l34.4 27.6c24 19.2 18.1 57.3-10.7 68.2c-41.2 15.6-86.2 18.1-128.8 7L121.7 289.8c-11.1-2.9-21.2-8.7-29.3-16.9L9.5 189.4c-5.9-6-9.3-14.1-9.3-22.5zM32 448H608c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32zm96-80a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm128-16a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>    
                      <div className>
                      {flight.arrivalDate}
                      </div>
                      </div>
                    </div>
                      </div>
                    <div className='d-flex align-items-center justify-content-center mt-4 mb-3'>
                      <div className='d-flex align-items-end'>
                      <svg className='results-svg' style={{fill:"#00b5ff"}} width="30px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M482.3 192c34.2 0 93.7 29 93.7 64c0 36-59.5 64-93.7 64l-116.6 0L265.2 495.9c-5.7 10-16.3 16.1-27.8 16.1l-56.2 0c-10.6 0-18.3-10.2-15.4-20.4l49-171.6L112 320 68.8 377.6c-3 4-7.8 6.4-12.8 6.4l-42 0c-7.8 0-14-6.3-14-14c0-1.3 .2-2.6 .5-3.9L32 256 .5 145.9c-.4-1.3-.5-2.6-.5-3.9c0-7.8 6.3-14 14-14l42 0c5 0 9.8 2.4 12.8 6.4L112 192l102.9 0-49-171.6C162.9 10.2 170.6 0 181.2 0l56.2 0c11.5 0 22.1 6.2 27.8 16.1L365.7 192l116.6 0z"/></svg> 
                      <div className = 'results-info'>
                      {flight.airline} 
                      </div>
                      </div>
                      <div className='d-flex align-items-center'>
                      <svg className='results-svg'style={{fill:"#00b5ff"}} width="30px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M345 39.1L472.8 168.4c52.4 53 52.4 138.2 0 191.2L360.8 472.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L438.6 325.9c33.9-34.3 33.9-89.4 0-123.7L310.9 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM0 229.5V80C0 53.5 21.5 32 48 32H197.5c17 0 33.3 6.7 45.3 18.7l168 168c25 25 25 65.5 0 90.5L277.3 442.7c-25 25-65.5 25-90.5 0l-168-168C6.7 262.7 0 246.5 0 229.5zM144 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg> 
                      <div className = 'results-info'>
                      {flight.price}$
                        </div>
                      </div>
                    </div>
                  </li>
                  </div>            
                ))}
              </ul>
            </div>
          )}
        </Col>
      </>
    );
  };

  return (
    <Row className='container mb-5 justify-content-center'>
      <div className='col-sm-10 search-flight pt-3 pb-5 px-5 d-block mb-5 mt-5'>
        <h2 className='mb-5'>Search Flight</h2>
        <div className='col d-flex gap-4 align-items-center justify-content-center'>
          <div className='d-flex gap-1'>
            <FormGroup className="position-relative">
              <FormControl
                type="text"
                value={departureCity}
                onChange={(e) => handleDepartureCityChange(e.target.value)}
                placeholder='From'
                list="departureCities"
                required
              />
              {departureCity && (
                <CloseButton
                className="position-absolute top-50 end-0 translate-middle-y"
                onClick={() => clearInputField('departureCity')}
              />
              )}
              <datalist id="departureCities">
                {departureCities.map((city, index) => (
                  <option key={index} value={city} />
                ))}
              </datalist>
            </FormGroup>
            <FormGroup className="position-relative">
              <FormControl
                type="text"
                value={arrivalCity}
                onChange={(e) => handleArrivalCityChange(e.target.value)}
                placeholder='To'
                list="arrivalCities"
                required
              />
              {arrivalCity && (
                <CloseButton
                className="position-absolute top-50 end-0 translate-middle-y"
                onClick={() => clearInputField('arrivalCity')}
              />
              )}
              <datalist id="arrivalCities">
                {arrivalCities.map((city, index) => (
                  <option key={index} value={city} />
                ))}
              </datalist>
            </FormGroup>

          </div>
          <div className='d-flex gap-2'>
            <div className='date-form'>
             <FormGroup>
                <DatePicker
                  selected={departureDate}
                  onChange={(date) => setDepartureDate(date)}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Departure Date"
                  required
                  className='date-picker'
                />
                {departureDate && (
                  <CloseButton
                    onClick={() => clearInputField('departureDate')}
                  />
                )}
              </FormGroup>
            </div>
            <FormGroup>
              <div className='date-form'>
                <DatePicker
                    selected={returnDate}
                    onChange={(date) => setReturnDate(date)}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Return Date"
                    disabled={!departureDate || isOneWay}
                    className='date-picker'
                  />
                  {returnDate && (
                    <CloseButton
                      onClick={() => clearInputField('returnDate')}
                    />
                  )}

              </div>
            </FormGroup>
          </div>
            <Form.Check
              type="checkbox"
              label="One Way"
              checked={isOneWay}
              onChange={() => setIsOneWay(!isOneWay)}
            />
        </div>  
      </div>
      {showResults && searched && (
        <div className='col-sm-12 results pb-4 px-5 d-block mb-5'>
          <div className="d-flex justify-content-end gap-1">
            <Button className='sorting-button' variant="outline-secondary" onClick={() => handleSortChange('price')}>
              {sortCriteria === 'price' && sortOrder === 'asc' && '▲'}
              {sortCriteria === 'price' && sortOrder === 'desc' && '▼'} 
              {sortCriteria === 'price' ? ('Sorted by Price') :('Sort by Price')}
            </Button>
            <Button className='sorting-button' variant="outline-secondary" onClick={() => handleSortChange('departureDate')}>
              {sortCriteria === 'departureDate' && sortOrder === 'asc' && '▲'}
              {sortCriteria === 'departureDate' && sortOrder === 'desc' && '▼'} 
              {sortCriteria === 'departureDate' ? ('Sorted by Departure') : ('Sort by Departure Time')}
            </Button>
            <Button className='sorting-button' variant="outline-secondary" onClick={() => handleSortChange('duration')}>
              {sortCriteria === 'duration' && sortOrder === 'asc' && '▲'}
              {sortCriteria === 'duration' && sortOrder === 'desc' && '▼'} 
              {sortCriteria === 'duration' ? ('Sorted by Duration')  : ('Sort by Duration')}
            </Button>
          </div>
            <Row className='d-flex justify-content-center'>
              {renderFlightsList(sortedDirectFlights, `${departureCity} to ${arrivalCity}`)}
              {renderFlightsList(sortedReturnFlights, `${arrivalCity} to ${departureCity}`)}
            </Row>
        </div>
      )}
    </Row>
  );
};

export default FlightSearch;
