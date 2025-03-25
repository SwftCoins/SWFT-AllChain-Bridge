//钱包列表
const walletList = [
  {
    name: 'MetaMask',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'TokenPocket',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM,TRON',
  },
  {
    name: 'Bitget',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM,TRON',
  },
  {
    name: 'Ellipal',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'imToken',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM,TRON',
  },
  {
    name: 'MathWallet',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'Petra',
    address: '',
    isEVM: false,
    bridgersWallet: true,
    type: 'Aptos',
  },
  {
    name: 'MSafe',
    address: '',
    isEVM: false,
    bridgersWallet: true,
    type: 'Aptos',
  },
  {
    name: 'CoinbaseWallet',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'HyperPay',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'EchoooWallet',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'ONTO',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'TronLink',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'TRON',
  },
  {
    name: 'DOT',
    address: '',
    type: 'Polkadot',
  },
  {
    name: 'CRU',
    address: '',
    type: 'CRU',
  },
  {
    name: 'iToken',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'walletConnect',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'Nabox',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'OKExWallet',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'BitpieWallet',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM,TRON',
  },
  {
    name: 'Phantom',
    address: '',
    type: 'SOL',
  },
  // {
  //   name: 'TerraStation',
  //   address: '',
  //   type: 'LUNA',
  // },
  // {
  //   name: 'LiqualityWallet',
  //   address: '',
  //   type: 'BTC',
  // },
  {
    name: 'TrustWallet',
    address: '',
    type: 'EVM',
  },
  {
    name: 'XUMM',
    address: '',
    type: 'XRP',
  },
  // {
  //   name: 'HareWallet',
  //   address: '',
  //   isEVM: true,
  //   bridgersWallet: true,
  // },
  {
    name: 'LeafWallet',
    address: '',
    type: 'EOS',
  },
  {
    name: 'MPCWallet',
    address: '',
    type: 'EVM',
  },
  {
    name: 'OneKey',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'Halo',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'Coin98',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'OpenBlock',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'CLVWallet',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'AuroxWallet',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'DBC',
    address: '',
    type: 'DBC',
  },
  {
    name: 'Valora',
    address: '',
    type: 'EVM',
  },
  {
    name: 'Crypto',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'SuiWallet',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'SUI',
  },
  // {
  //   name: 'UniSat',
  //   address: '',
  //   type: 'BTC',
  // },
  {
    name: 'OKExWalletSui',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'SUI',
  },
  // {
  //   name: 'Plena',
  //   address: '',
  //   isEVM: true,
  //   bridgersWallet: true,
  //   type: 'EVM',
  // },
  {
    name: 'Compass',
    address: '',
    isEVM: true,
    bridgersWallet: false,
    type: 'SEI',
  },
  {
    name: 'Patex',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'evm',
  },
  {
    name: 'HAVAH',
    address: '',
    isEVM: false,
    bridgersWallet: false,
    type: 'HAVAH',
  },
  {
    name: 'FoxWallet',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'JoyIDWallet',
    address: '',
    isEVM: true,
    bridgersWallet: true,
    type: 'EVM',
  },
  {
    name: 'Portkey',
    address: '',
    isEVM: false,
    bridgersWallet: false,
    type: 'AELF',
  },
  // {
  //   name: 'PlenaWallet',
  //   address: '',
  //   isEVM: true,
  //   bridgersWallet: true,
  //   type: 'EVM',
  // },

]
export default walletList
