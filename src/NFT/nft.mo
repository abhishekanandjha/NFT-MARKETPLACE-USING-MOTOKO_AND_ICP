import Debug "mo:base/Debug";
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

//nat 8 stores image in bites //this to get hold of principal for main.mo
actor class NFT (name:Text,owner:Principal,content:[Nat8]) = this {
    private let itemName=name;
    private var nftOwner=owner;
    private let imageBytes=content;

    public query func getName():async Text{
        return itemName;
    };

    public query func getOwner():async Principal{
        return nftOwner;
    };

    public query func getAsset():async [Nat8]{
        return imageBytes;
    };

    public query func getAssetcanisterId():async Principal{
        //Actor class expect the inputs so this represent all the value
        return Principal.fromActor(this);
    };
    //transfer fn
    public shared(msg) func transferOwnership(newOwner:Principal): async Text{
        if(msg.caller ==nftOwner){
            nftOwner:=newOwner;
            return "Success";
        }else{
            return "Error: Not invalid Owner!";
        }
    }

};