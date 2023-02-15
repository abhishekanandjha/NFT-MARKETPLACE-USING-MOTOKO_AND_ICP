import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { Principal } from "@dfinity/principal";

//these below line show are use to avoid the login flow bec it require deployment
//for simplicity sake we are using the default user
const CURRENT_USER_ID = Principal.fromText("2vxsx-fae");
export default CURRENT_USER_ID;

const init = async () => {
  ReactDOM.render(<App />, document.getElementById("root"));
};

init();
