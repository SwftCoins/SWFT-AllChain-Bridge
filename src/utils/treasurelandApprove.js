import { ethers } from 'ethers'

const registryABI = require('./treasurelandABI.json')
const tokenABI = require('./treasurelandTokenABI.json')
const registryContract = {
  Treasureland: {
    BSC: '0xad3eb5b1a9a5729f08c0a623c8eeacfb43fb6b54',
    POLYGON: '0x3ee769b57ccc6ecbaeb26afdc8641550bc8fdb2d',
    ETH: '',
  },
  Bakeryswap: {
    BSC: '0x047c5ed6374bd9c73e6e1779d6769a967bb5c898',
  },
  Lootex: {
    BSC: '0x78d044b248ce27e29be495d8ea97ff4830b9e4ea',
  },
}

const rpcNode = {
  BSC: 'https://bsc-dataseed1.binance.org',
  POLYGON: 'https://rpc-mainnet.maticvigil.com',
  ETH: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
}

const zeroAddr = '0x0000000000000000000000000000000000000000'

let provider

async function initProvider(chain) {
  provider = new ethers.providers.JsonRpcProvider(rpcNode[chain])
}

async function checkRegistryApproval(address, userAddr, chain, type) {
  if (type === 'Lootex') {
    return checkApprovalForAll(
      address,
      registryContract[type][chain],
      userAddr,
      chain,
    )
  }
  await initProvider(chain)
  const contractRegistry = new ethers.Contract(
    registryContract[type][chain],
    registryABI,
    provider,
  )
  const addr = await contractRegistry.functions.proxies(userAddr)
  if (addr[0] === zeroAddr) {
    console.log('true')
    registryApproval(chain, type)
    return false
  } else {
    console.log('false', addr)
    return checkApprovalForAll(address, addr[0], userAddr, chain)
  }
}

async function registryApproval(chain, type) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = await provider.getSigner(0)
  const contractRegistry = new ethers.Contract(
    registryContract[type][chain],
    registryABI,
    signer,
  )
  const res = await contractRegistry.registerProxy()
}

async function checkApprovalForAll(tokenAddr, proxyAddr, userAddr, chain) {
  await initProvider(chain)
  const contractToken = new ethers.Contract(tokenAddr, tokenABI, provider)
  const result = await contractToken.functions.isApprovedForAll(
    userAddr,
    proxyAddr,
  )
  if (result[0]) {
    return result[0]
  } else {
    setApprovalForAll(tokenAddr, proxyAddr)
    return false
  }
}
async function setApprovalForAll(tokenAddr, proxyAddr) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = await provider.getSigner(0)
  const contractToken = new ethers.Contract(tokenAddr, tokenABI, signer)
  const res = await contractToken.setApprovalForAll(proxyAddr, 1)
}

export default {
  checkRegistryApproval,
}
