import {
  ConnectWallet,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useContractRead,
  useOwnedNFTs,
  useTokenBalance,
  Web3Button,
} from "@thirdweb-dev/react";
import Image from 'next/image'
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import NFTCard from "../components/NFTCard";
import {
  nftDropContractAddress,
  stakingContractAddress,
  tokenContractAddress,
} from "../consts/contractAddresses";
import styles from "../styles/Home.module.css";
import styled from "styled-components";

export const Button = styled.button`
  padding: 10px;
  border-radius: 7px;
  border: none;
  background-color: #EDEDEF;
  padding: 10px;
  font-weight: light;
  font-family: 'Perfect DOS VGA 437', sans-serif';
  color: black;
  width: auto;
  cursor: pointer;
  }
`;


const ButtonGroup = styled.div`
  display: flex;
  padding: 5px;
  spacing; 
`
const Spacer = styled.div`
   width:10px;
  height:10px;
  display:inline-block;
`  
const SpacerLarge = styled.div`
   width:10px;
  height:10px;
  
`  
const { Alchemy, Network,  NftExcludeFilters } = require("alchemy-sdk");

// Configures the Alchemy SDK
const config = {
    apiKey: "nLeTw4kEJZvFG5VNZY1TmgVXeI6cTdBM", // Replace with your API key
    network: Network.ETH_MAINNET, // Replace with your network
};

// Creates an Alchemy object instance with the config to use for making requests

const Stake: NextPage = () => {
 
  const alchemy = new Alchemy(config);
  const address = useAddress();
  const { contract: nftDropContract } = useContract(
    nftDropContractAddress,
    "nft-drop"
  );

  const { contract: tokenContract } = useContract(
    tokenContractAddress,
    "token"
  );

  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
  const [selected, setSelected] = useState<any[]>([]);  
  const [ownedNft, setOwnedNft] = useState<any[]>([]);
   
  const { contract, isLoading } = useContract(stakingContractAddress);
  const { data: ownedNfts } = useOwnedNFTs(nftDropContract, address);
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  const { data: stakedTokens } = useContractRead(contract, "getStakeInfo", [
    address,
  ]);

function activeClick(token: any) {
  if (selected.includes(token)) {
    setSelected(selected.filter((id: string) => id !== token));
  } else {
    setSelected([...selected,token]);
  }
  return
  }

function unClick(selectedToken: string) {
  setSelected((selected)=> selected.filter((y: string) => y !== selectedToken));
return
}

function clear() {
  setSelected([]);
return
}

// test if list is empty. Might need to check if the tokem id exists in the list 
function isListEmpty() {
  if (selected.length === 0) return true;
}


  useEffect(() => {
    if (!contract || !address) return;
    async function loadClaimableRewards() {
      const stakeInfo = await contract?.call("getStakeInfo", [address]);
      setClaimableRewards(stakeInfo[1]);
    }
    loadClaimableRewards();
  }, [address, contract]);

  useEffect(() => {
    if (!contract || !address) return;
      async function pullNftInfo() {
      const options = {method: 'GET', headers: {accept: 'application/json'}}; 
      let response = await fetch(`https://eth-mainnet.g.alchemy.com/nft/v2/nLeTw4kEJZvFG5VNZY1TmgVXeI6cTdBM/getNFTs?owner=${address}&contractAddresses[]=${nftDropContractAddress}&withMetadata=true`, options)
      .then(response => response.json())
      .then(response => setOwnedNft(response.ownedNfts));
      }
      pullNftInfo();

}, [address, contract]);


  async function stakeNft()   {
    var tokenIds = selected.map(Number)
    if (!address) return;

    const isApproved = await nftDropContract?.isApproved(
      address,
      stakingContractAddress
    );
    if (!isApproved) {
      await nftDropContract?.setApprovalForAll(stakingContractAddress, true);
    }
    
   const tokenList = selected.map(token => (token.toString()));
  
    await contract?.call("stake", [tokenList]);
  }


  
  if (isLoading) {
    return <div>Loading</div>;
  }
  const edited = true

  return (
    
    
    <div className={styles.container}>
      <h1 className={styles.h1}>DOS TRASH BIRDS STAKING</h1>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />
      {!address ? (
        <ConnectWallet />
      ) : (
        <>
          <h2>Stake Your DOS TRASH BIRDS</h2>
          <div className={styles.tokenGrid}>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Claimable Rewards</h3>
              <p className={styles.tokenValue}>
              <b>
                  {!claimableRewards
                    ? "Loading..."
                    : ethers.utils.formatUnits(claimableRewards, 18)}
                </b>{" "}
                {tokenBalance?.symbol}
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Current Balance</h3>
              <p className={styles.tokenValue}>
                <b>{tokenBalance?.displayValue}</b> {tokenBalance?.symbol}
              </p>
            </div>
          </div>   
          <SpacerLarge />
          <SpacerLarge />
          <SpacerLarge />
          <ButtonGroup>
          
          <Web3Button
            action={(contract) => contract.call("claimRewards")}
            contractAddress={stakingContractAddress}
          >
            Claim Rewards
          </Web3Button>
          <Spacer />
          
          <Web3Button
            contractAddress={stakingContractAddress}
            action={() => stakeNft()}
          >
            Stake Selected

           
        
          </Web3Button>
    

          <Spacer />
          <Button
    
            onClick={() => clear()}
          >
            Clear Selected
          </Button>
          <Spacer />
     
          </ButtonGroup>
          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>Your Unstaked TRASH BIRDS</h2>
          <div className={styles.nftBoxGrid}>
            {ownedNfts?.map((nft) => (
              <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMedia}
                />
                <h3>{nft.metadata.name}</h3>
                
                <Button
                onClick={() => activeClick(nft.metadata.id)}
                >
                {selected.includes(nft.metadata.id) ? 'Unselect' : 'Select'}
                </Button>
                
              </div>

            ))}
          </div>
        </>
      )}
          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>Your Staked TRASH BIRDS</h2>
          <div className={styles.nftBoxGrid}>
            {stakedTokens &&
              stakedTokens[0]?.map((stakedToken: BigNumber) => (
                <NFTCard
                  tokenId={stakedToken.toNumber()}
                  key={stakedToken.toString()}
                />
              ))}
          </div>
    </div>
  );
};

export default Stake;
