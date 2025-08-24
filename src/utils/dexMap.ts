type RouterKey = `${number}:${string}`; // chainId:routerAddress (lowercased)
type ProgramKey = `solana:${string}`; // Solana program id (lowercased)

// ---------- EVM routers ----------
export const ROUTER_TO_SLUG: Record<RouterKey, string> = {
  // Ethereum
  "1:0x7a250d5630b4cf539739df2c5dacb4c659f2488d": "uniswap",
  "1:0xe592427a0aece92de3edee1f18e0157c05861564": "uniswap",
  "1:0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": "uniswap",
  "1:0x66a9893cc07d91d95644aedd05d03f95e1dba8af": "uniswap",
  "1:0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad": "uniswap",
  "1:0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f": "sushiswap",

  // BSC
  "56:0x10ed43c718714eb63d5aa57b78b54704e256024e": "pancakeswap",
  "56:0x1b81d678ffb9c0263b24a97847620c99d213eb14": "pancakeswap",
  "56:0x13f4ea83d0bd40e75c8222255bc855a974568dd4": "pancakeswap",
  "56:0x1a0a18ac4becddbd6389559687d1a73d8927e416": "pancakeswap",
  "56:0x1b02da8cb0d097eb8d57a175b88c7d8b47997506": "sushiswap",
  "56:0xb971ef87ede563556b2ed4b1c0b0019111dd85d2": "uniswap",
  "56:0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24": "uniswap",

  // Base
  "8453:0x2626664c2603336e57b271c5c0b26f421741e481": "uniswap",
  "8453:0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24": "uniswap",
  "8453:0x198ef79f1f515f02dfe9e3115ed9fc07183f02fc": "uniswap",
  "8453:0xfe6508f0015c778bdcc1fb5465ba5ebe224c9912": "pancakeswap",
  "8453:0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43": "aerodrome",
};

