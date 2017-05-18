'use strict';

var myApp = {};
var games = [];
var teams = {};
var teamNames = [];
var teamGames = [];

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
        
//        console.log(teste.length);
        var n = myApp.calculateGamesPlayed('Leicester');
        
        myApp.populateTeamsData();
    });
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