'use strict';


var myApp = {};

myApp.margins = {top: 30, bottom: 30, left: 40, right: 15};
myApp.margin2 = {top: 40, right: 20, bottom: 30, left: 40}
myApp.cw = 800;
myApp.ch = 400;


var games = [];
var teams = {};
var teamNames = [];
var teamGames = [];

var minDate = undefined;
var maxDate = undefined;

//SCATERPLOT//
var sc = {};
sc.svg = undefined;
sc.cht = undefined;
sc.baseX = 70;
sc.baseY = 150;
sc.varY = -(sc.baseY - 50);
sc.ratio = 5;
sc.variationX = 4*sc.ratio;
sc.variationY = 4*sc.ratio;
sc.radius = sc.ratio;
sc.scoreBoardSizeX = sc.baseX + 20*sc.variationX + 50;
sc.scoreBoardSizeY = sc.baseY + 20*sc.variationY + 50;

//TIMESERIES//
var lineChart = {};
lineChart.margins       = {top: 20, right: 300, bottom: 110, left: 40};
lineChart.margins2      = {top: 430, right: 20, bottom: 30, left: 40};
lineChart.cw            = 1000 - lineChart.margins.left - lineChart.margins.right;
lineChart.ch            = 500 - lineChart.margins.top - lineChart.margins.bottom;
lineChart.ch2           = 500 - lineChart.margins2.top - lineChart.margins2.bottom;
lineChart.xLabel        = "Dates";
lineChart.yLabel        = "Position";
lineChart.xScale        = undefined;
lineChart.xScale2       = undefined;
lineChart.yScale        = undefined;
lineChart.yScale2       = undefined;
lineChart.nScaleX       = undefined;
lineChart.nScaleY       = undefined;
lineChart.xAxis         = undefined;
lineChart.xAxis2        = undefined;
lineChart.yAxis         = undefined;
lineChart.zoom          = undefined;
lineChart.brush         = undefined;
lineChart.colorScale    = undefined;
lineChart.data          = [];
lineChart.legend        = [];
lineChart.count         = undefined;
lineChart.countTotal    = undefined;

//GRAFICO DE BARRAS//
var bars = {};
bars.margins = {left: 25, right: 15, bottom: 30, top:10};
bars.cw      = 400;
bars.ch      = 300;
bars.maxX    = 100;
bars.maxY    = 200;
bars.xScale  = undefined;
bars.yScale  = undefined;
bars.xAxis   = undefined;
bars.yAxis   = undefined;
bars.zoom    = undefined;
bars.brush   = undefined;
bars.xAxisGroup = undefined;
bars.yAxisGroup = undefined;
bars.rectList   = undefined;
bars.data = [];
bars.svg  = undefined;
bars.chrt = undefined;


myApp.appendSvg = function(div, extraWidth, extraHeight)
{
    var node = d3.select(div).append('svg')
        .attr('width', myApp.cw + myApp.margins.left + myApp.margins.right + extraWidth)
        .attr('height', myApp.ch + myApp.margins.top + myApp.margins.bottom + extraHeight);
    
    return node;
}

myApp.appendChartGroup = function(svg)
{
    var chart = svg.append('g')
        .attr('class', 'chart-area')
        .attr('width', myApp.cw)
        .attr('height', myApp.ch)
        .attr('transform', 'translate('+ myApp.margins.left +','+ myApp.margins.top +')');
       
    return chart;
}

myApp.readData = function()
{
    d3.csv("PL2016.csv", function(error, data) {
        if (error) throw error;

        var teste = {};
        data.forEach(function(d){
            var game = {'date': d.Date, 'homeTeam': d.HomeTeam, 'awayTeam' : d.AwayTeam, 'homeGoals': d.FTHG, 'awayGoals': d.FTAG, 
                        'result': d.FTR, 'referee': d.Referee, 'homeShots': d.HS, 'awayShots': d.AS, 'homeShotsOnTarget': d.HST,
                        'awayShotsOnTarget': d.AST, 'homeFouls': d.HF, 'awayFouls': d.AF, 'homeCorner': d.HC, 'awayCorner': d.AC,
                        'homeYellow': d.HY, 'awayYellow': d.AY, 'homeRed': d.HR, 'awayRed': d.AR, 'homeBet': d.B365H,
                        'draftBet': d.B365D, 'awayBet': d.B365A};
            games.push(game);
        });
        myApp.populateTeamsData();
        myApp.populateCombo();        
        myApp.createScoreBoard();
        myApp.printTable();
        myApp.createTimeSeries();
        myApp.createBarsGraph();
    });
}

