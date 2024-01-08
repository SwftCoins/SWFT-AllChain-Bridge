import WalletConnect from '@walletconnect/client'
import QRCodeModal from '@walletconnect/qrcode-modal'
import store from '../store/index'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
const walletConnectHandle = async ($scope, auto, name) => {
  console.log(name)
  const WalletConnectProvider = await EthereumProvider.init(
    name == 'imToken' ? store.getters.EthereumProviderInitImtoken : store.getters.EthereumProviderInit,
  )
  if (WalletConnectProvider.session) {
    const accounts = await WalletConnectProvider.request({
      method: 'eth_accounts',
    })

    store.commit('setWalletAddress', accounts[0])
    store.commit('setWalletName', name)
    store.commit('setChainId', '1')
    store.commit('setWalletConnectType', 'walletConnect')
    store.commit('setIsWalletConnect', true)
    $scope.wallet = 'walletConnect'
    localStorage.setItem('connectorId', 'walletConnect')
    $scope.$refs.dialog.show = false
    if (name == 'imToken' || localStorage.getItem('connectorId') == 'imToken') {
      $scope.wallet = 'imToken'
      store.commit('setWalletConnectType', 'imToken')
      localStorage.setItem('connectorId', 'imToken')
    }
    return
  }
  WalletConnectProvider.connect().then(() => {
    const accounts = WalletConnectProvider.accounts[0]
    const chainId = WalletConnectProvider.chainId
    store.commit('setWalletAddress', accounts)
    store.commit('setWalletName', name)
    store.commit('setWalletConnectType', 'walletConnect')
    store.commit('setChainId', chainId.toString())
    store.commit('setIsWalletConnect', true)
    $scope.wallet = name
    //   //存储钱包已连接
    localStorage.setItem('connectorId', name)
    $scope.$refs.dialog.show = false
    if (name == 'imToken') {
      $scope.$refs.imtokenQR.$refs.dialogImtoken.show = false
      store.commit('setWalletConnectType', 'imToken')
    }
  })

  WalletConnectProvider.on('session_update', (payload) => {
    console.log('session_update:::::::', payload)
    // Get updated accounts and chainId
  })
  WalletConnectProvider.on('display_uri', (handler) => {
    store.commit('setWalletConnect_uri', handler)
    console.log('display_uri' + handler)
  })
  WalletConnectProvider.on('accountsChanged', (payload) => {
    // const accounts = payload.accounts[0]
    store.commit('setWalletAddress', payload[0])
  })
  WalletConnectProvider.on('chainChanged', (payload) => {
    console.log(parseInt(payload) + "")
    store.commit('setChainId', parseInt(payload) + "")
  })
  //断开连接
  WalletConnectProvider.on('disconnect', (payload) => {
    $scope.$bus.emit('disConnect')
    store.commit('setIsWalletConnect', false)
    // Delete connector
  })
  //////////////////////////////////////////////////
  //connector.killSession(); 断开连接
  // Create a connector
  // const connector = new WalletConnect({
  //   bridge: 'https://bridge.walletconnect.org', // Required
  //   qrcodeModal: QRCodeModal,
  // })
  // // Check if connection is already established
  // if (!connector.connected) {
  //   if (auto === 'auto') return
  //   // 连接
  //   await connector.createSession()
  // } else {
  //   //connector.killSession()
  //   //已连接
  //   const { accounts, chainId, peerMeta } = connector.session
  //   store.commit('setWalletAddress', accounts[0])
  //   store.commit('setWalletName', name)
  //   store.commit('setWalletConnectType', 'walletConnect')
  //   store.commit('setChainId', chainId.toString())
  //   store.commit('setIsWalletConnect', true)
  //   //存储钱包已连接
  //   localStorage.setItem('connectorId', name)
  //   $scope.wallet = name
  // }
  // // Subscribe to connection events
  // connector.on('connect', (error, payload) => {
  //   if (error) {
  //     throw error
  //   }
  //   // Get provided accounts and chainId
  //   const { accounts, chainId, peerMeta } = payload.params[0]
  //   store.commit('setWalletAddress', accounts[0])
  //   store.commit('setWalletName', name)
  //   store.commit('setWalletConnectType', 'walletConnect')
  //   store.commit('setChainId', chainId.toString())
  //   store.commit('setIsWalletConnect', true)
  //   $scope.wallet = name
  //   //存储钱包已连接
  //   localStorage.setItem('connectorId', name)
  // })
  // connector.on('session_update', (error, payload) => {
  //   if (error) {
  //     throw error
  //   }
  //   // Get updated accounts and chainId
  //   const { accounts, chainId } = payload.params[0]
  // })
  // //断开连接
  // connector.on('disconnect', (error, payload) => {
  //   if (error) {
  //     throw error
  //   }
  //   $scope.$bus.emit('disConnect')
  //   store.commit('setIsWalletConnect', false)
  // })
}
export default walletConnectHandle
