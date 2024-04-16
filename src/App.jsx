import "./App.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { GearFill } from "react-bootstrap-icons";
import BeatLoader from "react-spinners/BeatLoader";

import PageButton from "./Components/PageButton";
import ConnectButton from "./Components/ConnectButton";
import ConfigModal from "./Components/ConfigModal";
import CurrencyField from "./Components/CurrencyField";

import {
  getWethContract,
  getUniContract,
  getPrice,
  runSwap,
} from "./AlphaRouterService";

function App() {
  const [signer, setSigner] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);
  const [wethAmount, setWethAmount] = useState(undefined);
  const [uniAmount, setUniAmount] = useState(undefined);
  const [outputAmount, setOutputAmount] = useState(undefined);
  const [transaction, setTransaction] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [ratio, setRatio] = useState(undefined);

  useEffect(() => {
    const onLoad = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setSigner(signer);
        const address = await signer.getAddress();
        setSignerAddress(address);

        const wethContract = getWethContract();
        const wethBalance = await wethContract.balanceOf(address);
        setWethAmount(Number(ethers.utils.formatEther(wethBalance)));

        const uniContract = getUniContract();
        const uniBalance = await uniContract.balanceOf(address);
        setUniAmount(Number(ethers.utils.formatEther(uniBalance)));
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };
    onLoad();
  }, []);

  const getSwapPrice = async (inputAmount) => {
    setLoading(true);
    try {
      const deadline = Math.floor(Date.now() / 1000 + 10 * 60); // 10 minutes from now
      const [tx, outAmount, ratio] = await getPrice(
        inputAmount,
        2,
        deadline,
        signerAddress
      );
      setTransaction(tx);
      setOutputAmount(outAmount);
      setRatio(ratio);
    } catch (error) {
      console.error("Error fetching swap price:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    runSwap(transaction, signer);
  };

  return (
    <div className="App">
      {/* Navigation buttons and Connect button */}

      <div className="appBody">
        <div className="swapContainer">
          {/* Swap header and configuration modal */}
          <div className="swapBody">
            {/* Currency fields */}
            <CurrencyField
              field="input"
              tokenName="LINK"
              getSwapPrice={getSwapPrice}
              signer={signer}
              balance={wethAmount}
            />
            <CurrencyField
              field="output"
              tokenName="MATIC"
              value={outputAmount}
              signer={signer}
              balance={uniAmount}
              spinner={BeatLoader}
              loading={loading}
            />
          </div>

          <div className="ratioContainer">
            {ratio && `1 UNI = ${ratio} WETH`}
          </div>

          <div className="swapButtonContainer">
            {signerAddress ? (
              <div onClick={handleSwap} className="swapButton">
                Swap
              </div>
            ) : (
              <ConnectButton setSigner={setSigner} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
