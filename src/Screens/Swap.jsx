import React, { useState, useEffect } from "react";
import Header from "../Components/Header";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { CgArrowsExchangeV } from "react-icons/cg";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { ethers, Contract } from "ethers";
import TOKEN from "../tokens.json";
import ABI from "../assets/abi.json";
import UNIABI from "../assets/uniAbi.json";
import { Web3Provider } from "@ethersproject/providers";
import Image from "../assets/cu.jpg";

const Swap = () => {
  const [amount, setAmount] = useState("0.00");
  const [value, setValue] = useState("");
  const [gas, setGas] = useState("");
  const [tokens, setTokens] = useState([]);
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOne, setTokenOne] = useState("");
  const [tokenTwo, setTokenTwo] = useState("");
  const [changeToken, setChangeToken] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  if (tokenOne === "0.00") {
    setTokenTwo("0.00");
  }

  useEffect(() => {
    const fetchTokenList = async () => {
      try {
        const response = await axios.get(
          "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/tokenlist.json"
        );
        const fetchedTokenList = response.data.tokens;
        fetchedTokenList.sort((a, b) => (a.symbol > b.symbol ? 1 : -1));
        // Manually add a token at position [0]
        const newToken = {
          chainId: 1,
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          name: "Ethereum",
          symbol: "ETH",
          decimals: 18,
          logoURI:
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
        };

        const newToken2 = {
          chainId: 1,
          address: "0xa0c7e61ee4faa9fcefdc8e8fc5697d54bf8c8141",
          name: "Curiosity Anon",
          symbol: "CA",
          decimals: 18,
          logoURI: Image,
        };

        const updatedTokenList = [newToken, newToken2, ...fetchedTokenList]; // Prepend the new token
        setTokens(updatedTokenList);
      } catch (error) {
        console.error("Error fetching token list:", error);
      }
    };

    fetchTokenList(); // Invoke the fetchTokenList function inside useEffect
  }, []);

  function switchTokens() {
    setTokenOne(tokenTwo);
    setTokenTwo(tokenOne);
    setValue(amount);
    setAmount(value);
  }

  // useEffect(() => {
  //   const ethTokens = TOKEN.tokens.filter((token) => token.chainId === 1);
  //   setTokens(ethTokens);
  // }, []);

  function handleSlippageChange(e) {
    // console.log(e.target.value);
    setSlippage(e.target.value);
  }
  function handleGas(e) {
    // console.log(e.target.value);
    setGas(e.target.value);
  }
  useEffect(() => {
    if (tokens.length > 0) {
      setTokenOne(tokens[0]);
      setTokenTwo(tokens[1]);
    }
  }, [tokens]);

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  let provider;
  let providers;
  let signer;
  if (typeof window.ethereum !== "undefined") {
    const url = "https://mainnet.infura.io/v3/5aaa12b0e25846ffac779abc4b3eb2a5";
    provider = new ethers.JsonRpcProvider(url);
    providers = new Web3Provider(window.ethereum);
    signer = providers.getSigner();
  }

  useEffect(() => {
    // Function to fetch token balances for tokenOne and tokenTwo
    const fetchTokenBalances = async () => {
      try {
        // Fetch token balances for tokenOne
        await handleTokenSelect(tokenOne);
        // Fetch token balances for tokenTwo
        await handleTokenSelect(tokenTwo);
      } catch (error) {
        console.error("Error fetching token balances:", error.message);
      }
    };

    fetchTokenBalances(); // Fetch token balances when component mounts
  }, []); // Empty dependency array to run only once when component mounts

  const handleTokenSelect = async (token) => {
    try {
      // Check if MetaMask is available
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask not detected.");
      }

      // Get the user's address
      const accounts = (await providers.listAccounts())[0];
      // console.log(accounts);

      let balance;
      if (token.symbol === "ETH") {
        const ethBalance = await provider.getBalance(accounts);
        balance = Number(ethers.formatEther(ethBalance)).toFixed(5);
      } else {
        // Instantiate the ERC-20 token contract
        const tokenContract = new ethers.Contract(token.address, ABI, provider);

        // Get token balance
        const tokenBalance = await tokenContract.balanceOf(accounts);
        balance = Number(
          ethers.formatUnits(tokenBalance, token.decimals)
        ).toFixed(5);
      }

      // Update the selected token with its balance
      if (changeToken === 1) {
        setTokenOne({ ...token, balance });
      } else {
        setTokenTwo({ ...token, balance });
      }

      // Close the modal
      setIsOpen(false);
    } catch (error) {
      console.error("Error handling token selection:", error.message);
    }
  };

  useEffect(() => {
    // Function to fetch balance for default tokens
    const fetchDefaultTokenBalances = async () => {
      try {
        // Check if MetaMask is available
        if (typeof window.ethereum === "undefined") {
          throw new Error("MetaMask not detected.");
        }

        // Get the user's address
        const accounts = (await providers.listAccounts())[0];
        // console.log(accounts);

        let balance;
        // console.log(tokenOne);
        // Fetch balance for default token one
        if (tokenOne.symbol === "ETH") {
          const ethBalance = await provider.getBalance(accounts);
          balance = Number(ethers.formatEther(ethBalance)).toFixed(5);
        } else {
          // Instantiate the ERC-20 token contract
          const tokenContract = new ethers.Contract(
            tokenOne.address,
            ABI,
            provider
          );

          // Get token balance
          const tokenBalance = await tokenContract.balanceOf(accounts);
          balance = Number(
            ethers.formatUnits(tokenBalance, tokenOne.decimals)
          ).toFixed(5);
        }

        // Update default token one with its balance
        setTokenOne({ ...tokenOne, balance });

        // Fetch balance for default token two (if needed)
        if (tokenTwo) {
          if (tokenTwo.symbol === "ETH") {
            const ethBalance = await provider.getBalance(accounts);
            balance = Number(ethers.formatEther(ethBalance)).toFixed(5);
          } else {
            // Instantiate the ERC-20 token contract
            const tokenContract = new ethers.Contract(
              tokenTwo.address,
              ABI,
              provider
            );

            // Get token balance
            const tokenBalance = await tokenContract.balanceOf(accounts);
            balance = Number(
              ethers.formatUnits(tokenBalance, tokenTwo.decimals)
            ).toFixed(5);
          }

          // Update default token two with its balance
          setTokenTwo({ ...tokenTwo, balance });
        }
      } catch (error) {
        console.error("Error fetching default token balances:", error.message);
      }
    };

    fetchDefaultTokenBalances(); // Fetch default token balances when component mounts
  }, []); // Empty dependency array to run only once when component mounts

  // Run this code on component mount
  // handleTokenSelect(tokenOne);

  // handleTokenSelect(tokenTwo);

  const uniswapRouterAddress = "0x95c81876a3e5889f0e7420604cbbdc9df4497d00";

  const uniswapRouter = new Contract(uniswapRouterAddress, UNIABI, signer);

  const getExpectedAmountOut = async (tokenIn, tokenOut, amountIn) => {
    try {
      // Get token addresses
      let tokenInAddress;
      if (tokenOne.symbol === "ETH") {
        tokenInAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
      } else {
        tokenInAddress = tokenOne.address;
      }

      const tokenOutAddress = tokenTwo.address;

      const amountInWei = ethers.parseUnits(
        amountIn.toString(),
        tokenOne.decimals
      );

      // Get expected amount out
      const amountsOut = await uniswapRouter.getAmountsOut(amountInWei, [
        tokenInAddress,
        tokenOutAddress,
      ]);

      // The expected amount out will be the last element in the returned array
      const expectedAmountOutWei = amountsOut[amountsOut.length - 1];

      const expectedAmountOut = ethers.formatUnits(
        expectedAmountOutWei,
        tokenTwo.decimals
      );
      // console.log(expectedAmountOut);
      setAmount(expectedAmountOut);
    } catch (error) {
      // console.error("Error getting expected amount out:", error);
      setAmount("0.00");
    }
  };

  useEffect(() => {
    getExpectedAmountOut(tokenOne.address, tokenTwo.address, value);
  }, [value]);

  // Example function to perform token swap
  const swapTokens = async (amount, extraGasFee) => {
    try {
      // Get token addresses
      // const tokenInAddress = "0xFf0dE1ECEb20C2Bb5eb6A0F75D6F10365692B379";
      // const tokenOutAddress = "0xe9e8eAe7b60b3DFcED410B0CF14a8F1D6eA207a7";

      const tokenInAddress = tokenOne.address;
      const tokenOutAddress = tokenTwo.address;

      // Convert amount to ethers BigNumber
      const amountInWei = ethers.parseUnits(
        amount.toString(),
        tokenOne.decimals
      );

      // Specify additional parameters for the swap (slippage tolerance, deadline, etc.)
      const deadline = Math.floor(Date.now() / 1000) + 300; // 5-minute deadline

      const acc = await providers.listAccounts();
      const accounts = acc[0];

      // console.log(accounts);

      // Initialize token contract instance
      const tokenContract = new ethers.Contract(tokenInAddress, ABI, signer);

      // Approve tokens for spending by Uniswap Router
      if (tokenInAddress != "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        await tokenContract.approve(
          uniswapRouterAddress, // Address of the Uniswap Router contract
          amountInWei // Amount of tokens to approve for spending
        );
      }

      // Proceed with the swap only if the user confirms
      const confirmed = window.confirm("Do you want to proceed with the swap?");

      if (!confirmed) return;

      const gasPrice = await signer.getGasPrice();

      const gasLimit = gasPrice.toString();

      // const totalGasFee = gasLimit.mul(gasPrice);
      const bribe = ethers.toBigInt(
        Math.floor(extraGasFee * 1e18) + gasLimit.toString()
      );
      let tx; // Declare tx variable outside of conditional blocks

      if (tokenInAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        const weiGasAmount = extraGasFee
          ? ethers.parseUnits(extraGasFee, "gwei")
          : 0;

        const functionName =
          "swapExactETHForTokens(uint256,address[],address,uint256,uint256)";
        const contractParams = [
          "0", // Minimum amount of tokenOut to receive (0 for no minimum)
          ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", tokenOutAddress], // Path of tokens to swap
          accounts.toString(), // Recipient of tokenOut
          deadline,
          weiGasAmount,
        ];

        const transaction = {
          to: uniswapRouter.address, // Address of the Uniswap router contract
          value: ethers.parseEther(amount), // Convert amount of ETH to Wei
          data: uniswapRouter.interface.encodeFunctionData(
            functionName,
            contractParams
          ),
          gasLimit: ethers.toBigInt(300000), // Specify gas limit here
        };

        tx = await signer.sendTransaction(transaction);
      } else {
        tx = await uniswapRouter.swapExactTokensForTokens(
          amountInWei.toString(), // Amount of token to swap
          "0", // Minimum amount of tokenOut to receive (0 for no minimum)
          [tokenInAddress, tokenOutAddress], // Path of tokens to swap
          accounts.toString(), // Recipient of tokenOut
          deadline,
          // Deadline for the swap
          { gasLimit: gasLimit, value: bribe } // Pass gas price as string
        );
      }

      await tx.wait(); // Wait for transaction to be mined

      console.log("Swap successful!");
      alert("Swap Successful");
    } catch (error) {
      console.error("Error swapping tokens:", error.message);
      let err;
      if (error.message.includes("insufficient")) {
        err = "Insufficient funds for Gas Fee";
      } else if (error.message.includes("rejected")) {
        err = "You rejected this transaction in MetaMask";
      }

      alert("Error swapping tokens: " + err);
    }
  };

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>

      <div className="mt-3">
        <Input placeholder="Custom" onChange={handleSlippageChange} />
      </div>

      <div className="mt-4">Miner Tip</div>
      <div className="mt-1">
        <Input placeholder="0.5 Eth" onChange={handleGas} />
      </div>
    </>
  );

  const [searchQuery, setSearchQuery] = useState("");

  // Filter tokens based on the search query
  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-image h-screen ">
      <Header />
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
        contentBg={"#000000"}
        colorBgMask={"#000000"}
      >
        <div className="modalContent">
          <input
            type="text"
            placeholder="Search tokens"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-3 mb-3 p-2 rounded-lg w-full"
          />
          {filteredTokens.map((e, i) => (
            <div
              className="tokenChoice"
              key={i}
              onClick={() => handleTokenSelect(e)} // Update selected token when clicked
            >
              <div className="inline-flex mt-3">
                <img
                  src={e.logoURI}
                  alt={e.ticker}
                  className="w-10 h-10 rounded-full mr-5"
                />
                <div className="">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.symbol}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
      <div className="flex pt-20 justify-center items-center">
        <div className="card p-5 text-white">
          <div className="grid grid-cols-2">
            <p className="text-3xl font-light">Swap tokens</p>
            <div className="justify-self-end">
              <Popover
                content={settings}
                title="Settings"
                trigger="click"
                placement="bottomRight"
              >
                <SettingOutlined className="cog" />
              </Popover>
            </div>
          </div>

          <p className="text-xs pt-2 text-gray-500">
            Choose a pair of token to make a swap
          </p>
          <div className="relative">
            <div className="bg-black mt-5 p-5 grid grid-cols-2">
              <div className="inline-flex " onClick={() => openModal(1)}>
                <img
                  src={tokenOne.logoURI}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <div className="text-sm font-bold">
                    {tokenOne.symbol}
                    <DownOutlined className="ml-2 text-sm" />
                  </div>
                  <p className="text-xs text-gray-500">
                    Balance: {tokenOne.balance}
                  </p>
                </div>
              </div>
              <div className="justify-self-end">
                <input
                  type="number"
                  name="price"
                  id="price"
                  className="w-auto text-right custom-input text-white bg-transparent placeholder:text-white focus:border-none sm:text-4xl"
                  placeholder="0.00"
                  onChange={(e) => setValue(e.target.value)}
                />
                {/* <p className="text-right text-xs text-gray-500">~$145</p> */}
              </div>
            </div>

            <div
              className="h-8 w-8 ex-icon justify-center flex items-center"
              onClick={switchTokens}
            >
              <CgArrowsExchangeV />
            </div>

            <div className="bg-black p-5 mt-0.5 grid grid-cols-2">
              <div className="inline-flex " onClick={() => openModal(2)}>
                <img
                  src={tokenTwo.logoURI}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <div className="text-sm font-bold">
                    {tokenTwo.symbol}
                    <DownOutlined className="ml-2 text-sm" />
                  </div>
                  <p className="text-xs text-gray-500">
                    Balance: {tokenTwo.balance}
                  </p>
                </div>
              </div>
              <div className="justify-self-end">
                <input
                  type="number"
                  name="price"
                  id="price"
                  disabled
                  className="w-auto text-right custom-input text-white bg-transparent placeholder:text-white focus:border-none sm:text-4xl"
                  placeholder="0.00"
                  value={amount}
                />
                {/* <p className="text-right text-xs text-gray-500">~$125</p> */}
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2">
            {/* <p className="text-xs text-gray-500">Receive: ~1286</p> */}
            {/* <p className="justify-self-end text-xs text-gray-500">
              Total fees: $12
            </p> */}
          </div>
          <div>
            <button
              className="border-solid border-2 w-full swap mt-10 mb-5"
              onClick={() => swapTokens(value, gas)}
            >
              SWAP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
