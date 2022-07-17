import React, { Component } from 'react'
import Web3 from 'web3'
import Token from '../abis/Token.json'
import EthSwap from '../abis/EthSwap.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'
import canteen from '../img/canteen.png'
import events from '../img/events.png'
import fees from '../img/fees.jpg'
import library from '../img/library.png'
import socities from '../img/socities.png'
import stationary from '../img/stationary.png'

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })

    // Load Token
    const networkId = await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if (tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({ token })
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      // this.setState({ tokenBalance: tokenBalance.toString() })
    } else {
      window.alert('Token contract not deployed to detected network.')
    }

    // Load EthSwap
    const ethSwapData = EthSwap.networks[networkId]
    if (ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      this.setState({ ethSwap })
    } else {
      window.alert('EthSwap contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if (this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}
                <div className='pay_here'>
                  <h1>PAY HERE YOUR VARIOUS FEES</h1>
                </div>


              </div>

            </main>

          </div>
          <div className='row'>
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '70%', minHeight: '120px', display: 'flex', flexDirection: 'row' }}>
              <div className='row_img' style={{ height: '100%', width: 'calc(100%/6)', marginLeft: '2px', marginRight: '2px' }}><img src={fees} style={{ height: '100px' }} alt="fees_image" /></div>
              <div className='row_img' style={{ height: '100%', width: 'calc(100%/6)', marginLeft: '2px', marginRight: '2px' }}><img src={canteen} style={{ height: ' 100px' }} alt="canteen_image" /></div>
              <div className='row_img' style={{ height: '100%', width: 'calc(100%/6)', marginLeft: '2px', marginRight: '2px' }}><img src={events} stule={{ height: '10px' }} alt="event_image" /></div>
              <div className='row_img' style={{ height: '100%', width: 'calc(100%/6)', marginLeft: '2px', marginRight: '2px' }}><img src={library} stule={{ height: '10px' }} alt="library_image" /></div>
              <div className='row_img' style={{ height: '100%', width: 'calc(100%/6)', marginLeft: '2px', marginRight: '2px' }}><img src={socities} stule={{ height: '10px' }} alt="socities_image" /></div>
              <div className='row_img' style={{ height: '100%', width: 'calc(100%/6)', marginLeft: '2px', marginRight: '2px' }}><img src={stationary} stule={{ height: '10px' }} alt="stationary_image" /></div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
