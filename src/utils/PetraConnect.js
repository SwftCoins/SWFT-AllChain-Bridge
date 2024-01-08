import { Notify } from 'vant'
import store from '../store/index'
const PetraConnectHandle = ($scope) => {
  //判断是否安装Phantom插件
  if (!window.aptos) {
    return Notify({
      color: '#ad0000',
      background: '#ffe1e1',
      message: $scope.$t('notInstallMetamask', {
        wallet: 'Petra',
      }),
    })
  }
  
  //创建链接
  connect($scope)
}
async function connect($scope) {
  const wallet = window.aptos;
  try {
      const response = await wallet.connect();

      const account = await wallet.account();
      if(account){
        $scope.wallet = 'Petra'
        store.commit('setChainId', '072611')
        store.commit('setWalletAddress', account.address)
        store.commit('setWalletName', 'Petra')
        store.commit('setWalletConnectType', 'Petra')
        $scope.$refs.dialog.show = false
        //存储钱包已连接
        localStorage.setItem('connectorId', 'Petra')
      }
    
  } catch (error) {
      // { code: 4001, message: "User rejected the request."}
  }
  // let resp = null
  // let publicKey = null
  // resp = await window.solana.connect()
  // publicKey = window.solana.publicKey.toBase58()
  // if (publicKey == null) {
  //   return Notify({
  //     color: '#ad0000',
  //     background: '#ffe1e1',
  //     message: $scope.$t('loginPhantom'),
  //   })
  // }

  // if (publicKey) {
  //   $scope.wallet = 'Phantom'
  //   store.commit('setChainId', '2021')
  //   store.commit('setWalletAddress', publicKey)
  //   store.commit('setWalletName', 'Phantom')
  //   store.commit('setWalletConnectType', 'Phantom')
  //   $scope.$refs.dialog.show = false
  //   //存储钱包已连接
  //   localStorage.setItem('connectorId', 'Phantom')
}
export default PetraConnectHandle
