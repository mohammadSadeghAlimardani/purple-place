const alert = document.querySelector(".alert");
const chooseGrid = document.querySelector(".choose-grid");
const form = document.querySelector("form");
const inputRadioBoxes = [...document.querySelectorAll("input")];
const startGameBtn = document.querySelector("#start-game");
const cardsContainer = document.querySelector(".cards-container");
let click_count = 0;

form.addEventListener("submit", submitForm);

async function submitForm(e){
    e.preventDefault();

    //if user does not select anyone of grids : 
    const noInputSelected = inputRadioBoxes.every(inputRadioBox => inputRadioBox.checked == false);
    if(noInputSelected){
        alert.classList.add("show");
        setTimeout(() => {
            alert.classList.remove("show");
        }, 3500);
        return;
    }
    
    //if user selected one of grids (number of columns):
    selctedInput = inputRadioBoxes.find(inputRadioBox => inputRadioBox.checked == true);
    let columns;
    if(selctedInput.id == "4*4"){
        columns = 4;
    }else if(selctedInput.id == "6*6"){
        columns = 6;
    }else if(selctedInput.id == "8*8"){
        columns = 8;
    }
    cardsContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;


    //call Timer :
    Timer(columns);


    //get all images from json file :
    const allImages = await fetchImages();
    let numberOfImages = allImages.length;
    
    //images that will be selected :
    const selectedImages = []; 
    let numberOfSelectedImages = 0;
    while(numberOfSelectedImages < ((columns ** 2) / 2)){
        const randomNumber = parseInt((Math.random() * numberOfImages));            //32 is numberOfImages
        const isSelected = allImages[randomNumber]["is-selected"];
        if(isSelected == false){
            allImages[randomNumber]["is-selected"] = true;
            selectedImages.push(allImages[randomNumber]);
            numberOfSelectedImages++;
        }
    } 
    
    //create cards and put them in random positions:
    let flag = true;
    while(flag){
        const randomNumber = parseInt((Math.random() * selectedImages.length));            
        let useCount = selectedImages[randomNumber]["use-count"];
        const src = selectedImages[randomNumber].src;
        if(selectedImages[randomNumber] && useCount < 2){
            selectedImages[randomNumber]["use-count"]++;
            const card = document.createElement("div");
            card.classList.add("card");
            card.setAttribute("data-id", selectedImages[randomNumber]["dataId"])
            card.innerHTML =    `
                                <div class="front"></div>
                                <div class="back" style="background : url(${src}) 0 50%/cover;"></div>
                                `;
            cardsContainer.appendChild(card);
        }
        if(selectedImages.every(selectedImage => selectedImage["use-count"] == 2)){
            flag = false;
        }
    }

    //click event for cards :
    const cards = [...cardsContainer.children];
    let numberOfRotatedCards = 0;
    let IdCards = [];
    let DoubleClickCard;
    cards.forEach(card => {
        card.addEventListener("click", function(e){
            //prevent double click on a card :
            if(DoubleClickCard && DoubleClickCard == e.currentTarget){
                return;    
            }
            DoubleClickCard = e.currentTarget;
            //sound effect for click card :
            const clickMusicAudio = document.querySelector(".clickMouse-music");
            clickMusicAudio.play();
            //rotate cards :
            card.classList.add("rotated");
            //count clicks :
            click_count++;
            //get IdCards to check their match :
            IdCards.push(card.getAttribute("data-id"));
            numberOfRotatedCards++;
            if(numberOfRotatedCards == 2){
                numberOfRotatedCards = 0;
                const rotatedCards = cards.filter(card => card.classList.contains("rotated"));
                setTimeout(() => {
                    if(IdCards[0] == IdCards[1]){
                        //sound effect for finding same cards :
                        const findSameCardsMusic = document.querySelector(".findSameCards-music");
                        findSameCardsMusic.play();
                        IdCards = [];
                        rotatedCards.forEach(rotatedCard => {
                            rotatedCard.classList.add("hidden");
                        })
                    }else{
                        IdCards = [];
                        rotatedCards.forEach(rotatedCard => {
                            rotatedCard.classList.remove("rotated");
                        })
                    }
                    DoubleClickCard = undefined;
                }, 500);
            }
        })
    })
    chooseGrid.classList.add("hide");
}

//fetch images :
async function fetchImages(){
    const response = await fetch('./api/images.json');
    const data = await response.json();
    return data;
}


//STOP WATCH :
const victoryMessage = document.querySelector(".victory-message");
const gameOverMessage = document.querySelector(".gameOver-message");
const progressStopWatch = document.querySelector(".progress-stop-watch");
const progressStopWatchValue = document.querySelector(".progress-stop-watch-value");

function Timer(columns){
    let needTime;
    if(columns == 4){
        needTime = 45;
    }else if(columns == 6){
        needTime = 100;
    }else if(columns == 8){
        needTime = 210;
    }
    const PSWPrimaryHeight = progressStopWatch.getBoundingClientRect().height;
    const increaseHeightPerSecond = ((100 / needTime) * PSWPrimaryHeight) / 100;
    let finishTime = 0;
    let increase = setInterval(() => {
        let currentHeight = progressStopWatchValue.getBoundingClientRect().height;
        currentHeight += increaseHeightPerSecond;
        progressStopWatchValue.style.height = `${currentHeight}px`;
        const percentage = Math.ceil(currentHeight / progressStopWatch.getBoundingClientRect().height * 100);
        finishTime++;
        if(percentage >= 100){
            clearInterval(increase);
            setTimeout(() => {
                //sound effect for gameOver :
                const gameOverMusic = document.querySelector(".gameOver-music");
                gameOverMusic.play();
                gameOverMessage.classList.add("show");
            }, 500);
        }else{
            const cards = [...cardsContainer.children];
            const isAllCardsHidden = cards.every(card => card.classList.contains("hidden"));
            if(isAllCardsHidden){
                clearInterval(increase);
                setTimeout(() => {
                    //sound effect for victory :
                    const victoryMusic = document.querySelector(".victory-music");
                    victoryMusic.play();
                    victoryMessage.querySelector("p.finish-time").textContent = `you finished it in ${finishTime} seconds`;
                    victoryMessage.querySelector("p.finish-clicks").textContent = `and with ${click_count} clicks`;
                    victoryMessage.classList.add("show");
                }, 250);
                //create and minimize star icons :
                setTimeout(() => {
                    createStarIcon();
                    setTimeout(() => {
                        createStarIcon();
                        setTimeout(() => {
                            createStarIcon();
                        }, 2000); 
                    }, 1750); 
                }, 1250);
            }
        }
    }, 1000);
}

function createStarIcon(){
    //create startIcon Element : 
    const starIconsContainer = victoryMessage.querySelector("ul.starIcons-container");
    const starIcon = document.createElement("i");
    starIcon.className = "fa-solid fa-star";
    starIcon.classList.add("minimized");
    //add starIcon to ul :
    starIconsContainer.appendChild(starIcon);
    //sound effect for coming starIcon :
    const minimizeStarIconMusic = document.querySelector(".minimizeStarIcon-music");
    minimizeStarIconMusic.play();
}