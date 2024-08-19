let clickTimeout = null
let moveHistory = []
let yourTilesHistory = []


function createTile (value1, value2){
    const tile = document.createElement('div')
    tile.className= 'tile'

    const half1 = document.createElement('div')
    half1.className = 'half'
    half1.textContent = value1

    const half2 = document.createElement('div')
    half2.className = 'half'
    half2.textContent = value2

    tile.appendChild(half1)
    tile.appendChild(half2)


// Single click and double click handeling 
   tile.addEventListener('click', function(event){
     event.preventDefault()

     if(clickTimeout){
        clearTimeout(clickTimeout)
        clickTimeout = null
        
        // Check if the tile is in the 'All Tiles' box before copying //
        if(document.getElementById('tilesLeft').contains(tile)){
            addToYourTiles(tile) // tile parameter added
        }
        } else{
            clickTimeout = setTimeout(() => {
                // play tiles regarding of its current box
                playTile(tile)
                clickTimeout = null
            }, 300)  // 300ms delay to distinguish between single and double click
        }
   })
    return tile
}


function createTilesLeftContainer(){
    const tilesLeft = document.getElementById('tilesLeft')
    tilesLeft.innerHTML = ''

    for(let i = 0; i<= 6; i++){
        let row = document.createElement('div')
        row.className = 'row'
        
        let rowHeading = document.createElement('div')
        rowHeading.className = 'row-heading'
        rowHeading.textContent = i

        let tilesContainer = document.createElement('div')

        for(let j = i; j <= 6; j++){
          let domino = createTile(i, j)
          tilesContainer.appendChild(domino)
        }
    
        row.appendChild(rowHeading)
        row.appendChild(tilesContainer)
        tilesLeft.appendChild(row)
    }
}




function playTile(tile){
    const value1 = tile.children[0].textContent
    const value2 = tile.children[1].textContent
    
    // Store the current state before playing the tile 
    moveHistory.push({
     tile : tile.cloneNode(true),
     fromYourTiles : document.getElementById('yourTiles').contains(tile), 
     fromAllTiles : document.getElementById('tilesLeft').contains(tile)
    })
 
    // Move tile to 'Tile Played' box 
    const board = document.getElementById('board')
    board.appendChild(tile)
 
    // Remove the exact same tile from 'All Tiles' and 'Your Tiles' box
      removeTileFromBox('tilesLeft', value1, value2)
      removeTileFromBox('yourTiles', value1, value2)
 
    // Remove the event Listener from the tile in 'Tiles Played' box
    tile.onClick = null
 }


 function removeTileFromBox(containerId, value1, value2){
    const container = document.getElementById(containerId)
    const tiles = container.querySelectorAll('.tile')

    tiles.forEach((tile) => {
       if(tile.children[0].textContent === value1 && tile.children[1].textContent === value2){
        tile.remove()
       }
    })
}



// tile arguments added
function addToYourTiles(tile){
   const yourTiles = document.getElementById('yourTiles')

    // Check if there are already 7 tiles
    if(yourTiles.childElementCount >= 7) {
        const errorMessage = document.createElement('div')
        errorMessage.textContent = 'You cannot have more than 7 tiles'
        errorMessage.style.color = 'red'

        // Making sure the error message is appearing in a visible location for user (avobe the 'Your Tiles' box)
        yourTiles.parentElement.insertBefore(errorMessage, yourTiles)

        // Removing the error message after 3 seconds
       setTimeout(() => errorMessage.remove(), 3000)
       return
    } 



    // // Check if the tile exist in 'Your Tiles' box
    // const value1 = tile.children[0].textContent
    // const value2 = tile.children[1].textContent ;

    // // Converting the HTML data collection to an Array which was an Array like data but not an Array
    // const yourTilesArray = [...yourTiles.children]

    // // Defining the logic of Duplicate
    // const duplicate = yourTilesArray.some((existingTiles) => {
    //     existingTiles.children[0].textContent === value1 && existingTiles.children[1].textContent === value2
    // })


    // Check if the tile already exists in "Your Tiles"
    const value1 = tile.children[0].textContent;
    const value2 = tile.children[1].textContent;
    const duplicate = Array.from(yourTiles.children).some(existingTile => 
        existingTile.children[0].textContent === value1 && existingTile.children[1].textContent === value2
    );


    if(duplicate){
        const errorMessage = document.createElement('div')
        errorMessage.textContent = 'You already have this tile'
        errorMessage.style.color = 'red'

     // Making sure the error message is appearing in a visible location for user (avobe the 'Your Tiles' box)
        yourTiles.parentElement.insertBefore(errorMessage, yourTiles)
        // Removing the error message after 3 seconds
        setTimeout(() => errorMessage.remove(), 3000)
        return
    }
   
    // Making a deep copy of 'tile'.
    const tileCopy = tile.cloneNode(true)

    // Removing the class of copied tile 
    tileCopy.classList.remove('selected')
    yourTiles.appendChild(tileCopy)

    // Store the added file for undo functionally
      yourTilesHistory.push(tileCopy)

}



