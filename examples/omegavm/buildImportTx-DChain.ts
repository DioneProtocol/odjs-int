import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  OmegaVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx as UnsignedTxOmegavm,
  Tx as TxOmegavm
} from "../../src/apis/omegavm"
import {
  DefaultLocalGenesisPrivateKey,
  Defaults,
  UnixNow
} from "../../src//utils"
import Web3 from "web3"

const ip = process.env.TEST_IP
const port = Number(process.env.ODYSSEY_PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.TEST_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)

const key = "19c1b4b6f406696e350de886e5164502c0a16f837e06f738c80deecadb7053ef"
const privKey: Buffer = new Buffer(key, "hex")

const ochain: OmegaVMAPI = odyssey.OChain()

const oKeychain: KeyChain = ochain.keyChain()

oKeychain.importKey(privKey)

const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const dChainBlockchainID: string = Defaults.network[networkID].D.blockchainID
const oChainBlockchainID: string = Defaults.network[networkID].O.blockchainID

const threshold: number = 1

const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "OmegaVM utility method buildImportTx to import DIONE to the O-Chain from the A-Chain"
)
const asOf: BN = UnixNow()

const main = async (): Promise<any> => {
  try{
    const omegaVMUTXOResponse: any = await ochain.getUTXOs(
      oAddressStrings,
      dChainBlockchainID
    )
    const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos
    const UnsignedTxOmegavm: UnsignedTxOmegavm = await ochain.buildImportTx(
      utxoSet,
      oAddressStrings,
      dChainBlockchainID,
      oAddressStrings,
      oAddressStrings,
      oAddressStrings,
      memo,
      asOf,
      locktime,
      threshold
    )
    const tx: TxOmegavm = UnsignedTxOmegavm.sign(oKeychain)
    const txid: string = await ochain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
  }catch(e){
    console.log(e)
  }
  
}

main()
