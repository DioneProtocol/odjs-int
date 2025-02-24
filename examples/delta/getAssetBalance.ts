import "dotenv/config"
import { Odyssey } from "../../src"
import { DELTAAPI } from "../../src/apis/delta"
import BinTools from "../../src/utils/bintools"
import {Defaults} from "../../src/utils"  
const ip = process.env.TEST_IP
const port = Number(process.env.ODYSSEY_PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.TEST_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const dchain: DELTAAPI = odyssey.DChain()
const bintools: BinTools = BinTools.getInstance()

const main = async (): Promise<any> => {
  const assetId =await  dchain.getDIONEAssetID();
  const readableAssetId = bintools.cb58Encode(assetId);
  console.log(Defaults.network[networkID].A.dioneAssetID)

  console.log(readableAssetId)
  const address: string = "0x26e7CDeb1Eb11C18Fa760dc27C0Aab7653258612"
  const blockHeight: string = "latest"
  //const assetID: string = "2NXDF6rpi7fJqFnuSKSnoVCNF3Py22xdjQavy9QgvjL3zr2yue"
  const balance: object = await dchain.getAssetBalance(
    address,
    blockHeight,
    readableAssetId
  )
  console.log(balance)
}

main()



/*
curl https://testnode.dioneprotocol.com/ext/bc/D/rpc \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params": ["0x26e7CDeb1Eb11C18Fa760dc27C0Aab7653258612", "latest"],"id":1}'

  curl https://testnode.dioneprotocol.com/ext/bc/D/rpc \

-X POST \
  -H "Content-Type: application/json" \
    -d "jsonrpc": "2.0",
    "method": "eth_getAssetBalance",
    "params": [
        "0x26e7CDeb1Eb11C18Fa760dc27C0Aab7653258612",
        "latest",
        "2NXDF6rpi7fJqFnuSKSnoVCNF3Py22xdjQavy9QgvjL3zr2yue"
    ],
    "id": 1
}'
*/