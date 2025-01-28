import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ethers } from "ethers";


const contractAddress = "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8";
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "withdrawAmount",
				"type": "uint256"
			}
		],
		"name": "InsufficientBalance",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Deposit",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_withdrawAmount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Withdraw",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "balance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    initializeProviderAndContract();
  }, []);

  const initializeProviderAndContract = async () => {
    try {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = newProvider.getSigner();
      const assessmentContract = new ethers.Contract(contractAddress, contractABI, signer);
      const accounts = await newProvider.listAccounts();

      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
      }

      setProvider(newProvider);
      setContract(assessmentContract);
      fetchBalance(assessmentContract);
    } catch (error) {
      console.error("Error initializing provider and contract:", error);
    }
  };

  const fetchBalance = async (contractInstance) => {
    try {
      const fetchedBalance = await contractInstance.getBalance();
      setBalance(ethers.utils.formatEther(fetchedBalance));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleDeposit = async () => {
    if (!amount) return alert("Enter an amount to deposit.");
    try {
      const tx = await contract.deposit(ethers.utils.parseEther(amount), {
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      fetchBalance(contract);
      setAmount("");
      alert("Deposit successful!");
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!amount) return alert("Enter an amount to withdraw.");
    try {
      const tx = await contract.withdraw(ethers.utils.parseEther(amount));
      await tx.wait();
      fetchBalance(contract);
      setAmount("");
      alert("Withdrawal successful!");
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Assessment Contract DApp</h1>
      {currentAccount ? (
        <div className="w-full max-w-md bg-white p-4 rounded-xl shadow-lg">
          <p className="mb-2">Connected Account: <strong>{currentAccount}</strong></p>
          <p className="mb-4">Contract Balance: <strong>{balance} ETH</strong></p>

          <input
            type="number"
            placeholder="Enter amount in ETH"
            className="w-full mb-4 p-2 border rounded-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button
            onClick={handleDeposit}
            className="w-full bg-blue-500 text-white p-2 rounded-lg mb-2 hover:bg-blue-600"
          >
            Deposit
          </button>

          <button
            onClick={handleWithdraw}
            className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
          >
            Withdraw
          </button>
        </div>
      ) : (
        <button
          onClick={initializeProviderAndContract}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      )}
    </div>
    </>
  );
}

export default App;