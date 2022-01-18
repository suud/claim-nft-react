import * as config from "./config.json";
import { useEffect, useState } from "react";
import { useWeb3, useSwitchNetwork } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

const sdk = new ThirdwebSDK(config.provider);
const bundleDropModule = sdk.getBundleDropModule(config.bundleDropModuleAddress);

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  const { switchNetwork } = useSwitchNetwork();
  console.log("👋 Address:", address);

  // The signer is required to sign transactions on the blockchain
  // Without it we can only read data, not write
  const signer = provider ? provider.getSigner() : undefined;

  // Pass the signer to the sdk, which enables us to interact with
  // our deployed contract
  useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer]);


  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting
  const [isClaiming, setIsClaiming] = useState(false);

  // Check if user has our NFT
  useEffect(() => {
    if (!address) {
      return;
    }
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a citizenship NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a citizenship NFT.");
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("Failed to check NFT balance.", error);
      });
  }, [address]);


  // The array holding all of our citizen addresses
  const [citizenAddresses, setCitizenAddresses] = useState([]);

  // Grab all the addresses of our citizens holding our NFT
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab the users who hold our NFT with tokenId 0
    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresess) => {
        console.log("🚀 Citizens addresses:", addresess);
        setCitizenAddresses(addresess);
      })
      .catch((err) => {
        console.error("Failed to get citizen list.", err);
      });
  }, [hasClaimedNFT]);


  // If a unsupported chain is selected, the user will see this
  if (error && error.name === "UnsupportedChainIdError") {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>This dapp only works on the Rinkeby network.</p>
        <button onClick={() => switchNetwork(config.networkId)} className="btn-hero">
          Switch Network
        </button>
      </div>
    );
  }

  // When no wallet is connected, the user will see this
  if (!address) {
    return (
      <div className="landing">
        <h1>Become a Bike Land Citizen</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }

  // Users with the NFT will see this
  if (hasClaimedNFT) {
    return (
      <div className="citizen-page">
        <h1>Bike Land</h1>
        <p>Congratulations! You are one out of {citizenAddresses.length} Bike Land citizens.</p>
        <p>Go ahead and use our exclusive services. Or just ride your bike!</p>
      </div>
    );
  };

  // Users without the NFT will see this
  return (
    <div className="mint-nft">
      <h1>Mint your Bike Land Citizenship NFT</h1>
      <button
        disabled={isClaiming}
        onClick={() => {
          setIsClaiming(true);
          // Call bundleDropModule.claim("0", 1) to mint one nft to user's wallet
          bundleDropModule
            .claim("0", 1)
            .catch((err) => {
              console.error("Failed to claim NFT.", err);
              setIsClaiming(false);
            })
            .finally(() => {
              // Stop loading state
              setIsClaiming(false);
              // Set claim state
              setHasClaimedNFT(true);
              // Show user their new NFT
              console.log(
                `Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
              );
            });
        }}
      >
        {isClaiming ? "Minting..." : "Mint NFT"}
      </button>
    </div>
  );
};

export default App;