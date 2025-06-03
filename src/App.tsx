import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Consist from './pages/Consist';
import Locomotives from './pages/Locomotives';
import NewJob from './pages/NewJob';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/" exact component={Consist} />
          <Route path="/locomotives" component={Locomotives} />
          <Route path="/newjob" component={NewJob} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;
