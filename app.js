const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
module.exports = app;

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT
      *
    FROM
     state
    `;
  const stateArray = await db.all(getStatesQuery);
  response.send(
    stateArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
      SELECT *
      FROM 
      state
      WHERE state_id=${stateId};`;
  const state = await db.get(getStateQuery);
  const stateArray = {
    stateId: state.state_id,
    stateName: state.state_name,
    population: state.population,
  };
  response.send(stateArray);
});

//API 3
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  console.log(districtDetails);
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const addDistrictQuery = `
  INSERT INTO district( districtName,
    stateId,
    cases,
    cured,
    active,
    deaths)
    VALUES(
       '${districtName}',${stateId},${cases},${cured},${active},${deaths}
    );`;
  const dbResponse = await db.run(addDistrictQuery);
  //console.log(dbResponse);
  const districtId = dbResponse.lastID;
  response.send("District Successfully Added");
});

//API 4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
      SELECT *
      FROM 
      district
      WHERE district_id=${districtId};`;
  const district = await db.get(getDistrictQuery);
  response.send(
    districtArray.map((eachDistrict) =>
      convertDbObjectToResponseObject(eachDistrict)
    )
  );
});

//API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM
      district
    WHERE
      district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API 6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  //console.log(districtDetails);
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictQuery = `
    UPDATE
      district
    SET
       districtName ='${district_name}',
       stateId = ${state_id},
       cases= ${cases},
       cured= ${cured},
       active= ${active},
       deaths =${deaths}
    WHERE
      district_id = ${districtId};`;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateStatusQuery = `
      SELECT 
        SUM(cases),
        SUM(cured),
        SUM(active),
        SUM(deaths)
      FROM 
      district
      WHERE state_id=${stateId};`;
  const status = await db.get(getStateStatusQuery);
  response.send({
    totalCases: status.SUM(cases),
    totalCured: status.SUM(cured),
    totalActive: status.SUM(active),
    totalDeaths: status.SUM(deaths),
  });
});

//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { district_id } = request.params;
  const getDistrictIdQuery = `
      select 
        state_id 
      from 
        district
      where 
        district_id = ${districtId};`;
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);

  const getStateNameQuery = `
    select 
      state_name as stateName 
    from 
      state
    where 
      state_id = ${getDistrictIdQueryResponse.state_id};`;
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
});
