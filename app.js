const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
module.exports = app;
const dbPath = path.join(__dirname, `covid19India.db`);
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () => {
      console.log("Server running at http://localhost:4000/");
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
  };
};

//API 1
app.get("/states/", async (request, response) => {
  const getStateQuery = `
    SELECT * 
    FROM
    state;`;
  const stateArray = await db.all(getStateQuery);
  response.send(
    stateArray.map((eachstate) => convertDbObjectToResponseObject(eachState))
  );
});