myApp.createScoreBoard = function()
{
    d3.select("svg").remove();
    var svg = myApp.appendSvg("#mainDiv", 200, 750);
    var cht = myApp.appendChartGroup(svg); 
    
    sc.svg = svg;
    sc.cht = cht;   
    
    //by victories
    myApp.appendLabels(0, 0, 'Victories');
    myApp.appendGrid(0, 0);
    myApp.appendCircles(0, 0, 'victories');
    
    //by bets
    myApp.appendLabels(sc.scoreBoardSizeX, 0, 'Bets');
    myApp.appendGrid(sc.scoreBoardSizeX, 0);
    myApp.appendCircles(sc.scoreBoardSizeX, 0, 'bets');
    
    //diff
    myApp.appendLabels(sc.scoreBoardSizeX/2, sc.scoreBoardSizeY, 'Diff');
    myApp.appendGrid(sc.scoreBoardSizeX/2, sc.scoreBoardSizeY);
    myApp.appendCircles(sc.scoreBoardSizeX/2, sc.scoreBoardSizeY, 'diff');
}

myApp.appendLabels = function(offSetX, offSetY, label)
{
    for(var i = 0; i < teamNames.length; i++) {
        sc.cht.append("text") 
            .attr("x", sc.baseX - 100 + offSetX)
            .attr("y", sc.baseY + sc.variationY*i + sc.radius/2 + offSetY)
            .style("fill", "black")
            .style("font-weight", "bold")
            .text(teamNames[i]);   
        
        sc.cht.append("text")
            .attr("transform", "translate(0,180)rotate(-90)")
            .attr("y", sc.baseX + sc.variationX * i - sc.radius*1.5 + offSetX)
            .attr("x", sc.baseY + sc.varY - offSetY)
            .attr("dy", "1em")
            .style("fill", "black")
            .style("font-weight", "bold")
            .text(teamNames[i]);
    }
        sc.cht.append("text") 
            .attr("x", sc.baseX + 150 + offSetX)
            .attr("y", sc.baseY - sc.variationY*6 + sc.radius/2 + offSetY)
            .style("fill", "black")
            .style("font-weight", "bold")
            .style("font-size", "25")
            .text(label); 
}

myApp.appendGrid = function(offSetX, offSetY)
{
   for(var i = 0; i <= teamNames.length; i++) {
       sc.cht.append("line")
            .attr("class", "vertical")
            .attr("x1", sc.baseX - sc.variationX/2 + sc.variationX*i + offSetX)
            .attr("y1", sc.baseY - 50 + offSetY)
            .attr("x2", sc.baseX - sc.variationX/2 + sc.variationX*i + offSetX)
            .attr("y2", sc.baseY + teamNames.length * sc.variationY + offSetY)
            .attr("stroke-width", 0.1)
            .attr("stroke", "black");
       
      sc.cht.append("line")
            .attr("class", "vertical")
            .attr("x1", sc.baseX - 100 + offSetX)
            .attr("y1", sc.baseY - sc.variationY/2 + sc.variationY*i + offSetY)
            .attr("x2", sc.baseX +teamNames.length * sc.variationX + offSetX)
            .attr("y2", sc.baseY - sc.variationY/2 + sc.variationY*i + offSetY)
            .attr("stroke-width", 0.1)
            .attr("stroke", "black");
   } 
}

myApp.appendCircles = function(offSetX, offSetY, type)
{
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    var circles = myApp.createCirclesData(offSetX, offSetY, type);
    
    sc.cht.selectAll('circle'+offSetX)
        .data(circles)
        .enter()
        .append('circle')
        .attr('id', function(d){ return d.id; })
        .attr('cx', function(d){ return d.cx; })
        .attr('cy', function(d){ return d.cy; })
        .attr('r' , function(d){ return d.r; })
        .style('fill', function(d){ return d.color; })
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);
    
    function handleMouseOver(d, i) {
        div.transition()
         .duration(200)
         .style("opacity", .9);
       div.html(d.date + "<br/>"+ d.homeGoals + " x " + d.awayGoals)
         .style("left", d.cx + 50 + 50 + offsetX + "px")
         .style("top", d.cy + 50 + 850 + "px");
    }
    
    function handleMouseOut(d, i) {
       div.transition()
         .duration(500)
         .style("opacity", 0);
    }
}

