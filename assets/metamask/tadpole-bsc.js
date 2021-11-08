const blocksPerDay = 12 * 60 * 24;
const daysPerYear = 365;
const mentissa = 1e18;

var _BSC_ENV_BSC = {
    "id": 1,
    "comptrollerAddress": "0x8Cb331D8F117a5C914fd0f2579321572A27bf191",
    "oracleAddress": "0x2E0490c8fd2b23cB323370bb7958204A23504AaC",
    "tadAddress": "0x9f7229aF0c4b9740e207Ea283b9094983f78ba04",
    "etherscan": "https://bscscan.com/",
    "cTokens": {
        "tad": {
            "id": "tad",
            "name": "TAD",
            "index": "tadpole-finance",
            "unit": "TAD",
            "logo": "./assets/images/tokens/tad_32.png",
            "cTokenDecimals": 8,
            "underlyingDecimals": 18,
            "address": "0x684EB9b9675B9999F4b50038Ce7151E68f111ca6",
            "underlyingAddress": "0x9f7229aF0c4b9740e207Ea283b9094983f78ba04"
        },
        "usdt": {
            "id": "usdt",
            "name": "USDT",
            "index": "tether",
            "unit": "USDT",
            "logo": "./assets/libs/cryptocurrency-icons/32/color/usdt.png",
            "cTokenDecimals": 8,
            "underlyingDecimals": 18,
            "address": "0x7d611B1B0B70Fcf0678d44893418301c712C868E",
            "underlyingAddress": "0x55d398326f99059fF775485246999027B3197955"
        },
        "bnb": {
            "id": "bnb",
            "name": "BNB",
            "index": "bnb",
            "unit": "BNB",
            "logo": "./assets/libs/cryptocurrency-icons/32/color/bnb.png",
            "cTokenDecimals": 8,
            "underlyingDecimals": 18,
            "address": "0x3f01C2b4A090Fa8BD36e87B78e0d75e37d2d5D90",
            "underlyingAddress": "0x"
        }
    }
}

var MARKET_BSC = {
    "markets": {
        "totalSupplyVal": {
            "inUSD": 0,
        },
        "totalBorrowsVal": {
            "inUSD": 0,
        },
    },
    "cToken": {
        "tad": {
            "getCash": 0,
            "totalBorrows": 0,
            "totalReserves": 0,
            "coingeckoUrl": "https://api.coingecko.com/api/v3/coins/tadpole-finance?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
            "priceUSD": 0,
            "totalSupplyVal": {
                "decimalValue": 0,
                "inUSD": 0,
            },
            "totalBorrowsVal": {
                "decimalValue": 0,
                "inUSD": 0,
            },
        },
        "usdt": {
            "getCash": 0,
            "totalBorrows": 0,
            "totalReserves": 0,
            "coingeckoUrl": "https://api.coingecko.com/api/v3/coins/tether?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
            "priceUSD": 0,
            "totalSupplyVal": {
                "decimalValue": 0,
                "inUSD": 0,
            },
            "totalBorrowsVal": {
                "decimalValue": 0,
                "inUSD": 0,
            },
        },
        "bnb": {
            "getCash": 0,
            "totalBorrows": 0,
            "totalReserves": 0,
            "coingeckoUrl": "https://api.coingecko.com/api/v3/coins/binancecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
            "priceUSD": 0,
            "totalSupplyVal": {
                "decimalValue": 0,
                "inUSD": 0,
            },
            "totalBorrowsVal": {
                "decimalValue": 0,
                "inUSD": 0,
            },
        },
    },
};
var ENV_BSC_BSC = _BSC_ENV_BSC;
// ----------------------------

var syncCont = function () {
    ENV_BSC = _BSC_ENV_BSC;
    ENV_BSC.comptrollerContract = new web3BSC.eth.Contract(comptrollerAbi, ENV_BSC.comptrollerAddress);
    ENV_BSC.oracleContract = new web3BSC.eth.Contract(oracleAbi, ENV_BSC.oracleAddress);

    Object.values(ENV_BSC.cTokens).forEach(async function (cToken, index) {
        if (cToken.id == 'bnb') ENV_BSC.cTokens[cToken.id].contract = new web3BSC.eth.Contract(cEtherAbi, cToken.address);
        else ENV_BSC.cTokens[cToken.id].contract = new web3BSC.eth.Contract(cErc20Abi, cToken.address);
    });
}

