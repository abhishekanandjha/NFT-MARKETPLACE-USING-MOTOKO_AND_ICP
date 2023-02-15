import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { HttpAgent,Actor } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opend } from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";


function Item(props) {

  const [name,setName]=useState();
  const [owner,setowner]=useState();
  const [image,setimage]=useState();
  const [button,setButton]=useState();
  const [priceInput,setpriceInput]=useState();
  const [loaderHidden ,setloaderHidden]=useState(true);
  const [blur,setblur]= useState();
  const [sellStatus,setsellStatus]=useState("");
  const [priceLabel,setpriceLabel]=useState();
  const [shouldDisplay,setDisplay]=useState(true);

  const id = props.id;
  const localHost ="http://localhost:8080/";
  const agent=new HttpAgent({host:localHost});
  //TODO: when deploying live , remove the fetchRootKey 
  agent.fetchRootKey();
  let NFTActor;

  async function loadNFT(){
    NFTActor= await Actor.createActor(idlFactory,{
      agent,
      canisterId:id,
    });

    const name= await NFTActor.getName();
    setName(name);
    
    const owner = await NFTActor.getOwner();
    //owner come as principal datatype and should be converted to text for readeability
    setowner(owner.toText());

    //image data from backend nft.mo
    const imageData = await NFTActor.getAsset();
    //image will come as Nat8 and will be converted to Uint8Array to be recognized by java script
    const imageContent = new Uint8Array(imageData);
    //convert image into url//pass imageContent as blob datatype//using to convert Nat8 form backend to blob
    const image= URL.createObjectURL(new Blob([imageContent.buffer],{type:"image/png"}));
    setimage(image);

    if(props.role=="collection"){

      const nftIsListed = await opend.isListed(props.id);
      if(nftIsListed){
        setowner("OpenD");
        setblur({ filter: "blur(4px" });
        setsellStatus("Listed");
      }else{
        setButton(<Button handleClick={handleSell} text={"sell"} />);
      }
    }else if(props.role=="discover"){
      const originalOwner = await opend.getOriginalOwner(props.id);
      if(originalOwner.toText()!= CURRENT_USER_ID.toText()){
        setButton(<Button handleClick={handleBuy} text={"Buy"} />);
      }
      const price = await opend.getListedNFTPrice(props.id);
      setpriceLabel(<PriceLabel sellPrice={price.toString()} />);
    }
  }
  //to load nft only at once;
  useEffect(()=>{
    loadNFT();
  },[] );

  let price;
  function handleSell(){
    console.log("selled");
    setpriceInput(<input
      placeholder="Price in DJ"
      type="number"
      className="price-input"
      value={price}
      onChange={(e)=>price=e.target.value}
    />)
    setButton(<Button handleClick={sellItem} text={"confirm"}/>);

  };

  //we are going to work with backend so we need an async fn to handleClick
  async function sellItem(){
    setblur({filter:"blur(4px"});
    setloaderHidden(false);
    console.log("confirm clicked with price = "+price);
    const listingResult = await opend.listItem(props.id, Number(price));
    console.log("listingResult = "+listingResult);

    if(listingResult=="Success"){
      const openDId = await opend.getOpenDCanisterID();
      const transferResult = await NFTActor.transferOwnership(openDId);
      console.log("transfer: "+ transferResult);
      if(transferResult=="Success"){
        setloaderHidden(true);
        setButton();
        setpriceInput();
        setowner("openD");
        setsellStatus("Listed");
      }
    }
  };
//buy the nft using token
  async function handleBuy(){
    console.log("Buy was triggeed");
    setloaderHidden(false);
    const tekenActor =await Actor.createActor(tokenIdlFactory,{
      agent,
      canisterId: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
    });
    //transfering token to buyer to seller
    //get hold of seller principal id
    const sellerId = await opend.getOriginalOwner(props.id);
    //item price
    const itemPrice = await opend.getListedNFTPrice(props.id);

    //actual transfer
    const result = await tokenIdlFactory.transfer(sellerId,itemPrice);
    console.log(result);
    if(result =="Success"){
      //transfer the ownership
      const transferResult = await opend.completePurches(props.id,sellerId,CURRENT_USER_ID);
      console.log("Pruchase : " +transferResult);
      setloaderHidden(true); 
      setDisplay(false);
    }
  };


  return (
    <div style={{display: shouldDisplay ? "inline":"none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
