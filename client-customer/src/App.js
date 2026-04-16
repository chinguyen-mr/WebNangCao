import "./App.css";
import React, { Component } from "react";
import Main from "./components/MainComponent";
import { BrowserRouter } from "react-router-dom";
import MyProvider from "./contexts/MyProvider";
import ErrorBoundary from "./components/ErrorBoundary";

class App extends Component {
  render() {
    return (
      <ErrorBoundary>
        <MyProvider>
          <BrowserRouter>
            <Main />
          </BrowserRouter>
        </MyProvider>
      </ErrorBoundary>
    );
  }
}

export default App;