// ---------- Solana programs ----------
export const PROGRAM_TO_SLUG: Record<ProgramKey, string> = {
  "solana:dexyoss6oegvk8ucdayvwezz4qeydjrf9nfgycaqpmtm": "1dex",
  "solana:pammbay6oceh9fjkbrhgp5d4bd4swpmswmn52fmfxea": "pump",
  "solana:cammczo5yl8w4vff8kvhrk22ggusp5vtaw7grrkgrwqk": "raydium",
  "solana:5u3eu2ubxtk84qcrjwvmyt9radya8gkxdurpfxmzyaki": "virtuals-protocol",
  "solana:9w959dqeetigzocywcqpaj6sbmuzgfxxfqgetedp3aqp": "orca",
  "solana:obriqd1zbpylz95g5n7nje6a4dpjpfwa5xyponm113y": "obric",
  "solana:cpmmoo8l3f4nbtegbckvnunggl7h1zpdthkxqb5qkp1c": "raydium",
  "solana:5ocnv1qicgaqr8jb8xwnvbapfaygj8tnozfgpwsgx9kx": "sanctum-infinity",
  "solana:bswp6bebihvldqjrkggzjcglhkctuzmso1tqkhepzh8p": "bonkswap",
  "solana:6ef8rrecthr5dkzon8nwu78hrvfckubj14m5ubewf6p": "pump",
  "solana:amm55shdkogrb5jvypjwziwk8m5mpwydgsmwhamsqwh6": "aldrin",
  "solana:675kpx9mhtjs2zt1qfr1nyhuzelxfqm9h24wfsut1mp8": "raydium",
  //"solana:whirlbmiicvdio4qvufm5kag6ct8vwpyzgff3uctycc": "whirlpool",
  "solana:srmqpvymjefkq4zgqed1gfppgkrhl9kaelcbyksjtpx": "openbook",
  "solana:endolncktqdn8gsvnn2hddpgacupwhztwoynnmybpat": "solayer",
  "solana:curvgozn8zycx6fxwwevgbtb2gvvdbgtepvmjdbgs2t4": "aldrin",
  "solana:djve6jniyqpl2qxycuuh8rnjhrbz9hxhnyt99mq59qw1": "orca",
  "solana:hyab3w9q6xda5xwpu4xnszv94htfmbmqjxzcebrajutt": "invariant",
  "solana:solfihg9tfgtduxujwaxi3ltvyufydlvhbwxdmzxyce": "solfi",
  "solana:2wt8yq49khgdzxupxzsaelah1qbmgxteypy64bl7ad3c": "lifinity",
  "solana:fluxubrmkei2q6k3y9kbpg9248ggazvsosfhtjhsrm1x": "fluxbeam",
  "solana:zeror4xhbuycz6gb9ntrhqscuczmabqdjeatcf4hbzy": "zerofi",
  "solana:phoenixz8byjglkxnfzrnkufjvmuyqlr89jjfhgqdxy": "phoenix",
  "solana:treaf4wwbbty3fhdybpo35mz84m8k3hekxmjmi9vft5": "helium",
  //"solana:merludfbmmshnsbpzw2sdqzhvxfmwp8edjudcu2hkky": "mercurial",
  //"solana:5jnapfran47uyklkef7hnprppbcqlvkywgzdekkap5hv": "daos.fun",
  "solana:sswpkeecbuqx4vtoebyfjskhkdct862dnvb52nzg1uz": "saber",
  "solana:eo7wjkq67rjjqszxs6z3ykapzy3emj6xy8x5eqvn5uab": "meteora",
  "solana:joearxgtme3jaoz5wufxgendfv4nph9nbxslq44hk9j": "token-mill",
  "solana:clmm9tuoggju2wagpkkqs9efg4bwhvbzwkp1qv3sp7tr": "crema-finance",
  //"solana:dswpgjmvxhtgn6bsbqmacdbzyflj6jswf3hjpdjtmg6n": "dexlab",
  "solana:pswapmdsai8tjrexcxfeqth87xc4rrsa4va5mhghxkp": "penguin",
  "solana:9tke7mbmj4mxdjwatikzgatkowosiizx9y6j4hfm2r8h": "oasis",
  //"solana:swappa9laalfeli3a68m4djnlqgttickg6cnynwgac8": "token-swap",
  "solana:mooncvvnzfsykqnxp6bxhlpl6qqjimagdl3qcquqtrg": "moonshot",
  "solana:gamma7mesfwabxf25osugmgrwaw6scmflmbnimsdbhvt": "goosefx",
  "solana:h8w3ctz92svyg6mkn1utgfu2aqr2fnufhm1rhscetqdt": "cropper",
  "solana:lbuzkhrxpf3xupbcjp4yztkglccjzhtsdm9yuvapwxo": "meteora",
  "solana:swapfphzwjelnnjvthjajtivmkz3ypqehjltka2fwhw": "stabble",
  "solana:stkitrt1uoy18dk1ftrgpw8w6mvzocfyoaft4mlsmhq": "sanctum",
  "solana:sswaputytfbdbn1b9nugg6fomvptcwgpru32htoduzr": "saros",
  "solana:swapnyd8xiqwj6ianp9snpu4bruqfxadzvhebnaxjjz": "stabble",
  "solana:perphjgbqrharx4dysjwm6ujhir3swaatqfdbs2qqju": "perpstreet",
  "solana:gswppe6erwkputxvrpfxdzhhicyjvladvvxgfdpbqce1": "guacswap",
  "solana:opnb2lafjybrmahhvqjcwqxanzn7reehp1k81eohpzb": "openbook",
  "solana:dooar9jkhdz7j3lhn3a7ycuogruggxhqag4kijflgu2j": "stepn",
  "solana:deczy86mu5gj7kppfucemd4lbxxuyzh1yhap2ntqdizb": "saber",
  "solana:dbcij3lwuppwqq96dh6gjwwbifmcgflsb5d4dusmaqn": "raydium",
  "solana:heavenop2qxoeuf8dj2ot1ghenu49u5mjykdec8bax2o": "heaven",
  "solana:cpamdpzcgkuy5jxqxb4dcpgpiikhawvswad6men1sgg": "meteora",
  "solana:lanmv9sad7ward4vjfi2qddfnvhfxysug6eadduj3uj": "raydium",
};

const SOLANA_CHAIN_ID = 900;

// Helpers
export function getSlugByRouter(
  chainId: number,
  routerAddress?: string | null
): string | null {
  if (!chainId || !routerAddress) return null;
  if (chainId === SOLANA_CHAIN_ID) {
    return getSlugBySolanaProgram(routerAddress);
  }
  const key = `${chainId}:${routerAddress.toLowerCase()}` as RouterKey;
  return ROUTER_TO_SLUG[key] ?? null;
}

export function getSlugBySolanaProgram(
  programId?: string | null
): string | null {
  if (!programId) return null;
  const key = `solana:${programId.toLowerCase()}` as ProgramKey;
  return PROGRAM_TO_SLUG[key] ?? null;
}
