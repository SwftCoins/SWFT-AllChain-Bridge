// import PlenaConnect from '@plenaconnect/client'
// import QRCodeModal from '@plenaconnect/qrcode-modal'
// import store from '../store/index'

// const PlenaConnectHandle = async ($scope, auto, name) => {
//   const connector = new PlenaConnect({
//     bridge: 'https://bridge.plena.finance/', // Required
//     qrcodeModal: QRCodeModal,
//     clientMeta: {
//       name: 'SWFT ALLChain Bridge',
//       description:
//         'One-stop cross-chain platform: Cross-chain swap Aggregator, Cross-chain Bridge, DEX for BTC, ETH, BSC, TRON, XRPL, SOL, etc.',
//       url: 'https://defi.swft.pro/#/',
//       icons: ['https://images.swft.pro/dex/SWFT.png'],
//     },
//   })
//   // Check if connection is already established
//   if (!connector.connected) {
//     if (auto === 'auto') return
//     // 连接
//     await connector.createSession()
//   } else {
//     //connector.killSession()
//     //已连接
//     const { accounts, chainId, peerMeta } = connector.session
//     store.commit('setWalletAddress', accounts[0])
//     store.commit('setWalletName', name)
//     store.commit('setWalletConnectType', 'Plena')
//     store.commit('setChainId', chainId.toString())
//     store.commit('setIsPlenaConnect', true)
//     //存储钱包已连接
//     localStorage.setItem('connectorId', name)
//     $scope.wallet = name
//   }
//   // Subscribe to connection events
//   connector.on('connect', (error, payload) => {
//     if (error) {
//       throw error
//     }
//     // Get provided accounts and chainId
//     const { accounts, chainId, peerMeta } = payload.params[0]
//     store.commit('setWalletAddress', accounts[0])
//     store.commit('setWalletName', name)
//     store.commit('setWalletConnectType', 'Plena')
//     store.commit('setChainId', chainId.toString())
//     store.commit('setIsPlenaConnect', true)
//     $scope.wallet = name
//     //存储钱包已连接
//     localStorage.setItem('connectorId', name)
//   })

//   connector.on('session_update', (error, payload) => {
//     if (error) {
//       throw error
//     }

//     // Get updated accounts and chainId
//     const { accounts, chainId } = payload.params[0]
//   })
//   //断开连接
//   connector.on('disconnect', (error, payload) => {
//     if (error) {
//       throw error
//     }
//     $scope.$bus.emit('disConnect')
//     store.commit('setIsPlenaConnect', false)
//   })
// }
// export default PlenaConnectHandle
