
const generateRandomNumbers = (halfItems) => {
    let flag = true;
    let position = [];
    while(flag){
        let size = 0;
        const randomNumber = Math.floor(Math.random() * halfItems);       
        position.push(randomNumber);
        position = [...new Set(position)];
        for (let index = 0; index < halfItems; index++) {
            if(position.includes(index)){
                size++;
            }
        }
        if(size == parseInt(halfItems)){
            flag = false;
        }else{
            flag = true;
        }
    }
    return position;
}


let shownItems = 0;
let dataCardList = [];

const cardContainer = document.querySelector(".card-container");
const api = "./api/flip-card-back-items.json";

const fetchItems = async () => {
    const response = await fetch(api);
    const data = await response.json();
    displayItems(data);
}

function createFlipCard(position, items){
    position.map(number => {
        const {htmlEntity, dataCard} = items[number];
        const flipcard = document.createElement("div");
        flipcard.classList.add("flip-card");
        flipcard.innerHTML =    `<div class="flip-card-inner rotate">
                                    <div class="flip-card-front">
                                        <img src="./images/card-front(red-planet).jpg" alt="planet"/>
                                    </div>
                                    <div class="flip-card-back" data-card="${dataCard}">
                                        ${htmlEntity}
                                    </div>
                                </div>`;
        cardContainer.appendChild(flipcard);
    })
}

function backToDefault(){
    setTimeout(() => {
        cardContainer.querySelectorAll(".flip-card-inner").forEach(flipCardInner => {
            flipCardInner.classList.remove("rotate");
        })
    }, 3500);
}

function displayItems(items){

    let position = generateRandomNumbers(items.length);
    createFlipCard(position, items);
    position = generateRandomNumbers(items.length);
    createFlipCard(position, items);

    backToDefault();

    const flipCards = document.querySelectorAll(".flip-card");
    flipCards.forEach(flipcard => {
        flipcard.addEventListener("click", function(){
            document.querySelector("audio#click-effect").play();
            shownItems++;
            flipcard.querySelector(".flip-card-inner").classList.add("rotate");
            const dataCard = flipcard.querySelector(".flip-card-inner .flip-card-back").dataset.card;
            dataCardList.push(dataCard);
            if(shownItems == 2){
                setTimeout(() => {
                    flipCards.forEach(flipcard => {      
                        flipcard.querySelector(".flip-card-inner").classList.remove("rotate");     
                    })
                }, 750);
                shownItems = 0;
                dataCardList = [...new Set(dataCardList)];
                if(dataCardList.length == 1){
                    let item = dataCardList[0];
                    document.querySelectorAll(".flip-card-back").forEach(flipCardBack => {
                        if(flipCardBack.dataset.card == item){
                            setTimeout(() => {
                                document.querySelector("audio#find-same-items").play();
                                flipCardBack.parentElement.parentElement.style.visibility = "hidden";
                            }, 1000);
                        }
                    })
                }
                dataCardList = []; 
            }
        })
    })
}

function timeRemainingProgress(){
    const hourGlassProgress = document.querySelector(".hourglass-progress");
    const now = new Date().getTime();
    const gameTime = 70    // seconds
    const target = now + (gameTime * 1000) + 2500;  //4 minutes later => 242 miliseconds => 2 seconds delay
    let progress = setInterval(() => {
        const present = new Date().getTime();
        const distance = target - present;
        const minute = parseInt((distance / (1000 * 60)));
        const second = parseInt((distance / 1000) - (minute * 60));
        if(hourGlassProgress.style.height){
            const heightStyle = hourGlassProgress.style.height;
            hourGlassProgress.style.height = `calc(${100/gameTime}% + ${heightStyle})`;
        }else{
            hourGlassProgress.style.height = `${100/gameTime}%`;
        }
        if(minute == 0 && second == 0){
            clearInterval(progress);
            checkLose();
            checkVictory(progress);
        }else{
            checkVictory(progress);
        }
    }, 1000);
}

function checkVictory(progress){
    const condition = [...document.querySelectorAll(".flip-card")].every(flipCard => flipCard.style.visibility == "hidden");
    if(condition && progress){   
        clearInterval(progress);
        document.querySelector(".alert.winner").classList.add("show");
        document.querySelector("audio#winning-game").play();
        setTimeout(() => {
            document.querySelector(".alert.winner .alert-message .alert-shape-message").classList.add("show");
        }, 1300);
    }
    return true;
}

function checkLose(){
    const condition = [...document.querySelectorAll(".flip-card")].every(flipCard => flipCard.style.visibility == "hidden");
    if(!condition){
        document.querySelector(".alert.loser").classList.add("show");
        document.querySelector("audio#losing-game").play();
        setTimeout(() => {
            document.querySelector(".alert.loser .alert-message .alert-shape-message").classList.add("show");
        }, 1300);
    }
}

window.addEventListener("DOMContentLoaded", fetchItems);
window.addEventListener("DOMContentLoaded", timeRemainingProgress);