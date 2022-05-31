import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.querySelector("#connectButton");
const fundButton = document.querySelector("#fundButton");
const balanceButton = document.querySelector("#balanceButton");
const withdrawButton = document.querySelector("#withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    document.querySelector("#connectButton").innerHTML = "Connected!";
  } else {
    console.log("No metamask!");
    document.querySelector("#connectButton").innerHTML =
      "Please install metamask!";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);

    document.querySelector("#balance").innerHTML =
      ethers.utils.formatEther(balance);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function fund() {
  const ethAmount = document.querySelector("#ethAmount").value;
  console.log(`Funding with ${ethAmount}...`);

  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    //   get connected wallet
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      //   listen for tx to be mined
      await listenForTxMine(transactionResponse, provider);
      console.log("done");
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTxMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);

  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing...");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);

    //   get connected wallet
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.withdraw();
      await listenForTxMine(transactionResponse, provider);
      console.log("Withdraw completed");
    } catch (error) {
      console.log(error);
    }
  }
}
