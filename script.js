var w = 30;
var h = 15;

var xOffset = 0;
var yOffset = 0;

var BOMB_ODDS = 0.12;

var disableAllClicks = false;

var seed = Math.random();

var knownCells = [];
var flaggedCells = [];

function getValue(x, y){
    
    if(isBomb(x,y)){
        return -1;
    }
    
    neighbors = 0;
    
    if( isBomb(x-1,y-1) ){ neighbors++; }
    if( isBomb(x,y-1)   ){ neighbors++; }
    if( isBomb(x+1,y-1) ){ neighbors++; }
    if( isBomb(x-1,y)   ){ neighbors++; }
    if( isBomb(x+1,y)   ){ neighbors++; }
    if( isBomb(x-1,y+1) ){ neighbors++; }
    if( isBomb(x,y+1)   ){ neighbors++; }
    if( isBomb(x+1,y+1) ){ neighbors++; }
    
    return neighbors;
}

function isBomb(x, y){
    Math.seedrandom(seed + "-" + x + "-" + y);
    rnd = Math.random();
    
    if(rnd < BOMB_ODDS){
        return true;
    }
}

function isFlagged(x, y){
    return $("td[pos='"+(x-xOffset)+"-"+(y-yOffset)+"']").hasClass("flag");
}

function middleClick(x, y){
    if(isFlagged(x, y)){ return false; }
    
    $cell = $("td[pos='"+(x-xOffset)+"-"+(y-yOffset)+"']");
    
    if($cell.hasClass("unknown")){ return false; }
    
    nbNeighborFlags = 0;
    
    if( isFlagged(x-1,y-1) ){ nbNeighborFlags++; }
    if( isFlagged(x,y-1)   ){ nbNeighborFlags++; }
    if( isFlagged(x+1,y-1) ){ nbNeighborFlags++; }
    if( isFlagged(x-1,y)   ){ nbNeighborFlags++; }
    if( isFlagged(x+1,y)   ){ nbNeighborFlags++; }
    if( isFlagged(x-1,y+1) ){ nbNeighborFlags++; }
    if( isFlagged(x,y+1)   ){ nbNeighborFlags++; }
    if( isFlagged(x+1,y+1) ){ nbNeighborFlags++; }
    
    if($cell.hasClass("neighbor"+nbNeighborFlags)){
        reveal(x-1,y-1);
        reveal(x,y-1);  
        reveal(x+1,y-1);
        reveal(x-1,y);  
        reveal(x+1,y);  
        reveal(x-1,y+1);
        reveal(x,y+1);  
        reveal(x+1,y+1);
    }
}

function reveal(x, y, recurse=true){
    if(isFlagged(x, y)){ return false; }
    if( (x-xOffset)<0 || (y-yOffset) < 0 || (x-xOffset)>=w || (y-yOffset) >=h){ return false; }
    
    $cell = $("td[pos='"+(x-xOffset)+"-"+(y-yOffset)+"']");
    
    if(!$cell.hasClass("unknown")){ return false; }
    
    
    $cell.removeClass("unknown");
    
    cellNumber = getValue(x, y);
    
    knownCells.push(x+"-"+y);
    
    switch(cellNumber){
        case -1:
            $cell.addClass("bomb");
            if(recurse){
                alert("You lost");
                location.reload();
                disableAllClicks = true;
            }
            
            break;
        case 0:
            $cell.addClass("neighbor0");
            
            if(recurse){
                reveal(x-1, y-1);
                reveal(x-1, y);
                reveal(x-1, y+1);
                reveal(x, y-1);
                reveal(x, y+1);
                reveal(x+1, y-1);
                reveal(x+1, y);
                reveal(x+1, y+1);
            }
            break;
        default:
            $cell.addClass("neighbor"+cellNumber);
            $cell.html(cellNumber);

    }
    
    
}

function resetBoard(){
    for(y=0; y<h; y++){
        
        for(x=0; x<w; x++){
            actualX = x+xOffset;
            actualY = y+yOffset;
            
            
            
            $cell = $("td[pos='"+x+"-"+y+"']");
            $cell.html("");
            $cell.removeClass();
            
            $cell.addClass("unknown");
            
            if(flaggedCells.includes(actualX+"-"+actualY)){ $cell.addClass("flag"); }
            if(knownCells.includes(actualX+"-"+actualY)){ reveal(actualX, actualY, false); }
            
        }
        
    }

}


$(function(){
    
    var content = "<table align='center' cellspacing='0'>"
    for(y=0; y<h; y++){
        content += "<tr>";
        
        for(x=0; x<w; x++){
            content += '<td class="unknown" pos="'+x+'-'+y+'"></td>';
        }
        
        content += "</tr>";
    }
    content += "</table>";

    $('#table').html(content);
    
    
    $('td').mousedown(function(event) {
        if(disableAllClicks) { return false; }

        var position = $(this).attr('pos');
        var coords = position.split("-");
        var xCoord = parseInt(coords[0]) + xOffset;
        var yCoord = parseInt(coords[1]) + yOffset;   
        
        switch (event.which) {
            case 1: // Left click
                if($(this).hasClass("unknown"))
                {
                    $(this).removeClass("hovered");
                    
                    reveal(xCoord, yCoord);
                    
                }
                
                break;
            case 3: // Right click
                
                var indexOf = flaggedCells.indexOf(xCoord+"-"+yCoord)
                
                if( indexOf == -1 && $(this).hasClass("unknown") ){
                    $(this).addClass("flag");
                    $(this).removeClass("unknown");
                    
                    flaggedCells.push(xCoord+"-"+yCoord);
                }
                else if( $(this).hasClass("flag") ){
                    $(this).addClass("unknown");
                    $(this).removeClass("flag");
                    
                    flaggedCells.splice(indexOf, 1);
                    
                }
                
                
                break;
            case 2: // Middle button
                middleClick(xCoord, yCoord);
                
                return false;
                break;
                
        }
    });
    
    $(document).on("contextmenu",function(e){
        return false;
    });
    
    
    $('td').mouseenter(function(){
        if(disableAllClicks) { return false; }
    
        if( $(this).hasClass("unknown") ){
            $(this).addClass('hovered');  
        }
    });
    
    
    $('td').mouseleave(function(){
        $(this).removeClass('hovered');
    });
    
    $(document).keydown(function(e) {
    
    
    switch(e.which) {
        case 37: // left
            xOffset++;
        break;

        case 38: // up
            yOffset++;
        break;

        case 39: // right
            xOffset--;
        break;

        case 40: // down
            yOffset--;
        break;

        default: return;
    }
    resetBoard();
    
    e.preventDefault(); // prevent the default action (scroll / move caret)
});
    
    
});