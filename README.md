# Echooo Messaging Application
Echooo is a messaging protocol that uses cryptography which allows users to communicate privately and safely. Echooo prevents users with compromised private keys from hackers to access their full history messages by creating a communication address that's renewed in the user’s preferred frequency. This communication address functions as a safe and temporarily encrypted channel that is owned only by the users involved. Echooo also utilizes Elliptic-curve Diffie–Hellman to create a shared identity for each two users and anonymize the receiver of the messages on chain.

Echooo was a project created at ETH NYC and won a top 10 placing in the Polygon sponsor prize: https://ethglobal.com/showcase/echooo-messaging-protocol-h7oms

## Development
### Frontend
Running the frontend.

1. Change directory into the `frontend` folder
2. Install dependencies by running `npm install`
3. Run `npm start` to start the application
4. Go to `localhost:3000` in the browser
### Backend
Running the smart contract tests.

1. Install dependencies by running `npm install` in the root directory
2. Compile the smart contract first `npx hardhat compile`
3. Run `npx hardhat test` to run the smart contract tests

## Deployment
### The Graph
If want to re-deploy the graph follow the instructions below.
1. Navigate to the `graph` folder and install the dependencies with `npm install`
2. Go to the `config` folder and modify the files corresponding to your network. Replace the addresses with the
smart contract you'd like to connect to
3. Modify `package.json` to include your new graph end point API URL by replacing any string leading with `mtwichan/...` with your end point
4. Deploy the graph by running `npm run deploy:<network-name>` where `<network-name>` is the name of the network you want to deploy to

### Smart Contracts
Deploy the smart contracts by following the instructions below.

1. Configure the deploy script in `scripts/deploy.ts` if required
2. Configure `hardhat.config.ts` if required
3. Add the required environment variables shown in `hardhat.config.ts` to a `.env` file
4. Deploy to hardhat by running `npx hardhat run scripts/deploy.ts --network <network-name>` where `<network>` is the name of the network you want to deploy to

### Etherscan Verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.ts
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```