myApp.createCirclesData = function(offSetX, offSetY, type)
{
    var circles = [];
    for(var i = 0; i < teamNames.length; i++) {
        for(var j = 0; j < teamNames.length; j++) {
            var homeTeam = teamNames[i];
            var awayTeam = teamNames[j];
            var gameIndex = myApp.indexOfGame(homeTeam, awayTeam);
            
            
            
            if(gameIndex != -1) {
                
                var game = games[gameIndex];
                var from =  game.date.split("/");    
                var gameDate = new Date("20" + from[2], from[1]-1, from[0]); 
                
                if((minDate == undefined)||(maxDate == undefined)||((gameDate > minDate)&&(gameDate < maxDate))){
                    var x = sc.baseX + sc.variationX * j + offSetX;
                    var y = sc.baseY + sc.variationY * i + offSetY;
                    var color = 'grey';
                    
                    if(type == 'victories') {
                        if(game.result == 'H')
                            color = 'green';
                        else if(game.result == 'A')
                            color = 'red';
                    }
                    
                    if(type == 'bets') {
                        var bet = Math.min(game.homeBet, game.draftBet, game.awayBet);
                        if(bet == game.homeBet)
                            color = 'green';
                        if(bet == game.awayBet)
                            color = 'red';
                        if(bet == game.draftBet)
                            color = 'grey';
                    }
                    
                    if(type == 'diff') {
                        color = 'green';
                        
                        var bet = Math.min(game.homeBet, game.draftBet, game.awayBet);
                        if(bet == game.homeBet && (game.result != 'H') ||
                           bet == game.awayBet && (game.result != 'A') ||
                           bet == game.draftBet && (game.result != 'D'))
                            color = 'red';
                        if(bet == game.draftBet && game.result == 'D')
                            color = 'grey';
                    }
                    
                    var c = {'id': 'id','cx': x, 'cy': y, 'r': sc.radius, 'color': color, 'homeGoals': game.homeGoals,
                             'awayGoals': game.awayGoals, 'date': game.date};
                    circles.push(c);
                }
            }   
        }
    }
    return circles;
}

myApp.indexOfGame = function(homeTeam, awayTeam) 
{
    for(var i = 0; i < games.length; i++) {
        if(games[i].homeTeam == homeTeam && games[i].awayTeam == awayTeam)
            return i;
    }
    return -1;
}
    
myApp.calculateGamesPlayed = function(teamName) 
{
    var n = 0;
    for(var i = 0; i < games.length; i++) {
        if(games[i].homeTeam == teamName || games[i].awayTeam == teamName)
            n++;
    }
    return n;
}

myApp.populateTeamsData = function()
{
    for(var i = 0; i < games.length; i++) {
        var game = games[i];
        var homeTeamName = game.homeTeam;
        var awayTeamName = game.awayTeam;
        
        if(!teamNames.includes(homeTeamName))
            teamNames.push(homeTeamName);
        
        if(!teamNames.includes(awayTeamName))
            teamNames.push(awayTeamName);
        
        var homeResult;
        homeResult = game.result;
        if(homeResult == 'H') 
            homeResult = 'W';
        if (homeResult == 'A') 
            homeResult = 'L'
        
        if(teams[homeTeamName] == undefined) {
            teams[homeTeamName] = {'name': homeTeamName, 'results': homeResult,'scoredGoals': +game.homeGoals, 
                                   'concededGoals': game.awayGoals, 
                                   'shots': game.homeShots, 'fouls': game.homeFouls, 'yellow': game.homeYellow, 'red': game.homeRed};
        } else {
            teams[homeTeamName].results += homeResult;
            teams[homeTeamName].scoredGoals += +game.homeGoals;
            teams[homeTeamName].concededGoals += game.awayGoals;
            teams[homeTeamName].shots += game.homeShots;
            teams[homeTeamName].fouls += game.homeFouls;
            teams[homeTeamName].yellow += game.homeYellow;
            teams[homeTeamName].red += game.homeRed;
        }

        var awayResult;
        awayResult = game.result;
        if(awayResult == 'H') 
            awayResult = 'L';
        if (awayResult == 'A') 
            awayResult = 'W'
        
        if(teams[awayTeamName] == undefined) {
            teams[awayTeamName] = {'name': awayTeamName, 'results': awayResult,'scoredGoals': +game.awayGoals, 
                                   'concededGoals': game.homeGoals, 
                                   'shots': game.awayShots, 'fouls': game.awayFouls, 'yellow': game.awayYellow, 'red': game.awayRed};
        } else {
            teams[awayTeamName].results += awayResult;
            teams[awayTeamName].scoredGoals += +game.awayGoals;
            teams[awayTeamName].concededGoals += game.homeGoals;
            teams[awayTeamName].shots += game.awayShots;
            teams[awayTeamName].fouls += game.awayFouls;
            teams[awayTeamName].yellow += game.awayYellow;
            teams[awayTeamName].red += game.awayRed;
        }
        
        ///////////////////////////////////////////////////
        
        if(teamGames[homeTeamName] == undefined) {
            teamGames[homeTeamName] = [];
            var g = {'date': game.date, results: homeResult};
            teamGames[homeTeamName].push(g);
            
        } else {
            var r = '';
            var lastGameIndex = teamGames[homeTeamName].length - 1;
            r = teamGames[homeTeamName][lastGameIndex].results + homeResult;
            var g = {'date': game.date, results: r};
            teamGames[homeTeamName].push(g);
        }
        
        if(teamGames[awayTeamName] == undefined) {
            teamGames[awayTeamName] = [];
            var g = {'date': game.date, results: awayResult};
            teamGames[awayTeamName].push(g);
        } else {
            var r = '';
            var lastGameIndex = teamGames[awayTeamName].length - 1;
            r = teamGames[awayTeamName][lastGameIndex].results + awayResult;
            var g = {'date': game.date, results: r};
            teamGames[awayTeamName].push(g);
        }
    }
    
    teamNames.sort(function(x, y){
            return d3.ascending(x, y);
        })
    console.log(teamNames.length);
    console.log(Object.keys(teams).length);
    
    for(var i = 0; i < teamNames.length; i++) {
        var name = teamNames[i];
        console.log(teams[name].name + ' - ' + myApp.getTotalScore(teams[name].results));
    }
    
    console.log('\n\nMan United:');
    for(var i = 0; i < teamGames['Man United'].length; i++) {
        console.log(teamGames['Man United'][i].date + ' - ' + myApp.getTotalScore(teamGames['Man United'][i].results));
    }
}

