using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace Bomberfun
{
    public class Position
    {
        public int X { get; set; }

        public int Y { get; set; }
    }

    public class GameHub : Hub
    {
        private static object _lock = new object();
        private static readonly ConcurrentDictionary<string, double> latestTimeStampForUser = new ConcurrentDictionary<string, double>();

        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            if (stopCalled)
            {
                Console.WriteLine(String.Format("Client {0} explicitly closed the connection.", Context.ConnectionId));
            }
            else
            {
                Console.WriteLine(String.Format("Client {0} timed out .", Context.ConnectionId));
            }

            var player = GameState.Instance.GetPlayerByConnectionId(Context.ConnectionId);
            if (player != null)
            {
                GameState.Instance.RemovePlayer(player);

                //TODO if in game send message opponent disconnected
                if (player.Group != null) Clients.OthersInGroup((string)player.Group).enemyDisconnected();
            }

            return base.OnDisconnected(stopCalled);
        }

        public bool Join(string userName)
        {
            var player = GameState.Instance.GetPlayer(userName);
            if (player != null)
            {
                Clients.Caller.playerExists();
                return true;
            }

            player = GameState.Instance.CreatePlayer(userName);
            player.ConnectionId = Context.ConnectionId;
            Clients.Caller.name = player.Name;
            Clients.Caller.hash = player.Hash;
            Clients.Caller.id = player.Id;

            Clients.Caller.playerJoined(player);

            return StartGame(player);
        }

        private bool StartGame(Player player)
        {
            if (player != null)
            {
                Player player2;
                var game = GameState.Instance.FindGame(player, out player2);
                if (game != null)
                {
                    Clients.Group(player2.Group).BuildBoard(game);
                    return true;
                }

                player2 = GameState.Instance.GetNewOpponent(player);
                if (player2 == null)
                {
                    player.isPlayer1 = true;
                    Clients.Caller.waitingList();
                    return true;
                }

                game = GameState.Instance.CreateGame(player, player2);

                var random = new Random();
                for (var i = 0; i < 11; i++)
                {
                    for (var j = 0; j < 13; j++)
                    {
                        if (i % 2 == 1 && (j == 1 || j == 3 || j == 5 || j == 7 || j == 9 || j == 11)) continue;

                        if (i == 0 && j == 0) continue;
                        if (i == 1 && j == 0) continue;
                        if (i == 0 && j == 1) continue;

                        if (i == 0 && j == 12) continue;
                        if (i == 0 && j == 11) continue;
                        if (i == 1 && j == 12) continue;

                        if (i == 10 && j == 0) continue;
                        if (i == 10 && j == 1) continue;
                        if (i == 9 && j == 0) continue;

                        if (i == 9 && j == 12) continue;
                        if (i == 10 && j == 11) continue;
                        if (i == 10 && j == 12) continue;

                        var crateChance = random.Next(0, 2);
                        if (crateChance == 1)
                        {
                            game.Crates.Add(new Position() { X = j, Y = i });
                        }
                    }
                }

                Clients.Caller.buildBoard(game.Crates, player.isPlayer1);
                Clients.OthersInGroup(player.Group).buildBoard(game.Crates, player2.isPlayer1);
                return true;
            }
            return false;
        }

        public void RequestBoardBuild()
        {
            var userName = Clients.Caller.name;
            Player player = GameState.Instance.GetPlayer(userName);

            if (player != null)
            {
                Player player2;
                var game = GameState.Instance.FindGame(player, out player2);
                if (game != null)
                {
                    Clients.Caller.buildBoard(game.Crates, player.isPlayer1);
                }
            }
        }

        public void PlayerMove(dynamic timeStamp, dynamic position)
        {
            var userName = Clients.Caller.name;
            Player player = GameState.Instance.GetPlayer(userName);

            if (player != null)
            {
                double latestTimeStamp;
                if (latestTimeStampForUser.TryGetValue(player.ConnectionId, out latestTimeStamp))
                {
                    if ((double)timeStamp < latestTimeStamp)
                    {
                        return;
                    }
                    else
                    {
                        latestTimeStampForUser[player.ConnectionId] = (double)timeStamp;
                    }
                }
                else
                {
                    latestTimeStampForUser[player.ConnectionId] = latestTimeStamp;
                }

                Player player2;
                var game = GameState.Instance.FindGame(player, out player2);
                if (game != null)
                {
                    Clients.OthersInGroup((string)player.Group).updatePlayerPosition(position);
                }
            }
        }

        public void LaidDownBomb(dynamic position, dynamic flame)
        {
            var userName = Clients.Caller.name;
            var player = GameState.Instance.GetPlayer(userName);
            if (player != null)
            {
                Player player2;
                var game = GameState.Instance.FindGame(player, out player2);
                if (game != null)
                {
                    Clients.OthersInGroup((string)player.Group).putDownBomb(position, flame);
                }
            }
        }

        public void Died()
        {
            var userName = Clients.Caller.name;
            var player = GameState.Instance.GetPlayer(userName);
            if (player != null)
            {
                Player player2;
                var game = GameState.Instance.FindGame(player, out player2);
                if (game != null)
                {
                    Clients.OthersInGroup((string)player.Group).enemyDied();
                }
            }
        }

        public void DestroyCrate(dynamic posX, dynamic posY)
        {
            var userName = Clients.Caller.name;
            var player = GameState.Instance.GetPlayer(userName);
            if (player != null)
            {
                Player player2;
                Game game = GameState.Instance.FindGame(player, out player2);
                if (game != null)
                {
                    var random = new Random();
                    posX = (int)Math.Round((double)posX);
                    posY = (int)Math.Round((double)posY);
                    if (!game.CratesDestroyed.Any(position => position.X == posX && position.Y == posY))
                    {
                        lock (_lock)
                        {
                            if (!game.CratesDestroyed.Any(position => position.X == posX && position.Y == posY))
                            {
                                var position = new Position() { X = posX, Y = posY };
                                game.CratesDestroyed.Add(position);
                                var powerupChance = random.Next(0, 2);
                                Clients.Group((string)player.Group).createPowerup(position, powerupChance);
                            }
                        }
                    }
                }
            }
        }

        public void RemovePowerup(dynamic posX, dynamic posY)
        {
            var userName = Clients.Caller.name;
            var player = GameState.Instance.GetPlayer(userName);
            if (player != null)
            {
                Player player2;
                Game game = GameState.Instance.FindGame(player, out player2);
                if (game != null)
                {
                    Clients.OthersInGroup((string)player.Group).destroyPowerup(posX, posY);
                }
            }
        }

        public void PlayerTurn(dynamic direction)
        {
            //            Debug.WriteLine((string)direction);
            direction = (string)direction;
            var userName = Clients.Caller.name;
            var player = GameState.Instance.GetPlayer(userName);
            if (player != null)
            {
                Player player2;
                var game = GameState.Instance.FindGame(player, out player2);
                if (game != null)
                {
                    Clients.OthersInGroup((string)player.Group).turnPlayer(direction);
                }
            }
        }

        public void StoppedMoving()
        {
            //            Debug.WriteLine("stopped moving");
            var userName = Clients.Caller.name;
            var player = GameState.Instance.GetPlayer(userName);
            if (player != null)
            {
                Player player2;
                var game = GameState.Instance.FindGame(player, out player2);
                if (game != null)
                {
                    Clients.OthersInGroup((string)player.Group).enemyStoppedMoving();
                }
            }
        }

        public void GameStarted(dynamic gameTime)
        {
        }
    }
}