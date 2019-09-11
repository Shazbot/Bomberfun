using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Bomberfun
{
    public class Player
    {
        public bool isPlayer1 { get; set; }

        public string Name { get; set; }

        public string Hash { get; set; }

        public string Id { get; set; }

        public string Group { get; set; }

        public string ConnectionId { get; set; }

        public bool IsPlaying { get; set; }

        public List<int> Matches { get; set; }

        public Player(string name, string hash)
        {
            Name = name;
            Hash = hash;

            Id = Guid.NewGuid().ToString("d");
            Matches = new List<int>();
        }
    }
}