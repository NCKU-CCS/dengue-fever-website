from lib import csv_io
from lib import json_io

dengue = csv_io.read_csv('../data/dengue_small_region.csv')
population = csv_io.read_csv('../data/population.csv')

dengue = dengue[0:]
population = population[0:]

data = {}
for row in dengue:
    if row[-3] not in data:
        data[row[-3]] = {}
        data[row[-3]]['dengue'] = 0
        data[row[-3]]['region'] = row[-5]
        data[row[-3]]['village'] = row[-4]
    data[row[-3]]['dengue'] += 1
    data[row[-3]]['lng'] = row[-1] 
    data[row[-3]]['lat'] = row[-2] 

print (len(data.keys()))
'''for region in data:
    if (data[region] > 1):
        print (data[region])'''

for region in population:
    code = region[2]
    people = region[4]
    if code in data:
        data[code]['ratio'] = float(data[code]['dengue']) / int(people)
        data[code]['people'] = people

count = 0
for region in data:
    if (data[region]['dengue'] < 10 or 'people' not in data[region]):
        continue

    if(data[region]['dengue'] > 20):
        data[region]['label'] = 1
    elif ('ratio' in data[region] and data[region]['ratio'] > 0.1):
        data[region]['label'] = 0

json_io.write_json('../data/tainan_height_ratio.json', data)
