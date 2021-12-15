import React, { Component } from 'react';
import { connect } from 'react-redux';
import './App.css';

import Navbar from './navbar';
import Content from './content';

import { contractsLoadedSelector } from '../store/selectors';


import { 
loadWeb3, 
loadAccount,
loadToken,
loadExchange, } 
from '../store/interactions';





class App extends Component {
  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch)
    await web3.eth.net.getNetworkType()
    const networkId = await web3.eth.net.getId()
    await loadAccount(web3, dispatch)
    const token = await loadToken(web3, networkId, dispatch)
    loadExchange(web3, networkId, dispatch)
  }

  render() {
    
    return (
      <div>
        <Navbar/>
        { this.props.contractsLoaded ? <Content /> : <div className="content"></div> }
        
      </div>
    );
  }
}

function mapStateToProps(state) {
  
  return {
    contractsLoaded: contractsLoadedSelector(state)
  }
}
export default connect(mapStateToProps)(App);