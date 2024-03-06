import { Notify } from 'vant'
import store from '../store/index'
import { connect, disconnect, getConnectedAddress } from "@joyid/evm"
const JoyIDConnectHandle = ($scope) => {
  //创建链接
  if (store.state.wallet.connectType === 'JoyID') {
    return ($scope.$refs.dialog.show = false)
  }
//   //监听链变化
//   window.echoooEth.on('chainChanged', (chainId) => {
//     //过滤当前非window.echoooEth连接
//     if (store.state.wallet.connectType !== 'JoyID') return
//     connect($scope)
//   })
//   //监听账户变化
//   window.echoooEth.on('accountsChanged', (accounts) => {
//     if (store.state.wallet.connectType !== 'JoyID') return
//   })
  connectHd($scope)
}
async function connectHd($scope) {
    try {
        const res = await getConnectedAddress() || await connect();
        $scope.wallet = 'JoyIDWallet'
        // window.echoooEth.request({ method: 'eth_chainId' }).then((res) => {
        //     store.commit('setChainId', parseInt(res) + '')
        // })
        store.commit('setChainId', '1')
        store.commit('setWalletAddress', res)
        store.commit('setWalletName', 'JoyIDWallet')
        store.commit('setWalletConnectType', 'JoyIDWallet')
        $scope.$refs.dialog.show = false
        //存储钱包已连接
        localStorage.setItem('connectorId', 'JoyIDWallet')
      } catch (error) {
        $scope.$refs.dialog.show = false
      }
//   window.echoooEth
//     .request({ method: 'eth_requestAccounts' })
//     .then((res) => {
//       $scope.wallet = 'JoyID'
//       window.echoooEth.request({ method: 'eth_chainId' }).then((res) => {
//         store.commit('setChainId', parseInt(res) + '')
//       })
//       store.commit('setWalletAddress', res[0])
//       store.commit('setWalletName', 'JoyID')
//       store.commit('setWalletConnectType', 'JoyID')
//       $scope.$refs.dialog.show = false
//       //存储钱包已连接
//       localStorage.setItem('connectorId', 'JoyID')
//     })
//     .catch((err) => {
//       $scope.$refs.dialog.show = false
//     })
}
export default JoyIDConnectHandle
