export function getKeyName(...args:string[]){
    return `bites:${args.join(":")}`
}
export const getuserKeyName=(id:string)=>{
    return getKeyName(id)
}
export const getAuctionKeyName=(id:string)=>{
    return getKeyName("auction",id)
}