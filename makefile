JS_FILES := $(wildcard js/*.js) $(wildcard js/*/*.js) $(wildcard js/*/*/*.js)

LEVEL_SRC_PATH := src/game/leveldata.ts


all: js


.PHONY: js
js:
	tsc

watch:
	tsc -w

server:
	python3 -m http.server


linecount:
	find . -name '*.ts' | xargs wc -l
	

pack_raw:
	mkdir -p temp
	cp -r assets temp/assets
	cp -r js temp/js
	cp index.html temp/index.html
	cp style.css temp/style.css
	(cd temp; zip -r ../dist.zip .)
	rm -rf ./temp

dist_raw: js pack_raw


.PHONY: closure
closure:
	rm -rf ./temp
	mkdir -p temp
	java -jar $(CLOSURE_PATH) --js $(JS_FILES) --js_output_file temp/out.js --compilation_level ADVANCED_OPTIMIZATIONS --language_out ECMASCRIPT_2020


compress: js closure


.PHONY: pack
pack:
	mkdir -p temp
	cp templates/index.html temp/index.html
	cp style.css temp/style.css
	cp -r assets temp/assets

.PHONY: zip
zip: 
	(cd temp; zip -r ../dist.zip .)
	wc -c dist.zip

.PHONY: clear_temp
clear_temp:
	rm -rf ./temp 


.PHONY: dist 
dist: compress pack zip clear_temp


.PHONY: test_temp
test_temp:
	(cd temp; python3 -m http.server 8001)


.PHONY: levels
levels:
	echo "export const LEVEL_DATA : {width : number, height : number, layers : number[][]} = " > $(LEVEL_SRC_PATH)
	./scripts/convertmap.py ./tiled/sample.tmx >> $(LEVEL_SRC_PATH)
	echo "export const COLLISION_DATA : {width : number, height : number, layers : number[][]} = " >> $(LEVEL_SRC_PATH)
	./scripts/convertmap.py ./tiled/collision_tiles.tmx -ignorefirst >> $(LEVEL_SRC_PATH)
