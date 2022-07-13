import { Notify } from 'vant'
import store from '../store/index'
const BTCWalletConnectHandle = ($scope) => {
    //判断是否安装LiqualityWallet插件
    if(!window.bitcoin){
        return Notify({
            color: '#ad0000',
            background: '#ffe1e1',
            message: $scope.$t('notInstallMetamask', {
                wallet: 'Liquality Wallet',
            }),
        })
    }
    console.log('window.bitcoin:::',window.bitcoin)
    //创建链接
    if(store.state.wallet.connectType === 'LiqualityWallet'){
        return  $scope.$refs.dialog.show = false
    }
    console.log('LiqualityWallet连接')
    connect($scope)
}
async function connect($scope) {
    // const net =  await bitcoin.request({ method: 'wallet_getConnectedNetwork', params: [] })
    // console.log(net)
    const enable = await window.bitcoin.enable()
    const net =  await bitcoin.request({ method: 'wallet_getConnectedNetwork', params: [] })
    if(net.name !== 'bitcoin') {
        return Notify({
            color: '#ad0000',
            background: '#ffe1e1',
            message: $scope.$t('switchNetwork')
        })
    }
    console.log(net)
    if(enable){
        $scope.wallet = 'LiqualityWallet'
        store.commit('setWalletAddress', enable[0].address)
        store.commit('setWalletName', 'LiqualityWallet')
        store.commit('setWalletConnectType', 'LiqualityWallet')
        store.commit('setChainId', '1994')
        $scope.$refs.dialog.show = false
        //存储钱包已连接
        localStorage.setItem('connectorId', 'LiqualityWallet')
    }
    console.log('enable:::::', enable)
    // bitcoin.request({ method: 'eth_requestAccounts' })
    // .then(res => {
    //     $scope.wallet = 'LiqualityWallet'
    //     bitcoin.request({ method: 'eth_chainId' }).then((res) => {
    //         store.commit('setChainId', parseInt(res) + '')
    //     })
    //     store.commit('setWalletAddress', res[0])
    //     store.commit('setWalletName', 'LiqualityWallet')
    //     store.commit('setWalletConnectType', 'LiqualityWallet')
    //     $scope.$refs.dialog.show = false
    //     //存储钱包已连接
    //     localStorage.setItem('connectorId', 'LiqualityWallet')
    // })
    // .catch((err) => {
    //     $scope.$refs.dialog.show = false
    // });
}
export default BTCWalletConnectHandle