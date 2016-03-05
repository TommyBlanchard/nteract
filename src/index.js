import React from 'react';
import ReactDOM from 'react-dom';

import createStore from './store';
import { reducers } from './reducers';
import Provider from './components/util/provider';
import Notebook from './components/notebook';

import {
  setNotebook,
  newKernel,
  save,
  saveAs,
  killKernel,
} from './actions';
import { initKeymap } from './actions/keymap';
import { ipcRenderer as ipc } from 'electron';

ipc.on('main:load', (e, launchData) => {
  const { store, dispatch } = createStore({
    notebook: null,
    selected: [],
    filename: launchData.filename
  }, reducers);
  initKeymap(window, dispatch);

  ipc.on('menu:new-kernel', (e, name) => dispatch(newKernel(name)));
  ipc.on('menu:save', () => dispatch(save()));
  ipc.on('menu:save-as', (e, fn) => dispatch(saveAs(fn)));
  ipc.on('menu:kill-kernel', () => dispatch(killKernel()));

  class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
      store.subscribe(state => this.setState(state));
    }
    componentDidMount() {
      dispatch(setNotebook(launchData.notebook));
    }
    render() {
      return (
        <Provider rx={{ dispatch, store }}>
          <div>
            {
              this.state.err &&
              <pre>{this.state.err.toString()}</pre>
            }
            {
              this.state.notebook &&
              <Notebook
                selected={this.state.selected}
                notebook={this.state.notebook}
                channels={this.state.channels} />
            }
          </div>
        </Provider>
      );
    }
  }

  App.displayName = 'App';

  ReactDOM.render(
    <App/>,
    document.querySelector('#app')
  );
});