myApp.select = function()
{
    myApp.printTable();
    myApp.updateBars();
}

myApp.sortByTotalPoints = function(date)
{
    teamNames.sort(function(a, b) {
        return myApp.getTotalScoreByDate(b, date)
            - 
            myApp.getTotalScoreByDate(a, date);
    });    
}

myApp.getTotalScoreByDate = function(name, date)
{
    var index = myApp.indexOfDate(name,date);
    
    if(index == -1)
        return 0;
    
    return parseFloat(myApp.getTotalScore(teamGames[name][index].results));
}


myApp.printTable = function()
{
    
    var myTable= '<table class="table"><tr><th>Team</th>';
    myTable+= "<th>Points</th>";
    var selectedTeam = document.getElementById("selectTeam").value;            
        
    var inputDate;
    if(maxDate == undefined)
        inputDate = new Date();
    else
        inputDate = maxDate; 
    
    myApp.sortByTotalPoints(inputDate);
    var formatDate = ("0" + inputDate.getDate()).slice(-2) + "/" + ("0" + (inputDate.getMonth() + 1)).slice(-2) + "/" + ("0" + inputDate.getFullYear()).slice(-2);
    
    for(var i = 0; i < teamNames.length; i++) {
        var name = teamNames[i];
        console.log(teams[name].name + ' - ' + myApp.getTotalScore(teams[name].results));
        
        if(name == selectedTeam)
            myTable+="<tr style='background-color: #7bb563 !important;'>";
        else
            myTable+="<tr>";
        
        myTable+="<td>" + name + "</td>";
        
        var index = myApp.indexOfDate(name,inputDate);
        if(index == -1)
            myTable+="<td> - </td>";
        else
            myTable+="<td>" + myApp.getTotalScore(teamGames[name][index].results) + "</td>";
    }
    
    myTable+="</table>";
    
    document.getElementById('tableDiv').innerHTML = myTable;

}

myApp.indexOfDate = function(name, date)
{
    for(var i = 0; i < teamGames[name].length; i++) {
        var from = teamGames[name][i].date.split("/");    
        var teamDate = new Date("20" + from[2], from[1]-1, from[0]); 
        if (teamDate > date)
            return i - 1;        
    }
    return teamGames[name].length - 1;
}

