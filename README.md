# Tiny Platformer 13k (prototype)

## [Click here to play](https://jani-nykanen.github.io/tiny-platformer-13k/play)


This is a small platformer prototype I created to test my tools and code (and write it in the first place) for js13k 2024. It doesn't have much to play, only one level with one enemy type, but the main goal was to test my graphics generation code and my very barebones audio library. There is no music since I wanted to follow the size restrictions of the compo, even though this is just a warm-up game.


### Building

- When cloning the repo, make sure you have `git-lfs` installed. If not, you can find the proper asset files in "Releases".
- Run `make` to build the js source. You can run `make server` to start a test server at port 8000 to see it running. 
- Run `make CLOSURE_PATH=<path-to-closure> dist` to make a compressed zip file. Requires [Closure compiler](https://developers.google.com/closure/compiler). If everything goes fine, the resulting zip file should be exactly 13 309 bytes, three bytes lower than 13kB = 13 312 bytes!


### License

Umm, let's say... [MIT license](https://opensource.org/license/mit)? I don't believe anyone has any easy for my code, except maybe curiosity.


------------------------

(c) 2024 Jani Nykänen