var syncRate = function () {
    ENV_BSC = _BSC_ENV_BSC;

    Object.values(ENV_BSC.cTokens).forEach(async function (cToken, index) {
        var supplyRatePerBlock = await cToken.contract.methods.supplyRatePerBlock().call();
		var borrowRatePerBlock = await cToken.contract.methods.borrowRatePerBlock().call();
        var supplyApy = (((Math.pow((supplyRatePerBlock / mentissa * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
		var borrowApy = (((Math.pow((borrowRatePerBlock / mentissa * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
        $('.' + cToken.id + '-apy').html(supplyApy.toFixed(2));
        $('.' + cToken.id + '-borrow-rate').html(borrowApy.toFixed(2));
    });
}

var syncMarkets = async function () {
    ENV_BSC = _BSC_ENV_BSC;
    var i = 0;

    Object.values(ENV_BSC.cTokens).forEach(async function (cToken, index) {
        var getCash = await cToken.contract.methods.getCash().call();
        var totalBorrows = await cToken.contract.methods.totalBorrows().call();
        var totalReserves = await cToken.contract.methods.totalReserves().call();

        // ===========
        MARKET_BSC.cToken[cToken.id].getCash = getCash;
        MARKET_BSC.cToken[cToken.id].totalBorrows = totalBorrows;
        MARKET_BSC.cToken[cToken.id].totalReserves = totalReserves;
        MARKET_BSC.cToken[cToken.id].totalSupplyVal.decimalValue = ((getCash/(10**18)) + (totalBorrows/(10**18)) - (totalReserves/(10**18)));
        MARKET_BSC.cToken[cToken.id].totalBorrowsVal.decimalValue = (totalBorrows/(10**18));

        // ===== coingecko api
        let response = await new Promise(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", MARKET_BSC.cToken[cToken.id].coingeckoUrl, true);
            xhr.onload = function(e) {
              resolve(JSON.parse(xhr.response));
            };
            xhr.onerror = function () {
              resolve(undefined);
              console.error("** An error occurred during the XMLHttpRequest");
            };
            xhr.send();
        });
        MARKET_BSC.cToken[cToken.id].priceUSD = response.market_data.current_price.usd;
        MARKET_BSC.cToken[cToken.id].totalSupplyVal.inUSD = MARKET_BSC.cToken[cToken.id].totalSupplyVal.decimalValue * MARKET_BSC.cToken[cToken.id].priceUSD;
        MARKET_BSC.cToken[cToken.id].totalBorrowsVal.inUSD = MARKET_BSC.cToken[cToken.id].totalBorrowsVal.decimalValue * MARKET_BSC.cToken[cToken.id].priceUSD;
        MARKET_BSC.markets.totalSupplyVal.inUSD = MARKET_BSC.cToken.tad.totalSupplyVal.inUSD + MARKET_BSC.cToken.usdt.totalSupplyVal.inUSD + MARKET_BSC.cToken.bnb.totalSupplyVal.inUSD;
        MARKET_BSC.markets.totalBorrowsVal.inUSD = MARKET_BSC.cToken.tad.totalBorrowsVal.inUSD + MARKET_BSC.cToken.usdt.totalBorrowsVal.inUSD + MARKET_BSC.cToken.bnb.totalBorrowsVal.inUSD;

        i++;
        if(i == 3){
            $('.markets-total-supply-usd').html('$' + MARKET_BSC.markets.totalSupplyVal.inUSD.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
            $('.markets-total-borrows-usd').html('$' + MARKET_BSC.markets.totalBorrowsVal.inUSD.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
            let tadSupply = Math.round(((MARKET_BSC.cToken.tad.totalSupplyVal.inUSD/MARKET_BSC.markets.totalSupplyVal.inUSD)*100));
            let tadBorrows = Math.round(((MARKET_BSC.cToken.tad.totalBorrowsVal.inUSD/MARKET_BSC.markets.totalBorrowsVal.inUSD)*100));
            let usdtSupply = Math.round(((MARKET_BSC.cToken.usdt.totalSupplyVal.inUSD/MARKET_BSC.markets.totalSupplyVal.inUSD)*100));
            let usdtBorrows = Math.round(((MARKET_BSC.cToken.usdt.totalBorrowsVal.inUSD/MARKET_BSC.markets.totalBorrowsVal.inUSD)*100));
            let bnbSupply = Math.round(((MARKET_BSC.cToken.bnb.totalSupplyVal.inUSD/MARKET_BSC.markets.totalSupplyVal.inUSD)*100));
            let bnbBorrows = Math.round(((MARKET_BSC.cToken.bnb.totalBorrowsVal.inUSD/MARKET_BSC.markets.totalBorrowsVal.inUSD)*100));

            $('.usd-supply-tad').html('TAD ($' + MARKET_BSC.cToken.tad.totalSupplyVal.inUSD.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + ')');
            $('.usd-supply-usdt').html('USDT ($' + MARKET_BSC.cToken.usdt.totalSupplyVal.inUSD.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + ')');
            $('.usd-supply-bnb').html('BNB ($' + MARKET_BSC.cToken.bnb.totalSupplyVal.inUSD.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + ')');
            $('.usd-borrows-tad').html('TAD ($' + MARKET_BSC.cToken.tad.totalBorrowsVal.inUSD.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + ')');
            $('.usd-borrows-usdt').html('USDT ($' + MARKET_BSC.cToken.usdt.totalBorrowsVal.inUSD.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + ')');
            $('.usd-borrows-bnb').html('BNB ($' + MARKET_BSC.cToken.bnb.totalBorrowsVal.inUSD.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + ')');

            $('.percent-supply-tad').html(tadSupply + '%');
            $('.percent-supply-usdt').html(usdtSupply + '%');
            $('.percent-supply-bnb').html(bnbSupply + '%');
            $('.percent-borrows-tad').html(tadBorrows + '%');
            $('.percent-borrows-usdt').html(usdtBorrows + '%');
            $('.percent-borrows-bnb').html(bnbBorrows + '%');
            
            $('.progress-supply-tad').attr('style', 'width: '+tadSupply+'%;');
            $('.progress-supply-usdt').attr('style', 'width: '+usdtSupply+'%;');
            $('.progress-supply-bnb').attr('style', 'width: '+bnbSupply+'%;');
            $('.progress-borrows-tad').attr('style', 'width: '+tadBorrows+'%;');
            $('.progress-borrows-usdt').attr('style', 'width: '+usdtBorrows+'%;');
            $('.progress-borrows-bnb').attr('style', 'width: '+bnbBorrows+'%;');

            $('.loading-progress-markets').hide();
        }
    });
}

$(document).ready(function () {
    syncCont();
    syncRate();
});