myApp.populateCombo = function()
{
    
    var select = document.getElementById("selectTeam");
    teamNames.sort();
        
    for(var i = 0; i < teamNames.length; i++) {
        var opt = teamNames[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }

}

myApp.getTotalScore = function(results)
{
    var score = 0;
    for(var i = 0; i < results.length; i++) {
        var result = results[i];
        if(result == 'W')
            score += 3;
        if(result == 'D')
            score += 1;
    }
    return score;
}

//$ELIAS - TIMESERIES$

myApp.appendTimeSeries = function(chartObject, svg)
{
    var line = d3.line()
                 .x(function(d) { return chartObject.xScale(d.date); })
                 .y(function(d) { return chartObject.yScale(d.close); });
    
    svg.append("path")
      .data(chartObject.data)
      .attr("class", "line")
      .attr("d", line)
      .style("fill", "none")
      .style("stroke", "steelblue")
      .style("stroke-width", "2px");    
}

myApp.createTimeSeriesData = function(filename, chartObject, svg, cht)
{        
    
    var parseDate = d3.timeParse("%d-%b-%y");
    
    var x = d3.scaleTime().range([0, chartObject.cw]),
        x2 = d3.scaleTime().range([0, chartObject.cw]),
        y = d3.scaleLinear().range([chartObject.ch, 0]),
        y2 = d3.scaleLinear().range([chartObject.ch2, 0]);
    
    chartObject.colorScale = d3.scaleOrdinal(d3.schemeCategory20);
    
    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y);
    
    var brush = d3.brushX()
    .extent([[0, 0], [chartObject.cw, chartObject.ch2]])
    .on("brush end", brushed);
    
    var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [chartObject.cw, chartObject.ch]])
    .extent([[0, 0], [chartObject.cw, chartObject.ch]])
    .on("zoom", zoomed);
        
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", chartObject.cw)
        .attr("height", chartObject.ch);            
    
    var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + chartObject.margins.left + "," + chartObject.margins.top + ")");
    
    var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + chartObject.margins2.left + "," + chartObject.margins2.top + ")");       
           
    var totalDates  = [];        
    var totalValues = []; 
    
    for(var teamName in teamNames){
        var name = teamNames[teamName];
        for(var i = 0; i < teamGames[name].length; i++) {            
            var from = teamGames[name][i].date.split("/");    
            var teamDate = new Date("20" + from[2], from[1]-1, from[0]); 
            totalDates.push(teamDate); 
            var index = myApp.indexOfDate(name,teamGames[name][i].date);            
            totalValues.push(myApp.getTotalScore(teamGames[name][i].results));      
        }      
    }
    
    x.domain(d3.extent(totalDates, function(d) { return d; }));    
    y.domain([teamNames.length, 1]);
    x2.domain(x.domain());
    y2.domain(y.domain());
    
    var dates  = [];        
    var values = [];     
    var count = -1;
    for(var teamName in chartObject.legend){
        count++;
        var name = chartObject.legend[teamName];
        var data = [];
        for(var i = 0; i < teamGames[name].length; i++) {
            dates.push(teamGames[name][i].date);
            var from = teamGames[name][i].date.split("/");    
            var teamDate = new Date("20" + from[2], from[1]-1, from[0]);   
            var index = myApp.indexOfDate(name,teamGames[name][i].date);
            values.push(myApp.getTotalScore(teamGames[name][i].results)); 
                        
            myApp.sortByTotalPoints(teamDate);
            console.log(name + ": " + (teamNames.indexOf(name) + 1));
            
            var d = {date: teamDate, value: (teamNames.indexOf(name) + 1)};
            data.push(d);
        }        
        
        var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { console.log(name + "("+chartObject.legend[count] + "): " + d.value);return y(d.value); });
        
        var line2 = d3.line()
        .x(function(d) { return x2(d.date); })
        .y(function(d) { return y2(d.value); });                        
        
        focus.append("path")
             .datum(data)
             .attr("class", "line"+count)
             .attr("d", line)
             .style("fill", "none")
             .style("stroke", chartObject.colorScale(name))
             .style("stroke-width", "2px");                            
        
        context.append("path")
               .datum(data)
               .attr("class", "line"+count)
               .attr("d", line2)
               .style("fill", "none")
               .style("stroke", chartObject.colorScale(name))
               .style("stroke-width", "2px");
    }  
    
        
    var rect1 = focus.append('rect')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width' , chartObject.cw)
                        .attr('height', (chartObject.ch+20))
                        .attr("fill", 'white')
                        .attr('transform', 'translate('+ (chartObject.cw) +','+ (- 1) +')');
    
    var rect2 = focus.append('rect')
                        .attr('x', -chartObject.margins.left)
                        .attr('y', 0)
                        .attr('width' , chartObject.margins.left)
                        .attr('height', (chartObject.ch+20))
                        .attr("fill", 'white')
                        .attr('transform', 'translate('+ 0 +','+ (chartObject.margins.top - 1) +')');
   
    focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + chartObject.ch + ")")
            .call(xAxis);        
    
    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);                
    
    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + chartObject.ch2 + ")")
        .call(xAxis2);
    
    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());
    
    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", chartObject.cw)
        .attr("height", chartObject.ch)
        .attr("transform", "translate(" + chartObject.margins.left + "," + chartObject.margins.top + ")")
        .call(zoom);    
    
    function brushed() {         
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
        var s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));
                
        minDate = s.map(x2.invert, x2)[0];
        maxDate = s.map(x2.invert, x2)[1];
        
        var i;        
        for(i = 0; i < teamNames.length; i++){            
            focus.select(".line"+i).attr("d", d3.line()
                                                .x(function(d) { return x(d.date); })
                                                .y(function(d) { return y(d.value); }));
        }
        focus.select(".axis--x").call(xAxis);
        svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                                 .scale(chartObject.cw / (s[1] - s[0]))
                                 .translate(-s[0], 0));
        
        myApp.createScoreBoard();
        myApp.printTable();
    }
    
    function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        x.domain(t.rescaleX(x2).domain());
        
        minDate = t.rescaleX(x2).domain()[0];
        maxDate = t.rescaleX(x2).domain()[1];
        myApp.updateBars();
        
        var i;        
        for(i = 0; i < teamNames.length; i++){            
            focus.select(".line"+i).attr("d", d3.line()
                                                .x(function(d) { return x(d.date); })
                                                .y(function(d) { return y(d.value); }));
        }
        focus.select(".axis--x").call(xAxis);
        context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
        
        myApp.createScoreBoard();
        myApp.printTable();
    }        
}

