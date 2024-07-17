#!/bin/python3

import xml.etree.ElementTree as ET
import sys


#
# Parse a layer in a CSV format. Returns
# an array of integers
#
def parse_layer(input : str) -> str:
    out : list[int] = []
    for i in input.replace("\n", "").split(","):
        out.append(int(i))
    return out


#
# Performs an RLE encoding for a list of integers
#
def RLE(input : list[int]) -> list[int]:
    out : list[int] = []
    value : int = input[0]
    count : int = 1
    for i in range(1, len(input)):
        if (input[i] != value):
            out.append(value)
            out.append(count)
            value = input[i]
            count = 1
            continue
        count += 1
    out.append(value)
    out.append(count)
    return out


path : str = sys.argv[1]
# For the collision tiles we want
# to ignore the first layer
ignorefirst : bool = False
for a in sys.argv:
    if a == "-ignorefirst":
        ignorefirst = True
        break

# Parse the file and get all the required info (dimensions & layers)
root : ET.Element = ET.parse(path).getroot()

width : int = root.attrib["width"]
height : int = root.attrib["height"]

# Parse layers (possibly ignoring the first one
# if needed)
layers : list[list[int]] = []
isfirst : bool = True
for l in root.iter("data"):
    if isfirst and ignorefirst:
        isfirst = False
        continue
    layers.append(RLE(parse_layer(l.text)))

# Construct the final JSON string
out : str = "{\n"
out += "width: " + str(width) + ",\n"
out += "height: " + str(height) + ",\n"
out += "layers: [\n"

for l in layers:
    out += "["
    for i in range(0, len(l)):
        out += str(l[i])
        if (i != len(l) - 1):
            out += ","
    out += "],\n"
out += "]};"

print(out)
