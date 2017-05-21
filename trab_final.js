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

//SCATERPLOT//
var sc = {};
sc.svg = undefined;
sc.cht = undefined;
sc.baseX = 100;
sc.baseY = 100;
sc.variationX = 20;
sc.variationY = 20;
sc.radius = 5;

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
    d3.csv("campeonatoIngles.csv", function(error, data) {
        if (error) throw error;

        var teste = {};
        data.forEach(function(d){
            var game = {'date': d.Date, 'homeTeam': d.HomeTeam, 'awayTeam' : d.AwayTeam, 'homeGoals': d.FTHG, 'awayGoals': d.FTAG, 
                        'result': d.FTR, 'referee': d.Referee, 'homeShots': d.HS, 'awayShots': d.AS, 'homeShotsOnTarget': d.HST,
                        'awayShotsOnTarget': d.AST, 'homeFouls': d.HF, 'awayFouls': d.AF, 'homeCorner': d.HC, 'awayCorner': d.AC,
                        'homeYellow': d.HY, 'awayYellow': d.AY, 'homeRed': d.HR, 'awayRed': d.AR};
            games.push(game);
        });
        myApp.populateTeamsData();
        myApp.createScoreBoard();
    });
}

myApp.createScoreBoard = function()
{
    var svg = myApp.appendSvg("#mainDiv", 100, 100);
    var cht = myApp.appendChartGroup(svg); 
    
    sc.svg = svg;
    sc.cht = cht;   
    
    myApp.appendLabels();
    myApp.appendGrid();
    myApp.appendCircles();
}

myApp.appendLabels = function()
{
    for(var i = 0; i < teamNames.length; i++) {
        sc.cht.append("text") 
            .attr("x", sc.baseX - 100)
            .attr("y", sc.baseY + sc.variationY*i + sc.radius/2)
            .style("fill", "black")
            .style("font-weight", "bold")
            .text(teamNames[i]);   
        
        sc.cht.append("text")
            .attr("transform", "translate(0,180)rotate(-90)")
            .attr("y", sc.baseX + sc.variationX * i - sc.radius*1.5)
            .attr("x", sc.baseY)
            .attr("dy", "1em")
            .style("fill", "black")
            .style("font-weight", "bold")
            .text(teamNames[i]);
    }
}

myApp.appendGrid = function()
{
   for(var i = 0; i <= teamNames.length; i++) {
       sc.cht.append("line")
            .attr("x1", sc.baseX - sc.variationX/2 + sc.variationX*i)
            .attr("y1", sc.baseY - 50)
            .attr("x2", sc.baseX - sc.variationX/2 + sc.variationX*i)
            .attr("y2", sc.baseY + teamNames.length * sc.variationY)
            .attr("stroke-width", 0.1)
            .attr("stroke", "black");
       
      sc.cht.append("line")
            .attr("x1", sc.baseX - 100)
            .attr("y1", sc.baseY - sc.variationY/2 + sc.variationY*i)
            .attr("x2", sc.baseX +teamNames.length * sc.variationX)
            .attr("y2", sc.baseY - sc.variationY/2 + sc.variationY*i)
            .attr("stroke-width", 0.1)
            .attr("stroke", "black");
   } 
}

myApp.appendCircles = function()
{
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    var circles = myApp.createCirclesData();
    
    sc.cht.selectAll('circle')
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
         .style("left", d.cx + 50 + "px")
         .style("top", d.cy + 50 + "px");
    }
    
    function handleMouseOut(d, i) {
       div.transition()
         .duration(500)
         .style("opacity", 0);
    }
}

myApp.createCirclesData = function()
{
    var circles = [];
    for(var i = 0; i < teamNames.length; i++) {
        for(var j = 0; j < teamNames.length; j++) {
            var homeTeam = teamNames[i];
            var awayTeam = teamNames[j];
            var gameIndex = myApp.indexOfGame(homeTeam, awayTeam);
            if(gameIndex != -1) {
                var game = games[gameIndex];
                var x = sc.baseX + sc.variationX * j;
                var y = sc.baseY + sc.variationY * i;
                var color = 'grey';
                if(game.result == 'H')
                    color = 'green';
                else if(game.result == 'A')
                    color = 'red';
                var c = {'id': 'id','cx': x, 'cy': y, 'r': sc.radius, 'color': color, 'homeGoals': game.homeGoals,
                         'awayGoals': game.awayGoals, 'date': game.date};
                circles.push(c);
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
    
    console.log('\n\nLeicester:');
    for(var i = 0; i < teamGames['Leicester'].length; i++) {
        console.log(teamGames['Leicester'][i].date + ' - ' + myApp.getTotalScore(teamGames['Leicester'][i].results));
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

myApp.run = function() 
{        
    myApp.readData();
}

window.onload = myApp.run;