myApp.appendSvgLineChart = function(div, chartObject)
{
    var chart = chartObject;
    var node = d3.select(div).append('svg')
        .attr('class', 'svg')
        .attr('width', chartObject.cw + chartObject.margins.left + chartObject.margins.right)
        .attr('height', chartObject.ch + chartObject.margins.top + chartObject.margins.bottom);
    
    return node;
}

myApp.appendChartGroupLineChart = function(svg, chartObject)
{    
    var chart = svg.append('g')
        .attr('class', 'chart-area')
        .attr('width', chartObject.cw)
        .attr('height', chartObject.ch)
        .attr('transform', 'translate('+ chartObject.margins.left +','+ chartObject.margins.top +')' );
    
    return chart;
}

myApp.appendLegend = function(chartObject, div)
{            
    
    var legend = div.append("g")
                  .attr("class", "legend")
                  .attr("font-family", "sans-serif")
                  .attr("font-size", 10)
                  .attr("text-anchor", "end")                  
                  .selectAll("g")
                  .data(chartObject.legend)
                  .enter().append("g")
                  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    
    legend.append("rect")
      .attr("x", chartObject.cw + 170)      
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", chartObject.colorScale);

    legend.append("text")
      .attr("x", chartObject.cw + 165)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
    
    return legend;
}

myApp.generateLabels = function(chartObject, div){
    div.append("text")  
       .attr("transform",
             "translate(" + chartObject.margins.left + " ," + 
                           (chartObject.margins.top - 5) + ")")
       .style("text-anchor", "middle")
       .text(chartObject.yLabel);
    
    div.append("text")  
       .attr("transform",
             "translate(" + (chartObject.cw + chartObject.margins.left + 30) + "," + 
                           (chartObject.ch+chartObject.margins.top + 10) + ")")
       .style("text-anchor", "middle")
       .text(chartObject.xLabel);
}


myApp.createTimeSeries = function() 
{    
    //  GRAFICO DE LINHA    
    var div = d3.select("#chartDiv");
    var svg = myApp.appendSvgLineChart("#chartDiv", lineChart);
    var cht = myApp.appendChartGroupLineChart(svg, lineChart); 
    
    teamNames.sort();        
    for(var i = 0; i < teamNames.length; i++) {        
        lineChart.legend.push(teamNames[i]);
    }  
    
    myApp.createTimeSeriesData("PL2016.csv", lineChart, svg, cht);        
    myApp.appendLegend(lineChart,svg);      
    myApp.generateLabels(lineChart, svg);                    
}

myApp.generateData = function(n) {

    
    var dataArray = [];
    var i;
    for (i = 1; i < n; i++) {
        var value = (Math.random()*650);
        dataArray.push(value);
    }
    return dataArray;
    
}

