from lib import csv_io
from lib import json_io

dengue = csv_io.read_csv('../data/dengue_small_region.csv')
population = csv_io.read_csv('../data/population.csv')

village = {}

for row in dengue:
    if not row[-4]:
        continue

    key = row[-5]+row[-4]
    if key not in village:
        village[key] = {}

    if row[-3] not in village[key]:
        village[key][row[-3]] = {}
        village[key][row[-3]]['dengue'] = 1
        village[key][row[-3]]['village'] = row[-4]
        village[key][row[-3]]['region'] = row[-5]
        village[key][row[-3]]['lat'] = row[-2]
        village[key][row[-3]]['lng'] = row[-1]
    else:
        village[key][row[-3]]['dengue'] += 1
        if village[key][row[-3]]['village'] != row[-4]:
            village[key][row[-3]]['village'] += ', ' + row[-4]

data = {}
for v in village:
    max_region = ''
    max_number = 0
    for region in village[v]:
        if village[v][region]['dengue'] > max_number:
            max_number = village[v][region]['dengue']
            max_region = region

    data[max_region] = village[v][max_region]

for region in population:
    code = region[2]
    people = region[4]
    if code in data:
        data[code]['ratio'] = float(data[code]['dengue']) / int(people)
        data[code]['people'] = people


json_io.write_json('../data/tainan_height_ratio_village.json', data)
