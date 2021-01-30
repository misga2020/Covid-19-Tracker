import React, { useState, useEffect } from 'react';
import './App.css';
import { FormControl, Select, MenuItem, Card, CardContent } from '@material-ui/core';
import InfoBox from "./InfoBox";
import Table from "./Table"
import  Map  from "./Map";

import { sortData, prettyPrintStat } from "./util";
import LineGraph from './LineGraph';
import numeral from "numeral";
import 'leaflet/dist/leaflet.css'

function App() {
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [countries, setCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCountries, setMapCountries] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat: 32.80746, lng: -40.4796});
  const [mapZoom, setMapZoom] = useState(3);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    });

    
  }, []);
  
  
  useEffect(() => {
    const getCountriesData =  async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
          name: country.country,
          value: country.countryInfo.iso2

        }));
        const sortedData = sortData(data);
        setTableData(sortedData);
        setCountries(countries);
        setMapCountries(data);
        

      })

    };
    getCountriesData();

  }, []);
  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    
    const url = countryCode === "Worldwide" ? "https://disease.sh/v3/covid-19/all" : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode);
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    });

  };
  return (
    <div className="app">
      <div className="app_left">
      <div className="app_header">
      <h1>Covid-19 Tracker</h1>
      <FormControl className="app_dropdown">
        <Select 
        variant="outlined" 
        onChange={onCountryChange} 
        value={country}
        >
          <MenuItem value="worldwide">Worldwide</MenuItem>
          {countries.map((country) => (
          <MenuItem value={country.value}>{country.name}</MenuItem>
          ))}
        
        
        </Select>

      </FormControl>
      </div>
      <div className="app_stats">
        <InfoBox 
        onClick={(e) => setCasesType("cases")}
        title="Coronavirus Cases" 
        isRed
        active={casesType === "cases"}
        cases={prettyPrintStat(countryInfo.todayCases)} 
        total={numeral(countryInfo.cases).format("0.0a")}
        />
        <InfoBox 
        onClick={(e) => setCasesType("recovered")}
        title="Recovered" 
        active={casesType === "recovered"}
        cases={prettyPrintStat(countryInfo.todayRecovered)}
        total={numeral(countryInfo.recoverd).format("0.0a")}
        
        />
        <InfoBox 
        onClick={(e) => setCasesType("deaths")}
        title="Deaths" 
        isRed
        active={casesType === "deaths"}
        cases={prettyPrintStat(countryInfo.todayDeaths)}
        total={numeral(countryInfo.deaths).format("0.0a")}
        
         />

      </div>
      <Map 
      countries={mapCountries}
      casesType={casesType}
      center={mapCenter}
      zoom={mapZoom}
      />
      </div>
      
      <Card className="app_right">
        <CardContent>
          <div className="app_information">
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3>Worldwide new {casesType}</h3>
          <LineGraph casesType={casesType} />
          </div>
        </CardContent>

       </Card>

      
    </div>
   
  
  );
}

export default App;
