import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { getFirebaseConfig } from "./components/utils/firebaseConfig";
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import HomePage from './pages/HomePage';
import DashBoard from './pages/DashBoard';
import AboutUs from './components/AboutUs';
import DeletePhotos from './components/admin/DeletePhotos';
import DeleteVideos from './components/admin/DeleteVideos';

// Firebase stuff ( Important )
const { storage, app } = getFirebaseConfig();

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <HomePage storage={storage} app={app} />
        </Route>

        <Route path="/dashboard" exact>
          <DashBoard storage={storage} app={app} />
        </Route>

        <Route path="/contactpage" exact component={AboutUs} />

        <Route path="/deletevideos" exact>
          <DeleteVideos storage={storage} app={app} />
        </Route>

        <Route path="/deletephotos" exact>
          <DeletePhotos storage={storage} app={app} />
        </Route> 
      </Switch>
    </Router>

  );
}

export default App;