//$ELIAS - TIMESERIES$

//$MARCELO - GRAFICO DE BARRAS$

myApp.appendSvgBarsGraph = function(div)
{
    var node = d3.select(div).append('svg')
        .attr('width',  bars.cw  + bars.margins.left + bars.margins.right)
        .attr('height', bars.ch  + bars.margins.top  + bars.margins.bottom);

    return node;
}

myApp.appendChartGroupBarsGraph = function(svg)
{
    var chart = svg.append('g')
        .attr('class', 'chart-area')
        .attr('width', bars.cw)
        .attr('height', bars.ch)
        .attr('transform', 'translate('+ bars.margins.left +','+ bars.margins.top +')' );

    return chart;
}

myApp.createAxesBarsGraph = function(svg)
{        
    bars.xScale = d3.scaleLinear().domain([0,bars.maxX]).range([0,bars.cw]);
    bars.yScale = d3.scaleLinear().domain([bars.maxY,0]).range([0,bars.ch]);        

    bars.xAxisGroup = svg.append('g')
        .attr('class', 'xAxis')
        .attr('transform', 'translate('+ bars.margins.left +','+ (bars.ch+bars.margins.top) +')');

    bars.yAxisGroup = svg.append('g')
        .attr('class', 'yAxis')
        .attr('transform', 'translate('+ bars.margins.left +','+ bars.margins.top +')');

    bars.xAxis = d3.axisBottom(bars.xScale);
    bars.yAxis = d3.axisLeft(bars.yScale);

    bars.xAxisGroup.call(bars.xAxis);
    bars.yAxisGroup.call(bars.yAxis);

    d3.select('.xAxis')
        .style('display', 'none');
}

myApp.updateXAxis = function(div)
{
    var p = [];
    var textWin = {"text": "Geral", "x": bars.rectList[0].x};
    var textLost = {"text": "Geral", "x": bars.rectList[2].x};
    var textDraw = {"text": "Geral", "x": bars.rectList[4].x};
    var textTeamWin = {"text": "Time", "x": bars.rectList[1].x};
    var textTeamLost = {"text": "Time", "x": bars.rectList[3].x};
    var textTeamDraw = {"text": "Time", "x": bars.rectList[5].x};

    p.push(textWin);
    p.push(textTeamWin);
    p.push(textLost);
    p.push(textTeamLost);
    p.push(textDraw);        
    p.push(textTeamDraw);

    var genW = div
        .append('text')
        .text(function(d){ return textWin.text})
        .attr('class', 'label')
        .attr('x', function(d){ return textWin.x + bars.margins.left; })
        .attr('y', function(d){ return bars.ch + bars.margins.top + 20; });
    
    var teamW = div
        .append('text')
        .text(function(d){ return textTeamWin.text})
        .attr('class', 'label')
        .attr('x', function(d){ return textTeamWin.x + bars.margins.left; })
        .attr('y', function(d){ return bars.ch + bars.margins.top + 20; });
    
    var genL = div
        .append('text')
        .text(function(d){ return textLost.text})
        .attr('class', 'label')
        .attr('x', function(d){ return textLost.x + bars.margins.left; })
        .attr('y', function(d){ return bars.ch + bars.margins.top + 20; });
    
    var teamL = div
        .append('text')
        .text(function(d){ return textTeamLost.text})
        .attr('class', 'label')
        .attr('x', function(d){ return textTeamLost.x + bars.margins.left; })
        .attr('y', function(d){ return bars.ch + bars.margins.top + 20; });
    
    var genD = div
        .append('text')
        .text(function(d){ return textDraw.text})
        .attr('class', 'label')
        .attr('x', function(d){ return textDraw.x + bars.margins.left; })
        .attr('y', function(d){ return bars.ch + bars.margins.top + 20; });
            
    var teamD = div
        .append('text')
        .text(function(d){ return textTeamDraw.text})
        .attr('class', 'label')
        .attr('x', function(d){ return textTeamDraw.x + bars.margins.left; })
        .attr('y', function(d){ return bars.ch + bars.margins.top + 20; });
    
    
    var rect = div
        .append("rect")
        .attr("x", function(){return 0 + bars.margins.left;})
        .attr("y", function(){return bars.ch + bars.margins.top;})
        .attr("width", bars.cw)
        .attr("height", function(){return 1;});
}

