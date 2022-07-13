
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import store from '../store/index'

//connector.killSession(); 断开连接
const walletConnectHandle = async ($scope,auto)=> {
    // Create a connector
    const connector = new WalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
        qrcodeModal: QRCodeModal
    });
    // Check if connection is already established
    if (!connector.connected) {
        if(auto === 'auto') return
        // 连接
        await connector.createSession();
        console.log('connector:::::::',connector)
    }else{
        //connector.killSession()
        //已连接
        console.log('已连接',connector.session)
        const { accounts, chainId ,peerMeta} = connector.session;
        store.commit('setWalletAddress',accounts[0])
        store.commit('setWalletName', 'walletConnect')
        store.commit('setWalletConnectType', 'walletConnect')
        store.commit('setChainId', chainId.toString())
        store.commit('setIsWalletConnect', true)
        //存储钱包已连接
        localStorage.setItem('connectorId', 'walletConnect')
        $scope.wallet = 'walletConnect'
    }
    // Subscribe to connection events
    connector.on("connect", (error, payload) => {
        if (error) {
        throw error;
        }
        // Get provided accounts and chainId
        console.log(payload)
        const { accounts, chainId ,peerMeta} = payload.params[0];
        console.log('钱包连接成功：：：：：',accounts,chainId,peerMeta.name)
        store.commit('setWalletAddress', accounts[0])
        store.commit('setWalletName', 'walletConnect')
        store.commit('setWalletConnectType', 'walletConnect')
        store.commit('setChainId', chainId.toString())
        store.commit('setIsWalletConnect', true)
        $scope.wallet = 'walletConnect'

        //存储钱包已连接
        localStorage.setItem('connectorId', 'walletConnect')
    });
    connector.on("session_update", (error, payload) => {
        if (error) {
        throw error;
        }
        console.log('session_update:::::::',payload)
    
        // Get updated accounts and chainId
        const { accounts, chainId } = payload.params[0];
    });
    //断开连接
    connector.on("disconnect", (error, payload) => {
        if (error) {
        throw error;
        }
        console.log('disconnect:::::::',$scope)
        $scope.$bus.emit('disConnect')
        store.commit('setIsWalletConnect', false)

        // Delete connector
    });
}
export default walletConnectHandle