import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat8 "mo:base/Nat8";
import NFTActorClass "../NFT/nft";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
import Prelude "mo:base/Prelude";
import Iter "mo:base/Iter";


actor OpenD {

    //this fn will keep track of all the records for the nft sold 
    //new datadype
    private type Listing = {
        itemOwner:Principal;
        itemPrice:Nat;
    };

    var mapOfNFTs=HashMap.HashMap<Principal,NFTActorClass.NFT>(1,Principal.equal,Principal.hash);
    //map of owners ,principal id of owners who have minted on our website and match them with the nft that they own and bring it to the galary.
    // each owner can own several nft so we need a list to link them
    var mapOfOwners=HashMap.HashMap<Principal,List.List<Principal>>(1,Principal.equal,Principal.hash);
    //map of all the listing and function going to add to this map
    var mapOfListings= HashMap.HashMap<Principal,Listing>(1,Principal.equal,Principal.hash);

    public shared(msg) func mint(imgData:[Nat8],name:Text):async Principal{
        //access the identity of the user who called this method
        //gonna be called from frontend form minter.jsx
        let owner:Principal=msg.caller;

        //these should get cycles when deployed to icp
        // Cycles.add(100_500_00_000);
        //for async add await
        let newNFT =await NFTActorClass.NFT(name, owner,imgData);
        let newNFTPrincipal = await newNFT.getAssetcanisterId();
        //add new nft to hash
        mapOfNFTs.put(newNFTPrincipal,newNFT);

        //to get hold of existing list that stored in mapOfOwner
        addToOwnershipMap(owner,newNFTPrincipal);

        return newNFTPrincipal;
    };


    //func for maping the list of nft owned by owner
    private func addToOwnershipMap(owner:Principal,nftId:Principal){
        var ownedNFTs:List.List<Principal> = switch(mapOfOwners.get(owner)){
            //to write empty list in motoku
            case null List.nil<Principal>();
            case (?result) result;
        };
        ownedNFTs:=List.push(nftId,ownedNFTs);
        mapOfOwners.put(owner,ownedNFTs);
    };


    //to able to bring this from backend over to the frontend
    public query func getOwnedNFTs(user:Principal) : async [Principal]{
        //to return the value of the Key that we are matching with 
        var userNFTs:List.List<Principal> = switch(mapOfOwners.get(user)){
            case null List.nil<Principal>();
            case (?result) result;
        };
        return List.toArray(userNFTs);
    };

    public query func getListedNFTs():async [Principal]{
        //keys of hashmap
        let ids= Iter.toArray( mapOfListings.keys()); 
        return ids;
    };

    public shared(msg) func listItem(id:Principal,price:Nat):async Text {
        var item : NFTActorClass.NFT =switch (mapOfNFTs.get(id)){
            case null return "NFT does not exist.";
            case(?result) result;
        };
         //to make sure msg.caller is same as the owner of the item
         let owner = await item.getOwner();
         if(Principal.equal(owner,msg.caller)){
            let newListing :Listing={
                itemOwner=owner;
                itemPrice=price;
            };
            mapOfListings.put(id, newListing);
            return "Success";

         }else{
            return "you don't own the nft";
         };
    };

    public query func getOpenDCanisterID():async Principal {
        return Principal.fromActor(OpenD);
    };

    //fn to keep check on items which have been listed for sale
    public query func isListed(id:Principal):async Bool{
        if(mapOfListings.get(id)==null){
            return false;
        }else{
            return true;
        }
    };

    public query func getOriginalOwner(id:Principal):async Principal{
        var listing : Listing= switch(mapOfListings.get(id)){
            case null return Principal.fromText("");
            case (?result) result;
        };
        return listing.itemOwner;
    };

    //for the pricing
    public query func getListedNFTPrice(id: Principal): async Nat {
        var listing :Listing =switch(mapOfListings.get(id)){
            case null return 0;
            case (?result) result;
        };
        return listing.itemPrice;
    };

    //complete purchase

    public shared(msg) func completePurches(id:Principal, ownerId:Principal,newOwnerId: Principal): async Text{
        var purchasedNFT :NFTActorClass.NFT=switch (mapOfNFTs.get(id)){
            case null return "NFT does not exist";
            case(?result) result;
        };
        let transferResult = await purchasedNFT.transferOwnership(newOwnerId);
        if(transferResult == "Success"){
            mapOfListings.delete(id);
            var ownedNFTs : List.List<Principal> =switch(mapOfOwners.get(ownerId)){
                case null List.nil<Principal>();
                case (?result) result;
            };
            ownedNFTs := List.filter(ownedNFTs,func(listItemId:Principal):Bool{
                return listItemId !=id;
            });
            addToOwnershipMap(newOwnerId,id);
            return "Success";
        }else{
            return transferResult;
        }
    };
 
};
