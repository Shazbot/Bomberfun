using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Bomberfun
{
    public class Game
    {
        public Player Player1 { get; set; }

        public Player Player2 { get; set; }

        public readonly ConcurrentBag<Position> CratesDestroyed = new ConcurrentBag<Position>();

        public readonly List<Position> Crates = new List<Position>();
    }
}