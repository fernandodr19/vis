'use strict';

var myApp = {};
var games = [];
var teams = {};
var teamNames = [];
var teamsTime = [];

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
        
        var result;
        result = game.result;
        if(result == 'H') 
            result = 'W';
        if (result == 'A') 
            result = 'L'
        
        if(teams[homeTeamName] == undefined) {
            teams[homeTeamName] = {'name': homeTeamName, 'results': result,'scoredGoals': +game.homeGoals, 
                                   'concededGoals': game.awayGoals, 
                                   'shots': game.homeShots, 'fouls': game.homeFouls, 'yellow': game.homeYellow, 'red': game.homeRed};
        } else {
            teams[homeTeamName].results += result;
            teams[homeTeamName].scoredGoals += +game.homeGoals;
            teams[homeTeamName].concededGoals += game.awayGoals;
            teams[homeTeamName].shots += game.homeShots;
            teams[homeTeamName].fouls += game.homeFouls;
            teams[homeTeamName].yellow += game.homeYellow;
            teams[homeTeamName].red += game.homeRed;
        }

        result = game.result;
        if(result == 'H') 
            result = 'L';
        if (result == 'A') 
            result = 'W'
        
        if(teams[awayTeamName] == undefined) {
            teams[awayTeamName] = {'name': awayTeamName, 'results': result,'scoredGoals': +game.awayGoals, 
                                   'concededGoals': game.homeGoals, 
                                   'shots': game.awayShots, 'fouls': game.awayFouls, 'yellow': game.awayYellow, 'red': game.awayRed};
        } else {
            teams[homeTeamName].results += result;
            teams[awayTeamName].scoredGoals += +game.awayGoals;
            teams[awayTeamName].concededGoals += game.homeGoals;
            teams[awayTeamName].shots += game.awayShots;
            teams[awayTeamName].fouls += game.awayFouls;
            teams[awayTeamName].yellow += game.awayYellow;
            teams[awayTeamName].red += game.awayRed;
        }
        
        ///////////////////////////////////////////////////
        
        var tsTeam = {'namex': homeTeamName};
        teamsTime[homeTeamName].push(tsTeam);
    }
    
    console.log(teamNames.length);
    console.log(Object.keys(teams).length);
    
    for(var i = 0; i < teamNames.length; i++) {
        var name = teamNames[i];
        console.log(teams[name].name + ' - ' + myApp.getTotalScore(teams[name].results));
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