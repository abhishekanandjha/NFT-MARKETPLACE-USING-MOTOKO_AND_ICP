import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { opend } from "../../../declarations/opend";
import { Principal } from "@dfinity/principal";
import Item from "./Item";


function Minter() {

  //register form
  const {register,handleSubmit}=useForm();
  const [nftPrincipal,setNFTPrincipal] =useState("");
  const [loaderHidden,setloaderHidden]=useState(true);

  async function onsubmit(data){
    //just after mint button pressed loader show up
    setloaderHidden(false);


    const name=data.name;
    //[0]bec image contain lot of data eg. name location and all
    const image=data.image[0];
    //arrayBuffer object represent raw binary data  
    //this will be tapin through main.mo file 
    //store these nft as hashmap
    const imageByteData=[...new Uint8Array(await image.arrayBuffer())];

    const newNFTID = await opend.mint(imageByteData,name);
    console.log(newNFTID.toText());
    setNFTPrincipal(newNFTID);


      //when done processing hidden set to true
    setloaderHidden(true);

  }

  if(nftPrincipal==""){
  return (
    <div className="minter-container">
      <div hidden={loaderHidden} className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <h3 className="makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
        Create NFT
      </h3>
      <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
        Upload Image
      </h6>
      <form className="makeStyles-form-109" noValidate="" autoComplete="off">
        <div className="upload-container">
          <input
            {...register("image", { require: true })}
            className="upload"
            type="file"
            accept="image/x-png,image/jpeg,image/gif,image/svg+xml,image/webp"
          />
        </div>
        <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
          Collection Name
        </h6>
        <div className="form-FormControl-root form-TextField-root form-FormControl-marginNormal form-FormControl-fullWidth">
          <div className="form-InputBase-root form-OutlinedInput-root form-InputBase-fullWidth form-InputBase-formControl">
            <input
              {...register("name",{require:true})}
              placeholder="e.g. CryptoDunks"
              type="text"
              className="form-InputBase-input form-OutlinedInput-input"
              //we are gonna use useform form react-hook-form
            />
            <fieldset className="PrivateNotchedOutline-root-60 form-OutlinedInput-notchedOutline"></fieldset>
          </div>
        </div>
        <div className="form-ButtonBase-root form-Chip-root makeStyles-chipBlue-108 form-Chip-clickable">
          <span onClick={handleSubmit(onsubmit)} className="form-Chip-label">Mint NFT</span>
        </div>
      </form>
    </div>
  );
  }else{
    return(
    <div className="minter-container">
      <h3 className="Typography-root makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
        Minted!
      </h3>
      <div className="horizontal-center">
      <Item id={nftPrincipal.toText()}/>
      </div>
    </div>
    );

  }
}

export default Minter;