function undoLastMove (){

    const lastMove = moveHistory.pop()
    if(lastMove){
        const {tile, fromYourTiles, fromAllTiles} = lastMove
    

       // Remove the tile from 'Tile played' box
      document.getElementById('board').removeChild(document.getElementById('board').lastChild)
    
      // Re-add the tile back to 'Your Tiles' if it was originally there
      if(fromYourTiles){
        document.getElementById('yourTiles').appendChild(tile)
      }

      // Re-add the tile to 'All Tiles' if it was originally there
     if(fromAllTiles){
        const tilesLeft = document.getElementById('tilesLeft')
        const rowHeading = tilesLeft.getElementsByClassName('row-heading')
        const value1 = parseInt(tile.children[0].textContent)
        const value2 = parseInt(tile.children[1].textContent)
        let inserted = false

        
        // Remember "row-heading" div contains all the heading tile like (0,1,2...6) which is variablized in heading in this for of loop. and "heading.nextElementSibling" refers the next div 
        for(let heading of rowHeading){
            if(parseInt(heading.textContent) === value1){
                const rowContainer = heading.nextElementSibling
                const tilesInRow = rowContainer.querySelectorAll('.tile')




                // Find the correct position insert the tile
                 for (let i =0; i < tilesInRow.length; i++){
                    const tileValue1 = parseInt(tilesInRow[i].children[0].textContent)
                    const tileValue2 = parseInt(tilesInRow[i].children[1].textContent)
                
                    if(value2 < tileValue2){
                        rowContainer.insertBefore(tile, tilesInRow[i])
                        inserted = true
                        break
                    }
                
                }

                // This part of the code handles the situation where the tile being reinserted should be placed at the end of the row because it is greater than all the existing tiles in that row

                  // If the tile should be plaeced at the end of the row
                  if(!inserted){
                    rowContainer.appendChild(tile)
                  }
                  break
            }
        }


        // Add click event back to tile
        tile.addEventListener('click', function(event){
            event.preventDefault()

            if(clickTimeout){
                clearTimeout(clickTimeout)
                clickTimeout = null

             // Check if the tile is in the "All Tiles" box before copying
               if(document.getElementById('tilesLeft').contains(tile)){
                addToYourTiles(tile)
               }
            } else{
                clickTimeout = setTimeout(() => {
                    // Play the tile regardless its current box
                    playTile(tile)
                    clickTimeout = null
                }, 300) // 300ms delay to distinguish between single and double click
            }
        })

    }
  }
}


function undoYourTiles(){
    const lastTile = yourTilesHistory.pop()
    if(lastTile){
        lastTile.remove()
    }
}

function resetAll(){
    moveHistory = []
    yourTilesHistory = []
    createTilesLeftContainer()
    document.getElementById('yourTiles').innerHTML = ''
    document.getElementById('board').innerHTML = ''
}

function filterTiles(){
    const searchTerm = document.getElementById('searchInput').value.toLowerCase()
    const tilesLeft = document.getElementById('tilesLeft')
    const tiles = tilesLeft.querySelectorAll('.tile')


      tiles.forEach((tile) => {
        const value1 = parseInt(tile.children[0].textContent)
        const value2 = parseInt(tile.children[1].textContent)

        if(searchTerm === '' || value1 === parseInt(searchTerm) || value2 === parseInt(searchTerm)){
             tile.style.display = 'inline-block'
        } else{
            tile.style.display = 'none'
        }
      })
}


document.getElementById('undoButton').addEventListener('click', undoLastMove)
document.getElementById('resetButton').addEventListener('click', resetAll)
document.getElementById('searchInput').addEventListener('input', filterTiles)
document.getElementById('undoYourTilesButton').addEventListener('click', undoYourTiles)








// Your existing JavaScript code...

const infoWindow = document.getElementById('infoWindow');
const closeButton = document.getElementById('closeInfoWindow');

// Show the information window when the page loads
window.onload = () => {
    infoWindow.style.display = 'block'; 
};

// Close the window when the close button is clicked
closeButton.addEventListener('click', () => {
    infoWindow.style.display = 'none';
});











createTilesLeftContainer()