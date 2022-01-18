# claim-nft-react
Create your own NFT and a website where everyone can mint it for free.

## Prerequisites
- [thirdweb project](https://thirdweb.com/portal/learn/projects)

## Usage

```
# clone repository
git clone git@github.com:suud/claim-nft-react.git
cd claim-nft-react

# install dependencies
npm install

# configure NFT
cp .env.example .env
vim .env

# create NFT
node scripts/create-nft.js

# configure claim page
cp src/config.json.example src/config.json
vim src/config.json

# run development build
npm start

# create production build
npm run build
```

## Resources

- [thirdweb: Create a project](https://thirdweb.com/portal/learn/projects)
- [buildspace: Build your own DAO](https://buildspace.so/daos)
- [buildspace: Build your own DAO - finished project code](https://github.com/buildspace/buildspace-dao-final)
