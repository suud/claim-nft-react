import ethers from "ethers";
import { readFileSync } from "fs";
import { ThirdwebSDK } from "@3rdweb/sdk";

// Get environment variables
import dotenv from "dotenv";
dotenv.config();

// Make sure required environment variables are set
if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "") {
    console.log("🛑 Private key environment variable not set or empty.");
}
if (!process.env.THIRDWEB_PROJECT_ADDRESS || process.env.THIRDWEB_PROJECT_ADDRESS === "") {
    console.log("🛑 Thirdweb project address environment variable not set or empty.");
}
if (!process.env.RPC_URL || process.env.RPC_URL === "") {
    console.log("🛑 Public Ethereum endpoint (RPC URL) environment variable not set or empty.");
}
if (!process.env.BUNDLE_DROP_NAME || process.env.BUNDLE_DROP_NAME == "") {
    console.log("🛑 Bundle Drop Name environment variable not set or empty.");
}
if (!process.env.BUNDLE_DROP_DESCRIPTION) {
    console.log("🛑 Bundle Drop Description environment variable not set.");
}
if (!process.env.BUNDLE_DROP_IMG_PATH) {
    console.log("🛑 Bundle Drop Image environment variable not set.");
}
if (!process.env.NFT_NAME || process.env.NFT_NAME === "") {
    console.log("🛑 NFT Name environment variable not set or empty.");
}
if (!process.env.NFT_DESCRIPTION) {
    console.log("🛑 NFT Description environment variable not set.");
}
if (!process.env.NFT_IMG_PATH) {
    console.log("🛑 NFT Image environment variable not set.");
}
if (!process.env.NFT_MAX_QUANTITY || process.env.NFT_MAX_QUANTITY === "") {
    console.log("🛑 NFT Max Quantity environment variable not set or empty.");
}


// Instantiate Thirdweb SDK
const sdk = new ThirdwebSDK(
    new ethers.Wallet(
        process.env.PRIVATE_KEY,
        ethers.getDefaultProvider(process.env.RPC_URL),
    ),
);


(async () => {
    // Get thirdweb app
    // This will select the first of your thirdweb projects
    try {
        const app = sdk.getAppModule(process.env.THIRDWEB_PROJECT_ADDRESS);
        console.log("✅ Successfully selected thirdweb project!");
        console.log("Address:", app.address);
    } catch (error) {
        console.error("🛑 Failed to get project from thirdweb sdk", error);
        console.error("Have you followed the steps at https://thirdweb.com/portal/learn/projects ?")
        console.error("Are you using the correct Project Address, Private Key and Network?")
        process.exit(1);
    }

    // Deploy Bundle Drop Module
    // This will deploy a smart contract that we'll use to define
    // certain rules (e.g. claim conditions) for our NFT.
    try {
        const bundleDropModule = await app.deployBundleDropModule({
            name: process.env.BUNDLE_DROP_NAME,
            description: process.env.BUNDLE_DROP_DESCRIPTION,
            image: readFileSync(process.env.BUNDLE_DROP_IMG_PATH),
            // We need to set the address of the person who will be receiving the
            // proceeds from sales of NFTs in the module.
            // We won't charge people for this drop, so we'll pass in the 0x0 address.
            // Use your own wallet address if you want to charge for the drop.
            primarySaleRecipientAddress: ethers.constants.AddressZero,
        });

        console.log("✅ Successfully deployed Bundle Drop Module!");
        console.log("Address:", bundleDropModule.address);
        console.log("Metadata:", await bundleDropModule.getMetadata());
    } catch (error) {
        console.error("🛑 Failed to deploy Bundle Drop Module", error);
        process.exit(1);
    }

    // Create NFT
    try {
        await bundleDrop.createBatch([
            {
                name: process.env.NFT_NAME,
                description: process.env.NFT_DESCRIPTION,
                image: readFileSync(process.env.NFT_IMG_PATH),
            },
        ]);
        console.log("✅ Successfully created a new NFT in the drop!");
    } catch (error) {
        console.error("🛑 Failed to create the NFT", error);
        process.exit(1);
    }

    // Set NFT claim conditions
    try {
        const claimConditionFactory = bundleDrop.getClaimConditionFactory();
        claimConditionFactory.newClaimPhase({
            // When can users start claiming the NFT
            // This could be set to a date in the future
            startTime: new Date("1970-01-01T00:00:00"),
            // How many NFTs can exist
            maxQuantity: process.env.NFT_MAX_QUANTITY,
            // How many NFTs can be minted in a single transaction
            maxQuantityPerTransaction: 1,
        });

        await bundleDrop.setClaimCondition(0, claimConditionFactory);
        console.log("✅ Sucessfully set NFT claim conditions!");
    } catch (error) {
        console.error("🛑 Failed to set NFT claim conditions", error);
        process.exit(1);
    }
})();