myApp.createRectsDataBarsGraph = function()
{
    var rects        = [];
    var generalWins  = 0;
    var generalLosts = 0;
    var generalDraws = 0;
    var teamWins     = 0;
    var teamLosts    = 0;
    var teamDraws    = 0;    
    var totalGames   = 0;
    var bestTeamWins = 0;
    var selectedTeam = document.getElementById("selectTeam").value;
    var totalSelectedTeam = 0;
    
    for(var i = 0; i < teamNames.length; i++) {
        for(var j = 0; j < teamNames.length; j++) {
            var homeTeam = teamNames[i];
            var awayTeam = teamNames[j];
            var gameIndex = myApp.indexOfGame(homeTeam, awayTeam);
            if(gameIndex != -1) {
                var game = games[gameIndex];
                /*CONVERSAO DE DATAS*/
                var date = game.date;
                date = date.replace('/','-');
                date = date.replace('/','-');
                date = moment(date,"DD-MM-YY").format("MM-DD-YY");
                var dataJogo = new Date(date);
                /*FIM CONVERSAO*/
                if(dataJogo < maxDate && dataJogo > minDate){
                    if(game.result == 'H'){
                        generalWins++;
                        if(homeTeam == selectedTeam){
                            teamWins++;
                            totalSelectedTeam++;
                        }      
                    }
                    else{ 
                        if(game.result == 'A'){
                            generalLosts++;
                            if(homeTeam == selectedTeam){
                                teamLosts++; 
                                totalSelectedTeam++;
                            }
                        }
                        else{
                            generalDraws++;
                            if(homeTeam == selectedTeam){
                                teamDraws++;
                                totalSelectedTeam++;
                            }                        
                        }
                    }
                    totalGames++;
                }
            }   
        }
        if(bestTeamWins < teamWins)
            bestTeamWins = teamWins;        
    }
    
    /*if(generalWins >= generalLosts && generalWins >= generalDraws)
        bars.maxY = generalWins;
    else if(generalLosts >= generalDraws)
        bars.maxY = generalLosts;
    else
        bars.maxY = generalDraws;*/
    
    bars.maxY = 100;
            
    console.log("General Wins: " + generalWins);
    
    var rectWin = {'x': 10, 'y': 0, 'width': 25, 'height': (generalWins/totalGames)*100, 'color': 'green'};
    rects.push(rectWin);
    var rectTeamWin = {'x': 70, 'y': 0, 'width': 25, 'height': (teamWins/totalSelectedTeam)*100, 'color': 'green'};
    rects.push(rectTeamWin);
    var rectLost = {'x': 130, 'y': 0, 'width': 25, 'height': (generalLosts/totalGames)*100, 'color': 'red'};
    rects.push(rectLost);
    var rectTeamLost = {'x': 190, 'y': 0, 'width': 25, 'height': (teamLosts/totalSelectedTeam)*100, 'color': 'red'};
    rects.push(rectTeamLost);
    var rectDraw = {'x': 250, 'y': 0, 'width': 25, 'height': (generalDraws/totalGames)*100, 'color': 'gray'};
    rects.push(rectDraw);        
    var rectTeamDraw = {'x': 310, 'y': 0, 'width': 25, 'height': (teamDraws/totalSelectedTeam)*100, 'color': 'gray'};
    rects.push(rectTeamDraw);
    
    bars.rectList = rects;
    return rects;
}

myApp.appendRects = function(div)
{
    var tran = d3.transition()
                .duration(750);

    var rect = div.selectAll('rect')
            .data(bars.rectList)
            .enter()
            .append('rect')
            .transition(tran)
            .attr('x', function(d){ return d.x; })
            .attr('y', function(d){ return bars.yScale(d.y) - (bars.ch - bars.yScale(d.height)); })
            .attr('width', function(d){ return d.width; })
            .attr('height', function(d){ return bars.ch - bars.yScale(d.height); })
            .attr('fill',function(d){ return d.color; })
            .attr('class','barra');                

    return rect;
}

myApp.updateBars = function(){
    bars.svg.selectAll("rect.barra").remove();
    myApp.createRectsDataBarsGraph();
    myApp.appendRects(bars.chrt);    
}

myApp.createBarsGraph = function()
{
    myApp.createRectsDataBarsGraph();
    bars.svg = myApp.appendSvgBarsGraph("#barsDiv");
    bars.chrt = myApp.appendChartGroupBarsGraph(bars.svg);
    myApp.createAxesBarsGraph(bars.svg);
    myApp.updateXAxis(bars.svg);
    myApp.appendRects(bars.chrt);
}

//$MARCELO - GRAFICO DE BARRAS$

myApp.run = function() 
{        
    myApp.readData();
}

window.onload = myApp.run;